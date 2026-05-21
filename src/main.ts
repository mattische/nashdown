import { App, Plugin, PluginSettingTab } from 'obsidian';
import { parse } from './parser';
import { render } from './renderer';

export default class NashdownPlugin extends Plugin {
  async onload() {
    const processor = (source: string, el: HTMLElement) => {
      try {
        el.innerHTML = render(parse(source));
      } catch (e) {
        el.innerHTML = `<div class="nd-error">Nashdown parse error: ${String(e)}</div>`;
      }
    };
    this.registerMarkdownCodeBlockProcessor('nashdown', processor);
    this.registerMarkdownCodeBlockProcessor('chart', processor);
    this.addSettingTab(new NashdownHelpTab(this.app, this));
  }

  onunload() {}
}

class NashdownHelpTab extends PluginSettingTab {
  constructor(app: App, plugin: NashdownPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('nd-help');
    containerEl.innerHTML = HELP_HTML;
  }
}

const HELP_HTML = `
<style>
.nd-help { max-width: 740px; }
.nd-help h2 { margin-bottom: 0.2em; }
.nd-help h3 { margin-top: 1.6em; margin-bottom: 0.35em; border-bottom: 1px solid var(--color-base-30, #ddd); padding-bottom: 0.2em; }
.nd-help h4 { margin-top: 0.9em; margin-bottom: 0.25em; font-size: 0.92em; font-weight: 600; color: var(--color-base-60, #888); }
.nd-help p  { margin: 0.25em 0 0.7em; line-height: 1.5; }
.nd-help table { border-collapse: collapse; margin: 0.4em 0 1em; font-size: 0.88em; width: auto; }
.nd-help th, .nd-help td { text-align: left; padding: 0.25em 1.4em 0.25em 0; border-bottom: 1px solid var(--color-base-25, #e8e8e8); vertical-align: top; }
.nd-help th { font-weight: 600; color: var(--color-base-60, #888); font-size: 0.83em; letter-spacing: 0.05em; text-transform: uppercase; border-bottom-color: var(--color-base-40, #ccc); }
.nd-help pre { background: var(--code-background, #f5f5f5); padding: 0.65em 1em; border-radius: 5px; margin: 0.35em 0 0.9em; font-size: 0.84em; overflow-x: auto; white-space: pre; }
.nd-help code { font-family: var(--font-monospace, monospace); font-size: 0.87em; background: var(--code-background, #f5f5f5); padding: 0.1em 0.35em; border-radius: 3px; }
.nd-help pre code { background: none; padding: 0; font-size: 1em; }
.nd-help hr { border: none; border-top: 1px solid var(--color-base-30, #ddd); margin: 1.6em 0; }
</style>

<h2>Nashdown</h2>
<p>Write music chord charts in plain text. Use fenced code blocks tagged <code>nashdown</code> or <code>chart</code>.</p>

<hr>

<h3>Frontmatter</h3>
<p>Optional key/value lines at the top of the block, before any section headers.</p>
<table>
  <tr><th>Key</th><th>Value</th><th>Description</th></tr>
  <tr><td><code>title</code></td><td>text</td><td>Song title</td></tr>
  <tr><td><code>key</code></td><td><code>G</code>, <code>Eb</code></td><td>Key signature</td></tr>
  <tr><td><code>tempo</code></td><td>number</td><td>BPM</td></tr>
  <tr><td><code>time</code></td><td><code>4/4</code>, <code>3/4</code></td><td>Time signature</td></tr>
  <tr><td><code>barlines</code></td><td><code>true</code></td><td>Thin lines between measures</td></tr>
  <tr><td><code>bardots</code></td><td><code>true</code></td><td>Dots between measures</td></tr>
  <tr><td><code>zoom</code></td><td><code>20</code>, <code>-10</code></td><td>Font size offset in %</td></tr>
  <tr><td><code>labels</code></td><td><code>top</code> · <code>left</code> · <code>none</code></td><td>Section label position (default: <code>top</code>)</td></tr>
</table>

<h3>Sections</h3>
<p>Section name in <code>[square brackets]</code>. Rows before any header go in an anonymous section.</p>
<pre><code>[Verse]
[Chorus]
[Bridge]</code></pre>

<h3>Rows</h3>
<p>With bar separators — each cell between <code>|</code> is one measure:</p>
<pre><code>| C | G | Am | F |</code></pre>
<p>Without bar separators — each space-separated token is one measure:</p>
<pre><code>C G Am F</code></pre>

<h3>Grouping</h3>
<p>Wrap chords in <code>( )</code> to place them in one measure (rendered with an underline):</p>
<pre><code>| (C G) | Am | F |
C (G Am) F</code></pre>

<h3>Chords</h3>
<h4>Nashville — scale degrees 1–7</h4>
<pre><code>1   4   5   b7   #4   b3</code></pre>
<h4>Letter chords — A–G</h4>
<pre><code>C   Am   Bm7   G#   Eb</code></pre>
<h4>Qualities</h4>
<table>
  <tr><th>Suffix</th><th>Meaning</th></tr>
  <tr><td><code>m</code> or <code>-</code></td><td>Minor</td></tr>
  <tr><td><code>maj7</code></td><td>Major 7</td></tr>
  <tr><td><code>dim</code></td><td>Diminished</td></tr>
  <tr><td><code>aug</code></td><td>Augmented</td></tr>
  <tr><td><code>sus4</code> &nbsp; <code>sus2</code></td><td>Suspended</td></tr>
  <tr><td><code>add9</code></td><td>Add</td></tr>
  <tr><td><code>7</code> &nbsp; <code>9</code> &nbsp; <code>11</code> &nbsp; <code>13</code></td><td>Extensions</td></tr>
</table>
<h4>Slash chord</h4>
<pre><code>G/B   5/3   b7/5</code></pre>

<h3>Modifiers</h3>
<table>
  <tr><th>Syntax</th><th>Meaning</th></tr>
  <tr><td><code>&gt;1</code></td><td>Push right — anticipation marker above chord</td></tr>
  <tr><td><code>&lt;1</code></td><td>Push left — anticipation marker above chord</td></tr>
  <tr><td><code>'1</code></td><td>One hit mark above chord</td></tr>
  <tr><td><code>''1</code></td><td>Two hit marks above chord</td></tr>
  <tr><td><code>1.</code></td><td>One beat dot above chord</td></tr>
  <tr><td><code>1..</code></td><td>Two beat dots above chord</td></tr>
  <tr><td><code>1!</code></td><td>Stab — short hit, then silence</td></tr>
  <tr><td><code>1^</code></td><td>Fermata — hold</td></tr>
  <tr><td><code>&lt;1&gt;</code></td><td>Diamond — one strike, rings out</td></tr>
  <tr><td><code>X</code></td><td>Rest / silence</td></tr>
  <tr><td><code>%</code></td><td>Repeat previous measure</td></tr>
</table>
<p>Modifiers combine: <code>''1!</code> (two hits + stab) &nbsp;·&nbsp; <code>&lt;G/B&gt;</code> (diamond slash) &nbsp;·&nbsp; <code>G/B'</code> (hit on bass note)</p>

<h3>Annotations &amp; Comments</h3>
<pre><code>| G [rit.] |      # label after the measure (small italic)
| {build} G |     # comment above the measure (small italic)</code></pre>

<h3>Repeats</h3>
<pre><code>|: 1 | 4 | 5 :|       # repeat section
|: 1 | 4 | 5 :|3      # repeat 3 times (shown with sign)
| 1 | 4 | 5 |x3       # count label only (no sign)</code></pre>

<h3>Endings</h3>
<p>Prefix a row with <code>N.|</code> to mark it as a numbered ending. Endings render inline after the preceding row inside a volta bracket. Put <code>:|</code> on the last ending to close the repeat.</p>
<pre><code>|: C | G | Am | F |
1.| Em | D |
2.| C :|</code></pre>

<hr>

<h3>Complete example</h3>
<pre><code>title: Example Song
key: G
tempo: 96
time: 4/4
bardots: true

[Intro]
| 1 | 1'' b7/5 | 1 | 1 |

[Verse]
|: 1'' b7/5 | 4 | 4 | 5 | % :|

[Pre-Chorus]
| {build} 6m | 6m | 4 | 4 |
| &gt;5 | 5! | X | X |

[Chorus]
|: 1 | 5 | 6m | 4 :|3

[Bridge]
| &lt;b7&gt; | (4'' b3' [rit.]) | &gt;1 |

[Outro]
| 1.. | &lt;#1&gt; | 4 | 1^ |</code></pre>
`;
