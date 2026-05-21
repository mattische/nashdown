import type {
  BassNote,
  ChartDocument,
  ChordEntry,
  ChordToken,
  Measure,
  Row,
  Section,
} from '../types';

type SepStyle = 'none' | 'line' | 'dot';

export function render(doc: ChartDocument): string {
  const sep: SepStyle = doc.metadata.bardots
    ? 'dot'
    : doc.metadata.barlines
    ? 'line'
    : 'none';

  const classes = ['nd-chart'];
  if (sep === 'line') classes.push('nd-barlines');
  if (sep === 'dot')  classes.push('nd-bardots');
  if (doc.metadata.labels === 'left') classes.push('nd-labels-left');

  const zoomStyle = doc.metadata.zoom !== undefined
    ? ` style="font-size: ${100 + doc.metadata.zoom}%"`
    : '';

  const parts: string[] = [];
  parts.push(`<div class="${classes.join(' ')}"${zoomStyle}>`);
  parts.push(renderHeader(doc));
  for (const section of doc.sections) {
    parts.push(renderSection(section, sep));
  }
  parts.push('</div>');
  return parts.join('\n');
}

function renderHeader(doc: ChartDocument): string {
  const { metadata } = doc;
  if (!metadata.title && !metadata.tempo && !metadata.time && !metadata.key) return '';

  const meta: string[] = [];
  if (metadata.tempo) meta.push(`<span class="nd-meta-item">Tempo: ${metadata.tempo}</span>`);
  if (metadata.time)  meta.push(`<span class="nd-meta-item">Time Sig: ${esc(metadata.time)}</span>`);
  if (metadata.key)   meta.push(`<span class="nd-meta-item">Key: ${esc(metadata.key)}</span>`);

  return `<div class="nd-header">
  ${metadata.title ? `<h2 class="nd-title">${esc(metadata.title)}</h2>` : ''}
  ${meta.length ? `<div class="nd-meta">${meta.join('')}</div>` : ''}
</div>`;
}

function renderSection(section: Section, sep: SepStyle): string {
  const rows = section.rows.map(row => renderRow(row, sep)).join('\n');
  return `<div class="nd-section">
  <div class="nd-section-label">${esc(section.name)}</div>
  <div class="nd-section-content">${rows}</div>
</div>`;
}

const DOTS = '<span class="nd-rep-dots"><span class="nd-rep-dot"></span><span class="nd-rep-dot"></span></span>';

function renderRow(row: Row, sep: SepStyle): string {
  const measureHtmls = row.measures
    .map(renderMeasure)
    .filter(m => m !== '');

  const sepHtml = sep === 'line'
    ? '<span class="nd-sep nd-sep-line"></span>'
    : sep === 'dot'
    ? '<span class="nd-sep nd-sep-dot">&#x2022;</span>'
    : '';

  // Separators injected BETWEEN measures only — never at start or end
  const content = measureHtmls.join(sepHtml);

  const start = row.repeatStart
    ? `<span class="nd-repeat-marker nd-repeat-start"><span class="nd-rep-thin"></span><span class="nd-rep-thick"></span>${DOTS}</span>`
    : '';
  const countHtml = row.repeatCount ? `<span class="nd-repeat-count">${row.repeatCount}x</span>` : '';
  const end = row.repeatEnd
    ? `<span class="nd-repeat-marker nd-repeat-end">${DOTS}<span class="nd-rep-thick"></span><span class="nd-rep-thin"></span>${countHtml}</span>`
    : countHtml;

  return `<div class="nd-row">${start}${content}${end}</div>`;
}

function renderMeasure(measure: Measure): string {
  if (measure.chords.length === 0) return '';
  const isMulti = measure.chords.filter(c => c.kind !== 'repeat').length > 1;
  const chords = measure.chords.map(renderChordEntry).join('');
  const annotation = measure.annotation
    ? `<span class="nd-annotation">${esc(measure.annotation)}</span>`
    : '';
  const comment = measure.comment
    ? `<span class="nd-measure-comment">${esc(measure.comment)}</span>`
    : '';
  const innerClass = isMulti ? 'nd-measure-inner nd-multi' : 'nd-measure-inner';
  return `<div class="nd-measure"><div class="nd-measure-main">${comment}<div class="${innerClass}">${chords}</div></div>${annotation}</div>`;
}

function renderChordEntry(entry: ChordEntry): string {
  if (entry.kind === 'repeat') {
    return '<div class="nd-chord nd-chord-repeat"><div class="nd-chord-body"><span class="nd-root">%</span></div></div>';
  }
  return renderChord(entry);
}

