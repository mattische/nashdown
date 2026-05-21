import type {
  BassNote,
  ChartDocument,
  ChordEntry,
  ChordToken,
  Measure,
  Metadata,
  RepeatMark,
  Row,
  Section,
} from '../types';

export function parse(source: string): ChartDocument {
  const lines = source.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const metadata: Metadata = {};
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let metadataDone = false;

  for (const line of lines) {
    // Metadata key: value (only before first section header)
    if (!metadataDone && /^[a-z]+\s*:/i.test(line) && !line.startsWith('[')) {
      const colon = line.indexOf(':');
      const key = line.slice(0, colon).trim().toLowerCase();
      const value = line.slice(colon + 1).trim();
      if (key === 'title') metadata.title = value;
      else if (key === 'key') metadata.key = value;
      else if (key === 'tempo') metadata.tempo = parseInt(value, 10);
      else if (key === 'time') metadata.time = value;
      else if (key === 'barlines') metadata.barlines = value.toLowerCase() === 'true';
      else if (key === 'bardots') metadata.bardots = value.toLowerCase() === 'true';
      else if (key === 'zoom') {
        const n = parseInt(value, 10);
        if (!isNaN(n)) metadata.zoom = n;
      }
      else if (key === 'labels') {
        const v = value.toLowerCase();
        if (v === 'left' || v === 'top') metadata.labels = v as 'left' | 'top';
      }
      continue;
    }

    // Section header [Name] — optionally followed by a row on the same line
    // Matches: "[Verse]" or "[Verse] | G | C |"
    const sectionMatch = line.match(/^\[([^\]|]+)\](.*)/);
    if (sectionMatch) {
      metadataDone = true;
      currentSection = { name: sectionMatch[1].trim(), rows: [] };
      sections.push(currentSection);
      const remainder = sectionMatch[2].trim();
      if (remainder.includes('|')) {
        currentSection.rows.push(parseRow(remainder));
      }
      continue;
    }

    // Chart row — must contain at least one |
    if (line.includes('|') && currentSection) {
      metadataDone = true;
      currentSection.rows.push(parseRow(line));
    }
  }

  return { metadata, sections };
}

function parseRow(line: string): Row {
  let raw = line.trim();
  let repeatStart = false;
  let repeatEnd = false;
  let repeatCount: number | undefined;

  // Detect |: repeat start
  if (raw.startsWith('|:')) {
    repeatStart = true;
    raw = raw.slice(2).trim();
  }

  // Detect :| or :|N repeat end
  const repeatEndMatch = raw.match(/:\|(\d+)?\s*$/);
  if (repeatEndMatch) {
    repeatEnd = true;
    if (repeatEndMatch[1]) repeatCount = parseInt(repeatEndMatch[1], 10);
    raw = raw.slice(0, repeatEndMatch.index).trim();
  }

  // Detect |xN standalone repeat count (no repeat-end sign)
  if (!repeatEnd) {
    const countOnlyMatch = raw.match(/\|x(\d+)\s*$/i);
    if (countOnlyMatch) {
      repeatCount = parseInt(countOnlyMatch[1], 10);
      raw = raw.slice(0, countOnlyMatch.index).trim();
    }
  }

  // Split by | to get measure strings, filter empties
  const parts = raw.split('|').map(s => s.trim()).filter(s => s.length > 0);
  const measures: Measure[] = parts.map(parseMeasure);

  return { repeatStart, measures, repeatEnd, repeatCount };
}

function parseMeasure(raw: string): Measure {
  raw = raw.trim();

  // Extract trailing annotation [text]
  let annotation: string | undefined;
  const annotationMatch = raw.match(/\[([^\]]+)\]\s*$/);
  if (annotationMatch) {
    annotation = annotationMatch[1];
    raw = raw.slice(0, annotationMatch.index).trim();
  }

  // Extract leading comment {text}
  let comment: string | undefined;
  const commentMatch = raw.match(/^\{([^}]+)\}\s*/);
  if (commentMatch) {
    comment = commentMatch[1];
    raw = raw.slice(commentMatch[0].length).trim();
  }

  // Explicit grouping with ( ) — split the contents as individual chord tokens
  if (raw.startsWith('(') && raw.endsWith(')')) {
    raw = raw.slice(1, -1).trim();
  }

  // % = repeat previous measure marker
  if (raw === '%') {
    const entry: RepeatMark = { kind: 'repeat' };
    return { chords: [entry], annotation, comment };
  }

  const tokens = tokenizeMeasure(raw);
  const chords: ChordEntry[] = tokens.map(t => {
    if (t === '%') {
      const r: RepeatMark = { kind: 'repeat' };
      return r;
    }
    return parseChordToken(t);
  });

  return { chords, annotation, comment };
}

// Split measure string into individual chord strings, preserving <> diamonds intact
function tokenizeMeasure(raw: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inDiamond = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '<') {
      inDiamond = true;
      current += ch;
    } else if (ch === '>' && inDiamond) {
      inDiamond = false;
      current += ch;
    } else if (ch === ' ' && !inDiamond) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens.filter(t => t.length > 0);
}

