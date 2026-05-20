import { Plugin } from 'obsidian';
import { parse } from './parser';
import { render } from './renderer';

export default class NashdownPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('nashdown', (source, el) => {
      try {
        el.innerHTML = render(parse(source));
      } catch (e) {
        el.innerHTML = `<div class="nd-error">Nashdown parse error: ${String(e)}</div>`;
      }
    });

    this.registerMarkdownCodeBlockProcessor('chart', (source, el) => {
      try {
        el.innerHTML = render(parse(source));
      } catch (e) {
        el.innerHTML = `<div class="nd-error">Nashdown parse error: ${String(e)}</div>`;
      }
    });
  }

  onunload() {}
}
