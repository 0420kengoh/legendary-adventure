# RENO Works — by Signature Malaysia

A professional renovation company landing page. RENO Works is the renovation
division under **Signature Malaysia**, offering residential renovation,
commercial fit-out, interior design, and kitchen & bathroom remodelling.

## Stack

Plain, dependency-free static site — just open it in a browser.

- `index.html` — page markup (hero, services, portfolio, why-us, process, testimonials, quote form, footer)
- `styles.css` — design system + responsive layout
- `main.js` — mobile nav, scroll-reveal animations, quote-form validation

## Design system

Generated with the UI/UX Pro Max skill for the renovation/interior industry:

| Token | Value |
| --- | --- |
| Style | Minimalism & Swiss Style |
| Primary | `#78716C` (warm stone grey) |
| Accent / CTA | `#D97706` (gold) |
| Background | `#FAF5F2` (warm off-white) |
| Foreground | `#0F172A` |
| Display font | Cinzel |
| Body font | Josefin Sans |

## Run it

No build step. Either open the file directly:

```bash
open index.html      # macOS
```

…or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- All imagery uses CSS gradients so the site is fully self-contained (no external
  image assets). Swap the `.photo-*` / `.pf-*` backgrounds in `styles.css` for
  real project photos when available.
- Contact details (phone, email, address) are placeholders — update them in
  `index.html`.
- The quote form validates client-side and shows a success message; wire it to a
  real backend/email service to receive submissions.
