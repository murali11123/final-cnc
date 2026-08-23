# 3D CNC Backend (AI Design Search) — Simplified, No Auth

## What changed from your original code
- Removed the entire login/auth system (Admin model, authController, authRoutes, protectAdmin middleware) — you said no login/authorization needed.
- Fixed `package.json`: removed a broken `"3d-cnc-monorepo": "file:.."` dependency and unused auth packages (bcryptjs, jsonwebtoken).
- Rewrote `seed/seed.js`: instead of generating fake pattern PNGs, it now reads REAL photos from `source-images/<category>/` folders, copies them into `/uploads`, and generates a real CLIP embedding for each.
- `server.js` no longer auto-seeds on boot (too slow/risky for 2,000 real images) — you run seeding manually, once.
- Fixed a `jpeg-js` option typo (`useTimp` → `useTArray`) in `embeddingService.js`.
- `config/db.js` now logs a clear ✅/❌ connection status on startup.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env` and paste your MongoDB Atlas connection string (no `< >` brackets, and add a database name):
   ```
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.aab1pka.mongodb.net/3d-cnc?retryWrites=true&w=majority
   ```

3. **Add your 2,000 photos**
   Drop them into the matching folder:
   ```
   source-images/2D Wall Panels/
   source-images/Temple Designs/
   source-images/Custom CNC/
   source-images/Wooden Crafts/
   ```
   Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`

4. **Run the seed script once** (this will take a while — it generates an AI embedding per image)
   ```
   npm run seed
   ```
   Safe to re-run: already-imported images are skipped automatically.

5. **Start the server**
   ```
   npm run dev     (development, auto-restart)
   npm start        (production)
   ```
   Watch the console — you'll see a clear `✅ MongoDB CONNECTED successfully` or `❌ MongoDB CONNECTION FAILED` message.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/designs` | Public gallery. Supports `?category=`, `?search=`, `?sort=` |
| GET | `/api/designs/:id` | Single design detail |
| POST | `/api/designs/search/image` | **Core feature** — upload a photo (`image` form field, optional `category`), get back matching designs |
| POST | `/api/designs` | Add one design manually (`image` file + name, code, category fields) |
| DELETE | `/api/designs/:id` | Remove a design |
| POST | `/api/contact` | Public contact form submission |
| GET | `/api/contact` | View submitted contact messages |
| GET | `/health` | Health check |

## ⚠️ Security note (since there's no login)

`POST/DELETE /api/designs` and `GET /api/contact` are currently open to anyone who knows the URL — since your 2,000 photos get imported via the `seed` script (not this endpoint), you likely won't need `POST /api/designs` in normal operation. If you deploy this publicly, consider either:
- Removing those two routes from `routes/designRoutes.js` / `routes/contactRoutes.js` entirely, or
- Protecting them with a simple shared secret header check (much lighter than full login) if you want to keep the option to add designs later without redeploying.

The public-facing routes (`GET /api/designs`, `POST /api/designs/search/image`, `POST /api/contact`) are meant to be open — that's normal for a customer-facing site.
