# Signature Reno Works (SRW)

Marketing site for **Signature Reno Works Sdn Bhd** — the renovation execution
arm of **Signature Group**, positioned as *Malaysia's first trusted renovator
brand*. Content is drawn from the official SRW company profile and media-launch
Q&A.

Two front doors, one brand:

- **`index.html`** — the immersive flagship: a WebGL hero (Three.js), smooth
  scroll-driven motion (GSAP ScrollTrigger), pinned horizontal sections, custom
  cursor and 3D tilt. Dark, cinematic — matching the company-profile cover.
- **`classic.html`** — a clean corporate landing page matching the company
  profile's light pages (white/charcoal with brass-gold accents).

## Corporate identity

Extracted from the SRW company profile:

| Token | Value |
| --- | --- |
| Accent (antique brass gold) | `#A78B24` |
| Charcoal | `#16130F` / `#1A1714` |
| Cream surface | `#F7F4EE` |
| Display font | Archivo |
| Body font | Inter |
| Taglines | *Complete renovation. Execute with precision.* · *Distinctive Deliver. Design Dedicatedly.* |

## Content sources

- `SRW_Company_Profile.pdf` — one-stop solution, vision, why-choose-us, the
  8 renovation trades, the 6-stage / 14-step Signature Standard, R.I.S.E. site
  standard, the SRW Promise, and contact details.
- `Questions_on_SRW_Reply.docx` — brand voice and positioning (market
  opportunity, consumer pain points, differentiation).

## Files

- `index.html`, `immersive.css`, `immersive.js` — immersive flagship
- `classic.html`, `styles.css`, `main.js` — clean corporate page
- `libs/` — vendored Three.js + GSAP (no runtime CDN needed)
- `.github/workflows/deploy.yml` — auto-deploys to GitHub Pages on push

## Run locally

```bash
python3 -m http.server 8000
# http://localhost:8000          → immersive
# http://localhost:8000/classic.html → classic
```

## Live

Deployed via GitHub Pages: <https://0420kengoh.github.io/legendary-adventure/>

## Notes

- Imagery uses CSS gradients so the site is fully self-contained. Swap the
  `.photo-*` / `.pf-*` / `.work-media` backgrounds for real SRW project photos
  when available.
- Contact details (phone, email, office address) are taken from the company
  profile.
- The quote form validates client-side; wire it to a backend/CRM to receive
  submissions.
