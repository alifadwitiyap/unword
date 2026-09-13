# Unword

Vanilla HTML/CSS/JS app for real-time character case classification.

## Run / Preview

Open `index.html` in a browser, or serve the folder locally:

```bash
cd D:\project\letter-case-analyzer
python -m http.server 8080
# open http://127.0.0.1:8080
```

## Verify

- Type in textarea → table, stats, bar chart, donut update live.
- Filter dropdown works (All / LOWER / UPPER / DIGIT / SPECIAL).
- Pagination below table; Prev/Next disable at boundaries.
- CSV download exports current analysis.
- Layout is responsive; cards/buttons show raised hover/pressed states.
- Header and footer read: **Built 4 life 🫶✨🚀**

## Project Notes

- Entry point: `index.html`
- Styles: `assets/css/style.css`
- Logic: `assets/js/app.js`
- Assets: `assets/fonts/`, `assets/images/`
- Planning artifacts live in `.plan/` and are gitignored.
