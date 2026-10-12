# Assets

| Path | Contents |
|------|----------|
| `deck/html/` | HTML sources for Playwright slide renders. |
| `deck/data/` | JSON used by deck generators (`geneScreenDeckData.json`, etc.). |
| `deck/export/` | Generated PNG/PPTX (safe to regenerate via scripts). |
| `deck/render-deck-slides.mjs` | Renders purpose + UI slides from HTML. |
| `dashboard-screenshots/` | Full-page dashboard captures for narrative PowerPoint. |

Generated deck outputs are written under `deck/export/` unless a script copies to Desktop.
