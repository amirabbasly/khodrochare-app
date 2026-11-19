# Hall and brand assets

Created with the built-in `image_gen` tool. The logo edit used the repository's original `public/khodrochare-symbol.png` as its edit target. No external image service or API-key CLI was used. The original symbol and wordmark remain available. Generated outputs were inspected and exported with Sharp to optimized WebP assets inside this project, preserving alpha for the symbol.

| Production file | Purpose | Export |
| --- | --- | --- |
| `public/khodrochare-symbol-transparent.webp` | Main symbol on splash and central navigation action | 600 × 600, true alpha, about 63 KB |
| `public/khodrochare-wordmark.png` | Existing textual brand asset, right side of splash | Existing original, unchanged |
| `public/slides/hall-buy.webp` | Marketplace carousel background | 1536 × 1024, about 226 KB |
| `public/slides/hall-inspection.webp` | Inspection carousel background | 1536 × 1024, about 145 KB |

These carousel pictures are generic promotional artwork, never vehicle listings or evidence of a particular car's condition. All public listing photos, image counts, locations, prices and publication dates still come from the API.

## Final prompts

### Symbol — background extraction, `transparent_background: true`

Edit target: the supplied existing Khodrochare symbol. Background-extraction ONLY: remove the off-white/white square background entirely, make it true alpha transparency including every exterior corner and surrounding empty space. Preserve the exact existing orange ring and navy-blue K symbol silhouette, original proportions, 3D bevels, reflections, orange and navy colors, highlights, and fine edges. Do not redesign, retype, add elements, invent shadows, or alter the logo. Tight clean square canvas with modest equal padding. Output an RGBA PNG with actual transparent alpha background for an app's splash screen and navigation. The logo itself must be opaque.

### Marketplace photograph

Create a photorealistic premium automotive marketplace website carousel background, wide landscape composition approximately 3:2. A clean pearl-white contemporary sedan and a charcoal-gray crossover parked at a tasteful modern showroom courtyard in Tehran, subtle stone architecture, warm late afternoon sunlight, realistic reflections and real car proportions. Both vehicles on the LEFT two thirds, the RIGHT third has calm shadowed architectural negative space to place Persian interface text later in HTML. Cinematic but natural, understated navy and warm amber mood, professional automotive editorial photography. No text, letters, logos, watermarks, fake interface, people or license plate text. Not a listing photo or claim of a specific car for sale; it is a branded generic marketplace hero background.

### Inspection photograph

Create a photorealistic premium automotive website carousel background, wide landscape composition approximately 3:2. Close three-quarter front view of an elegant dark navy sedan in a spotless modern vehicle inspection bay, realistic engine workshop lighting, one diagnostic tablet resting on a trolley, warm orange architectural accent lights, credible mechanical detail without readable branding. The car and inspection environment occupy the LEFT two thirds; RIGHT third is dark calm negative space to place Persian HTML copy later. Sophisticated and trustworthy automotive editorial photography, navy and warm amber colors. No text, letters, logos, watermarks, fake UI, numbers or people. Generic editorial hero image, not a customer vehicle advertisement.

## Verification

- `npm run test:assets`: decode images, verify transparent exterior pixels, solid logo artwork, landscape dimensions and compressed size.
- `npx playwright test --config playwright.hall.config.ts`: carousel navigation, real image loading, right-hand photos, responsive card layout and equal splash logo boxes in RTL order, alongside publication/captcha, filters, contact, deletion and chat scenarios.
- `npm run build` and `npm run lint`.
