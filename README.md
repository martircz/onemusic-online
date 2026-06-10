# One Music Online

**onemusic.online** — Free tools and practice guides for musicians.

## Product

A collection of free, browser-based music tools:

- **Metronome** — Sample-accurate Web Audio metronome with adjustable BPM, time signatures, and accent beats
- **Chromatic Tuner** — Real-time pitch detection from your microphone, cents-accurate
- **Ear Trainer** — Interval recognition drills with scoring, streaks, and reference songs
- **Scale & Chord Explorer** — Any root, any scale — see it on a piano and hear it played

All tools work in the browser with no download, signup, or ads. Built on the same audio engine that powers [MusicTrainerPro](https://musictrainer.pro).

## Design

- **Palette:** ink + navy (matches One Music Media corporate site)
- **Typography:** Inter via Google Fonts
- **Theme:** light/dark with system preference detection and localStorage persistence
- **Icons:** inline SVG, no emoji
- **SEO:** semantic HTML5, JSON-LD structured data, Open Graph, Twitter cards

## Structure

```
onemusic.online/
  index.html                      # Homepage
  tools/
    metronome.html                # Metronome tool
    tuner.html                    # Chromatic tuner
    ear-trainer.html              # Ear trainer
    scale-explorer.html           # Scale explorer
  blog/
    index.html                    # Guides index
    how-to-practice-as-an-adult.html
    how-to-memorize-a-piece.html
  assets/
    css/site.css                  # Shared design system
    js/
      theme.js                    # Theme toggle + scroll effects
      metronome.js
      tuner.js
      ear-trainer.js
      scale-explorer.js
  robots.txt
  sitemap.xml
```

## Tech

- Pure HTML, CSS, JavaScript. No build step, no dependencies.
- Web Audio API for sound generation (metronome, ear trainer, scale explorer).
- Web Audio API + autocorrelation for pitch detection (tuner).
- Google Fonts (Inter).

## Brand

One Music Media s.r.o. — Serious tools for musicians. Built in the Czech Republic.

### Related products

- **[One Music Media](https://onemusic.media)** — Company site
- **[MusicTrainerPro](https://musictrainer.pro)** — Structured practice platform with courses and sheet music