function renderChord(token: ChordToken): string {
  const isNashville = /^[1-7]$/.test(token.root);
  const classes = ['nd-chord'];
  if (token.diamond) classes.push('nd-diamond');
  if (token.root === 'X') classes.push('nd-rest');
  if (token.bass) classes.push('nd-has-bass');

  const fermataHtml = token.fermata
    ? '<div class="nd-fermata">&#x1D110;</div>'
    : '';
  const hitsHtml = token.hits > 0
    ? `<div class="nd-ticks">${'<span class="nd-tick">\'</span>'.repeat(token.hits)}</div>`
    : '';
  const beatsHtml = token.beats && token.beats > 0
    ? `<div class="nd-ticks">${'<span class="nd-tick">\'</span>'.repeat(token.beats)}</div>`
    : '';

  const flatHtml  = token.flat  ? '<span class="nd-acc nd-flat">&#x266D;</span>' : '';
  const sharpHtml = token.sharp ? '<span class="nd-acc nd-sharp">&#x266F;</span>' : '';
  const rootHtml  = `<span class="nd-root">${esc(token.root)}</span>`;
  const qualHtml  = formatQuality(token.quality, isNashville);
  const extHtml   = token.extension ? `<span class="nd-ext">${esc(token.extension)}</span>` : '';
  const stabHtml  = token.stab ? '<span class="nd-stab-mark">!</span>' : '';

  // Chord body never contains bass — bass is a sibling in the flex-row slash layout
  const innerBody = `<div class="nd-chord-body">${flatHtml}${sharpHtml}${rootHtml}${qualHtml}${extHtml}${stabHtml}</div>`;
  const body = token.diamond ? `<div class="nd-diamond-box">${innerBody}</div>` : innerBody;

  const aboveItems = [
    token.push ? `<div class="nd-push-above">${esc(token.push)}</div>` : '',
    fermataHtml,
    hitsHtml,
    beatsHtml,
  ].filter(Boolean).join('');
  const aboveHtml = aboveItems ? `<div class="nd-chord-above">${aboveItems}</div>` : '';

  if (token.bass) {
    // Slash chord: nd-chord is a flex row (nd-has-bass).
    // Main part is a flex column (nd-chord-main) so above items sit over just the main root.
    // Bass part (slash + nd-bass or nd-bass-chord) is a sibling, aligned at the bottom.
    const mainHtml = `<div class="nd-chord-main">${aboveHtml}${body}</div>`;
    return `<div class="${classes.join(' ')}">${mainHtml}${renderBass(token.bass)}</div>`;
  }

  return `<div class="${classes.join(' ')}">${aboveHtml}${body}</div>`;
}

function renderBass(bass: BassNote): string {
  const flat  = bass.flat  ? '<span class="nd-acc nd-flat nd-b-acc">&#x266D;</span>' : '';
  const sharp = bass.sharp ? '<span class="nd-acc nd-sharp nd-b-acc">&#x266F;</span>' : '';
  const root  = `<span class="nd-b-root">${esc(bass.root)}</span>`;
  const qual  = bass.quality === 'm' ? '<span class="nd-b-qual">m</span>' : '';
  const slashHtml = '<span class="nd-slash">/</span>';
  const bassBodyHtml = `<span class="nd-bass">${flat}${root}${sharp}${qual}</span>`;

  if (bass.hits && bass.hits > 0) {
    const ticks = '<span class="nd-tick">\'</span>'.repeat(bass.hits);
    return `${slashHtml}<div class="nd-bass-chord"><div class="nd-ticks">${ticks}</div>${bassBodyHtml}</div>`;
  }

  return `${slashHtml}${bassBodyHtml}`;
}

function formatQuality(quality: string, isNashville: boolean): string {
  if (!quality) return '';
  switch (quality) {
    case 'm':
      return isNashville
        ? '<span class="nd-qual nd-minor">&#x2212;</span>'
        : '<span class="nd-qual-m">m</span>';
    case 'maj':  return '<span class="nd-qual">&#x25B3;</span>';
    case 'maj7': return '<span class="nd-qual">&#x25B3;7</span>';
    case 'dim':  return '<span class="nd-qual">&#xB0;</span>';
    case 'aug':  return '<span class="nd-qual">+</span>';
    default:     return `<span class="nd-qual">${esc(quality)}</span>`;
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