function parseChordToken(raw: string): ChordToken {
  let s = raw;
  let push = '';
  let hits = 0;
  let diamond = false;
  let stab = false;
  let fermata = false;

  // Push prefix > or < (< only when not the start of a diamond <chord>)
  if (s.startsWith('>')) {
    push = '>';
    s = s.slice(1);
  }

  // Hits prefix '' or '
  if (s.startsWith("''")) {
    hits = 2;
    s = s.slice(2);
  } else if (s.startsWith("'")) {
    hits = 1;
    s = s.slice(1);
  }

  // Strip suffixes before diamond check so <chord>! works correctly
  if (s.endsWith('^')) {
    fermata = true;
    s = s.slice(0, -1);
  }
  if (s.endsWith('!')) {
    stab = true;
    s = s.slice(0, -1);
  }

  // Beat count: trailing dots (G. = 1 beat, A.. = 2 beats)
  let beats: number | undefined;
  let dotCount = 0;
  while (s.endsWith('.')) {
    dotCount++;
    s = s.slice(0, -1);
  }
  if (dotCount > 0) beats = dotCount;

  // Diamond wrapper <chord> — now that suffixes are stripped
  if (s.startsWith('<') && s.endsWith('>')) {
    diamond = true;
    s = s.slice(1, -1);
  } else if (s.startsWith('<')) {
    // < without matching > = push marker
    push = '<';
    s = s.slice(1);
  }

  // Rest / pause
  if (s === 'X' || s === 'x') {
    return { kind: 'chord', push, hits, diamond, flat: false, sharp: false, root: 'X', quality: '', extension: '', bass: undefined, stab, fermata, beats };
  }

  // Parse bass note /X
  let bass: BassNote | undefined;
  const slashIdx = s.lastIndexOf('/');
  if (slashIdx > 0) {
    bass = parseBassNote(s.slice(slashIdx + 1));
    s = s.slice(0, slashIdx);
  }

  // Parse root chord
  const { flat, sharp, root, quality, extension } = parseChordRoot(s);

  return { kind: 'chord', push, hits, diamond, flat, sharp, root, quality, extension, bass, stab, fermata, beats };
}

function parseChordRoot(s: string): { flat: boolean; sharp: boolean; root: string; quality: string; extension: string } {
  let flat = false;
  let sharp = false;
  let root = '';
  let quality = '';
  let extension = '';

  let i = 0;

  // Flat prefix b or sharp prefix # (only if followed by a digit or uppercase letter)
  if (s[i] === 'b' && i + 1 < s.length && /[1-7A-G]/.test(s[i + 1])) {
    flat = true;
    i++;
  } else if (s[i] === '#' && i + 1 < s.length && /[1-7A-G]/.test(s[i + 1])) {
    sharp = true;
    i++;
  }

  // Root note: digit 1-7 (Nashville) or letter A-G
  if (/[1-7]/.test(s[i])) {
    root = s[i];
    i++;
  } else if (/[A-G]/.test(s[i])) {
    root = s[i];
    i++;
  }

  // Sharp suffix on root (e.g. G#) — only if not already set as prefix
  if (!sharp && s[i] === '#') {
    sharp = true;
    i++;
  }

  // Quality: maj, min, m, dim, aug, sus, add, - (minor shorthand)
  const qualityPatterns = ['maj7', 'maj', 'min', 'dim', 'aug', 'sus4', 'sus2', 'sus', 'add', 'm', '-'];
  for (const q of qualityPatterns) {
    if (s.slice(i).startsWith(q)) {
      quality = q === '-' ? 'm' : q;
      i += q.length;
      break;
    }
  }

  // Extension: remaining digits/chars like 7, 9, 11, 13
  extension = s.slice(i);

  return { flat, sharp, root, quality, extension };
}

function parseBassNote(s: string): BassNote {
  let flat = false;
  let sharp = false;
  let root = '';
  let quality = '';
  let hits: number | undefined;
  let i = 0;

  // Strip trailing hits suffix (' or '')
  if (s.endsWith("''")) {
    hits = 2;
    s = s.slice(0, -2);
  } else if (s.endsWith("'")) {
    hits = 1;
    s = s.slice(0, -1);
  }

  if (s[i] === 'b' && i + 1 < s.length && /[1-7A-G]/.test(s[i + 1])) {
    flat = true;
    i++;
  } else if (s[i] === '#' && i + 1 < s.length && /[1-7A-G]/.test(s[i + 1])) {
    sharp = true;
    i++;
  }

  if (/[1-7A-G]/.test(s[i])) {
    root = s[i];
    i++;
  }

  if (!sharp && s[i] === '#') {
    sharp = true;
    i++;
  }

  const qualityPatterns = ['maj', 'min', 'm', 'dim', 'aug'];
  for (const q of qualityPatterns) {
    if (s.slice(i).startsWith(q)) {
      quality = q === 'min' ? 'm' : q;
      i += q.length;
      break;
    }
  }

  return { flat, sharp, root, quality, hits };
}
