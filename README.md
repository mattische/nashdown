# Nashdown

Obsidian plugin for writing music chord charts in plain text — inspired by the Nashville Number System and 1Chart.

Renders fenced code blocks tagged ` ```nashdown ` or ` ```chart `.

---

## Frontmatter

Optional key/value lines at the top of the block, before any section headers.

| Key | Value | Description |
|-----|-------|-------------|
| `title` | text | Song title, shown as heading |
| `key` | e.g. `G`, `Eb` | Key signature |
| `tempo` | number | BPM |
| `time` | e.g. `4/4`, `3/4` | Time signature |
| `barlines` | `true` | Thin vertical lines between measures |
| `bardots` | `true` | Filled dots between measures |
| `zoom` | signed number | Font size offset in % (`20` = larger, `-10` = smaller) |
| `labels` | `top` · `left` · `none` | Section label position (default: `top`) |

---

## Sections

Section headers in `[square brackets]`. Content rows follow until the next header.

```
[Verse]
| C | G | Am | F |

[Chorus]
| F | G | C | C |
```

Rows before any section header are rendered in an anonymous section.

---

## Rows

**With bar separators** — each cell between `|` is one measure:
```
| C | G | Am | F |
```

**Without bar separators** — each space-separated token is one measure:
```
C G Am F
```

Both styles can be mixed within a section.

---

## Grouping

Wrap multiple chords in `( )` to place them all in one measure. The group is rendered with an underline.

```
| (C G) | Am | F |
C (G Am) F
```

---

## Chords

**Nashville** (scale degrees 1–7):
```
1   2   3   4   5   6   7
b7  #4  b3
```

**Letter chords** (A–G):
```
C   Am   Bm7   G#   Eb
```

**Qualities:**

| Suffix | Meaning |
|--------|---------|
| `m` or `-` | Minor |
| `maj7` | Major 7 |
| `dim` | Diminished |
| `aug` | Augmented |
| `sus4` `sus2` | Suspended |
| `add9` | Add |
| `7` `9` `11` `13` | Extensions |

**Slash chord:**
```
G/B   5/3   b7/5
```

---

## Modifiers

| Syntax | Meaning |
|--------|---------|
| `>1` | Push right — anticipation marker shown above |
| `<1` | Push left — anticipation marker shown above |
| `'1` | One hit mark above chord |
| `''1` | Two hit marks above chord |
| `1.` | One beat dot above chord |
| `1..` | Two beat dots above chord |
| `1!` | Stab — short hit, then silence |
| `1^` | Fermata — hold |
| `<1>` | Diamond — one strike, rings out |
| `X` | Rest / silence |
| `%` | Repeat previous measure |

Modifiers combine freely: `''1!` (two hits + stab), `<G/B>` (diamond slash chord), `G/B'` (hit on bass note).

---

## Annotations and comments

```
| G [rit.] |        # small italic label displayed after the measure
| {build} G |       # small italic comment displayed above the measure
```

---

## Repeats

```
|: 1 | 4 | 5 :|        # repeat section (double barline with dots)
|: 1 | 4 | 5 :|3       # repeat 3 times (shown with sign)
| 1 | 4 | 5 |x3        # repeat count label only (no sign)
```

---

## Endings (volta brackets)

Prefix a row with `N.|` to mark it as a numbered ending. Endings render inline on the same line as the preceding row, each inside a volta bracket. Put `:|` on the last ending row to close the repeat.

```
|: C | G | Am | F |
1.| Em | D |
2.| C :|
```

---

## Complete example

~~~nashdown
title: Example Song
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
| >5 | 5! | X | X |

[Chorus]
|: 1 | 5 | 6m | 4 :|3

[Bridge]
| <b7> | (4'' b3' [rit.]) | >1 |

[Outro]
| 1.. | <#1> | 4 | 1^ |
~~~

---

## Installation

### Via BRAT (recommended)
1. Install the **BRAT** community plugin in Obsidian
2. BRAT → *Add Beta plugin* → paste this repo's GitHub URL
3. Enable Nashdown in Settings → Community plugins

### Manual
Copy `main.js`, `styles.css`, and `manifest.json` into:
```
<vault>/.obsidian/plugins/nashdown/
```
Then enable the plugin in Obsidian settings.

---

## Releases

Create a new release:
```bash
gh release create vX.Y.Z main.js styles.css manifest.json --title "vX.Y.Z" --notes "notes"
```

Build and release pipeline:
```bash
npm run build
git add src/ styles.css package.json manifest.json
git commit -m "what changed"
git tag vX.Y.Z
git push origin master --tags
gh release create vX.Y.Z main.js styles.css manifest.json --title "vX.Y.Z" --notes "notes"
```
