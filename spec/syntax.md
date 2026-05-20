# Nashdown Syntax Reference

Nashdown is a plain-text format for writing music chord charts, inspired by the Nashville Number System and apps like 1Chart. It is rendered by the Nashdown Obsidian plugin when used inside a fenced code block tagged `nashdown` or `chart`.

## Code block

````
```nashdown
title: My Song
key: G
tempo: 120
time: 4/4

[Verse]
| 1 | 4 | 5 | 1 |
```
````

---

## Metadata

Written as `key: value` lines before the first section. All fields optional.

| Field   | Example       | Description              |
|---------|---------------|--------------------------|
| `title` | `title: Amen` | Song title               |
| `key`   | `key: G`      | Key signature            |
| `tempo` | `tempo: 96`   | Beats per minute         |
| `time`  | `time: 3/4`   | Time signature           |

---

## Sections

A section header is a name in square brackets on its own line.

```
[Intro]
[Verse 1]
[Chorus]
[Bridge]
[Outro]
```

---

## Rows and measures

A row is a line containing `|` characters. Measures are delimited by `|`.

```
| 1 | 4 | 5 | 1 |
```

### Multiple chords per measure

Space-separated chords within a measure are split evenly across the available beats.

```
| G A |        → G for 2 beats, A for 2 beats (in 4/4)
| G A B C |    → 1 beat each (in 4/4)
```

Use parentheses to make an explicit grouping visually clear, or to indicate beats for uneven splits:

```
| (G A) |      → same as above, explicit
| (G:3 A:1) |  → G for 3 beats, A for 1 beat
```

### Repeat previous measure

```
| 1 | 4 | % | % |
```

`%` repeats the content of the preceding measure.

### Annotations

Trailing text in `[brackets]` within a measure is rendered as a performance note.

```
| (4'' b3' [rit.]) |
```

---

## Chords

### Nashville Number System

Uses scale degrees 1–7. Flat/sharp prefix with `b` / `#`.

```
1   4   5   6m   b7   #4dim
```

### Letter chords

Standard chord names.

```
G   C   Am   D7   Em/D   Bb   F#m
```

### Quality suffixes

| Suffix     | Meaning         | Rendered as |
|------------|-----------------|-------------|
| `m` or `-` | Minor           | −           |
| `maj`      | Major 7th type  | △           |
| `dim`      | Diminished      | °           |
| `aug`      | Augmented       | +           |
| `sus`      | Suspended       | sus         |
| `sus2`     | Sus 2           | sus2        |
| `sus4`     | Sus 4           | sus4        |

### Extensions

Appended directly after the quality: `7`, `maj7`, `9`, `11`, `13`, `add9`, etc.

```
G7    Cmaj7    Am9    Dsus4    b7
```

### Slash chords

Bass note after `/`.

```
Em/D    4/1    b7/5    D/F#
```

---

## Chord modifiers

All modifiers are combinable. Order in source: `[>]['][<] chord [>][!][^]`

| Modifier  | Position | Meaning                              | Example    |
|-----------|----------|--------------------------------------|------------|
| `>`       | prefix   | Push — anticipation before the beat  | `>G`       |
| `'`       | prefix   | One eighth-note hit                  | `'G`       |
| `''`      | prefix   | Two eighth-note hits                 | `''G`      |
| `<` … `>` | wrapper  | Diamond — one strike, rings out      | `<G>`      |
| `!`       | suffix   | Stab — short hit, then silence       | `G!`       |
| `^`       | suffix   | Fermata — hold                       | `^1`       |

### Combinations

```
>G!          push + stab
>''<G>       push + two hits + diamond
>''<G>!^     push + two hits + diamond + stab + fermata
>''1/5       push + two hits + slash chord
```

---

## Arrangement

### Repeat signs

```
|: measures :| 
|: measures :|3      → repeat 3 times
```

### Phrase separator (double bar)

Use `||` as a visual phrase separator within a row.

```
| 1 | 4 | 5 | % || 1 | 4 | 5 | 1 |
```

---

## Full example

```nashdown
title: Amen
key: G
tempo: 96
time: 3/4

[Intro]
| 1 | (1'' b7/5') | 1 | 1 |

[Verse 1]
|: (1'' b7/5') | 4 | 4 | 5 | % | (1'' b7/5') | 4 | 4 | b3 |
   (1'' b7/5') | 4 | 4 | 5 | % | (1'' b7/5') | 4 | (4'' b3') | 1 :|

[Chorus]
| 6m | b7 | 1 | 1 | % | 6m | b7 | 1 | 1 :|3

[Chorus 4]
| 6m | b7 | 1 | 1 | % | 6m | b7 | 1 | 1 |

[Outro]
| b7 | 4 | 1 | 1 | % | b7 | 4 | 1 | 1 |
| b7 | 4 | 1 | 1 | % | b7 | 4 | 1 | 1 |
| <b7> | (4'' b3' [rit.]) | ^1 |
```
