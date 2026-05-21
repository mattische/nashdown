export interface ChartDocument {
  metadata: Metadata;
  sections: Section[];
}

export interface Metadata {
  title?: string;
  key?: string;
  tempo?: number;
  time?: string;
  barlines?: boolean;  // default false — thin line between measures
  bardots?: boolean;   // default false — filled dot between measures
  zoom?: number;       // signed %, applied as font-size: (100 + zoom)% on the chart root
  labels?: 'left' | 'top';  // section label position: above section (default) or left column
}

export interface Section {
  name: string;
  rows: Row[];
}

export interface Row {
  repeatStart: boolean;
  measures: Measure[];
  repeatEnd: boolean;
  repeatCount?: number;
}

export interface Measure {
  chords: ChordEntry[];
  annotation?: string;
  comment?: string;     // {text} prefix — small italic text above the measure
}

// A chord entry is either a real chord or a repeat-previous-measure marker
export type ChordEntry = ChordToken | RepeatMark;

export interface RepeatMark {
  kind: 'repeat';
}

export interface ChordToken {
  kind: 'chord';
  push: string;        // '>' or '<' prefix — anticipation marker shown above chord; '' = none
  hits: number;        // 0 = normal, 1 = ', 2 = '' (eighth-note hits)
  diamond: boolean;    // <G> — one strike, rings out
  flat: boolean;       // b prefix on root
  sharp: boolean;      // # suffix on root
  root: string;        // '1'–'7' (Nashville) or 'A'–'G' (letter)
  quality: string;     // '', 'm', 'maj', 'dim', 'aug', 'sus', 'add'
  extension: string;   // '', '7', 'maj7', '9', '11', etc.
  bass?: BassNote;     // /X — slash chord bass
  stab: boolean;       // ! suffix — short hit, then silence
  fermata: boolean;    // ^ suffix — hold/fermata
  beats?: number;      // trailing dots — number of beats: G. = 1, A.. = 2
}

export interface BassNote {
  flat: boolean;
  sharp: boolean;
  root: string;
  quality: string;
  hits?: number;
}
