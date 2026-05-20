# Nashdown

Obsidian plugin for writing music chord charts in plain text — inspired by the Nashville Number System and 1Chart.

Renders fenced code blocks tagged ` ```nashdown ` or ` ```chart `.

---

## Frontmatter

```
title: Song Title
key: G
tempo: 96
time: 4/4
bardots: true      # filled dot between measures
barlines: true     # thin line between measures
zoom: 20%          # scale chart: positive = larger, negative = smaller
```

---

## Syntax

### Sections
```
[Verse]
[Chorus]
[Bridge]
```

### Rows
Measures separated by `|`. Each row is one line.
```
| 1 | 4 | 5 | 1 |
```

### Chords
| Syntax | Meaning |
|--------|---------|
| `1` `4` `5` | Nashville scale degrees |
| `G` `Am` `Bm7` | Letter chords |
| `b7` `#4` | Flat / sharp prefix |
| `1m` `1-` | Minor |
| `1maj7` `1dim` `1aug` | Quality |
| `1sus4` `1add9` | Sus / add |
| `G/B` `5/3` | Slash chord |

### Modifiers
| Syntax | Meaning |
|--------|---------|
| `>1` `<1` | Push — anticipation marker above chord |
| `'1` `''1` | Hits — tick marks above chord |
| `1.` `1..` | Beat duration — tick marks above chord |
| `1!` | Stab — short hit |
| `1^` | Fermata |
| `<1>` `<bA>` | Diamond — one strike, rings out |
| `X` | Rest / pause |
| `%` | Repeat previous measure |

### Annotations and comments
```
| G [rit.] |        # small italic label after measure
| {intro} G |       # small italic comment above measure
```

### Repeats
```
|: 1 | 4 | 5 :|        # repeat section
|: 1 | 4 | 5 :|3       # repeat 3 times (with sign)
| 1 | 4 | 5 |x3        # repeat count label only (no sign)
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
