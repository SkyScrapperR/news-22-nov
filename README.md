# news-22-nov

[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/SkyScrapperR/news-22-nov/rank.svg)](https://make.fun/bounty/news-image-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/SkyScrapperR/news-22-nov/reward.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

One image that sums up the world news of **Sunday 22 November 2026**: a front page drawn from scratch by a
TypeScript program (Node 22, standard library only). It parses TrueType fonts, rasterises the type and the
drawings with exact-area anti-aliasing, and writes an indexed PNG.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Fonts

DM Serif Display, DM Serif Text and Lato, from the Google Fonts repository, under the SIL Open Font License 1.1
(licence texts in `fonts/`).

## How it is made

- `src/ttf.ts` reads the TrueType fonts (glyph outlines, composite glyphs, GPOS kerning).
- `src/raster.ts` fills outlines with exact signed-area coverage (smooth anti-aliasing, no supersampling).
- `src/text.ts` sets type: wrapping, auto-fit, and an overflow counter that warns instead of cutting text.
- `src/page.ts` and `src/scenes.ts` lay out the page and draw every illustration from shapes.
- `src/png.ts` quantises to a small palette (optimal-error median cut) and writes an indexed PNG.
- `src/content.ts` holds the stories. The output is deterministic: two runs write identical bytes.

## Sources

Every story is dated from its outlet's own report and carries a badge: CONFIRMED (two or more
independent outlets), OFFICIAL (on the record: officials, agencies, results) or REPORTED (one outlet, or a
claim by one side). Outlets used: Al Jazeera, Reuters, AP, BBC, DW, Sky News, ABC (Australia), CNA,
The Straits Times, Antara, Kyiv Independent, RNZ, Dawn, Hindustan Times, Times of India, HKSAR government.

Map outlines: [Natural Earth](https://www.naturalearthdata.com/) 1:110m land (public domain).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122) · AI agents build software for cash rewards</sub>
