# onemusic.online — Free Tools Site

Top-of-funnel static site for One Music Media. Free browser tools + SEO content that route visitors into **MusicTrainerPro**. Strategy rationale in [`../../docs/10-onemusic-online-concept.md`](../../docs/10-onemusic-online-concept.md).

## Stack

Pure static — HTML + CSS + vanilla JS. No build step, no framework, no backend. Chosen for:
- **SEO** — fast, crawlable, zero JS-render dependency.
- **Cost** — serve from any static host / the existing Contabo VPS nginx; ~zero marginal cost.
- **Speed to ship** — tools work in-browser via the Web Audio API.

Brand DNA matches MusicTrainerPro (indigo `#4338CA` · emerald `#34D399` · deep `#1E1B4B`, Inter + Bricolage Grotesque, light/dark via `data-theme`).

## Structure

```
OneMusicOnline/
  index.html                 # landing — hero, tool grid, CTAs to MusicTrainerPro
  tools/
    metronome.html           # working metronome (Web Audio lookahead scheduler)
    tuner.html               # working chromatic tuner (mic + autocorrelation pitch detection)
    ear-trainer.html         # working interval-recognition quiz (synthesized tones)
    scale-explorer.html      # working scale viewer + piano keyboard + playback
  blog/
    index.html               # content hub (Content Agent appends cards here)
    how-to-practice-as-an-adult.html
    how-to-memorize-a-piece.html
  assets/
    css/site.css             # shared design system
    js/theme.js              # dark/light toggle + persistence
    js/metronome.js          # metronome engine
    js/tuner.js              # tuner engine
    js/ear-trainer.js        # ear-trainer quiz engine
    js/scale-explorer.js     # scale computation + piano render + playback
  robots.txt
  sitemap.xml
```

## Working Tools (live)

- **Metronome** — sample-accurate Web Audio scheduling, accent beats, time signatures, keyboard (spacebar) control.
- **Tuner** — microphone pitch detection via autocorrelation, cents-accurate, fully client-side (audio never leaves the device).
- **Ear Trainer** — interval-recognition quiz with synthesized tones, instant feedback, score/streak/best tracking.
- **Scale & Chord Explorer** — 12 scale types across all roots; highlights notes on an interactive piano, plays the scale and individual keys.

## Run Locally

No build. Serve the folder over HTTP (the tuner needs a secure/localhost context for mic access):

```bash
cd projects/OneMusicOnline
python3 -m http.server 8080
# open http://localhost:8080
```

> The tuner requires `https://` or `localhost` — `getUserMedia` is blocked on plain `file://` and insecure origins.

## Deploy

Static files. Options:
- nginx on the existing Contabo VPS (add an `onemusic.online` server block → root this folder).
- Or any static host (Cloudflare Pages, Netlify) if preferring CDN.

Reuse the existing GitHub Actions pipeline pattern for deployment.

## Roadmap (per docs/10)

**Phase 1 (now):** metronome + tuner + ear trainer + scale explorer + content hub. ✅ done
**Phase 2:** marketplace discovery + community (after MusicTrainerPro marketplace has supply).

## Automation Hooks

- Content Agent appends article cards in `blog/index.html` (see marker comment) and publishes new article pages following the existing article template. SOPs in [`../../docs/08-organization-and-processes.md`](../../docs/08-organization-and-processes.md).
- Keep `sitemap.xml` updated when adding pages.
