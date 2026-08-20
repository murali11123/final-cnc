# 3D CNC - Premium MERN CNC Files Manufacturing Platform

A complete, production-quality web platform built from scratch for a CNC 2D & 3D files manufacturing business. Featuring a smooth single-page scrolling user experience modeled on modern design aesthetics, a genuine local AI-powered image similarity search engine using CLIP, and a non-technical Admin CMS portal.

---

## Brand Message & Taglines
- **Main Tagline**: HIGH QUALITY CNC 2D & 3D FILES MANUFACTURING
- **Secondary Tagline**: PRECISION 2D & 3D FILES FOR WOOD, MDF & ACRYLIC
- **Brand Statement**: YOU IMAGINE IT, WE MADE IT.
- **Support WhatsApp Numbers**: `7095988918` (Primary) | `9652422988` (Branches)

---

## Key Features

1. **YouTube-Like Scrolling Browsing**:
   - Single-page browsing flow linking Hero, AI Search, Categories, Gallery Feed, Locations, and Contact Forms.
   - Dynamic Navbar transitioning from transparent to glassmorphic on scroll with scroll-spy active section highlighting.

2. **Genuine AI Image Similarity Search**:
   - **Local CLIP Model**: Uses `@xenova/transformers` running the `clip-vit-base-patch32` image encoder model locally in Node.js.
   - **Model Caching**: Preloads and caches the neural network in-memory after first launch, bypassing slow reload delays.
   - **Dynamic Dimensions**: Accommodates vector dimensions dynamically as returned by the model.
   - **Honest Matching Thresholds**: Sorts candidates using actual cosine similarity scores. Flags exact matches above 88% and semi-similar candidates above 72%. Below 72%, returns an honest "No Close Match Found" notification with fallback recommendations.
   - **Drill scanning animation**: A scanning bar overlays uploaded images while vectors are calculated.

3. **Production Gallery**:
   - Interactive grids with search, filter, and sort (price, name, dates) controls.
   - Load More pagination slicing items for smooth performance.
   - Details modal revealing Indian Rupee estimates, tags, and dynamic order buttons pre-filling custom inquiry text for WhatsApp.
   - LocalStorage persistent favorites and clipboard URL link sharing.

4. **Non-Technical Admin CMS Dashboard**:
   - Protected behind secure JWT authentication.
   - Statistics dashboard aggregating catalog sizes, active visibility, unread messages, and AI indexing status counters.
   - Simple CRUD tables: Add, edit, toggle visibility (hide/show), and delete designs using modular, preview-rich forms.
   - Automated background embedding extraction upon new design uploads (with failures marked and retry-trigger items active).
   - Multi-message customer box supporting read/unread flags and message deletion.
   - Bulk AI Re-indexing button to rebuild all database vectors in one click.

5. **Branch Details & floating actions**:
   - Interactive maps direction paths and phone links for Sri Satish CNC (Anaparthi / G Mamidada).
   - Pulsing floating WhatsApp trigger in the bottom right corner of the screen.

---

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router, Lucide Icons, React Hot Toast, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Multer, `@xenova/transformers` (CLIP model), JWT, bcryptjs, CORS, Helmet, express-rate-limit.

---

## Project Structure

```text
3d-cnc/
├── package.json               # Root monorepo workspace configuration
├── .gitignore                 # Custom rules for dev outputs, logs, uploads
├── .env.example               # Template environment configuration
├── README.md                  # Setup and execution guidelines
├── backend/
│   ├── package.json           # Backend NPM dependencies
│   ├── server.js              # Express app entry & configuration
│   ├── .env                   # Local server environment config
│   ├── config/                # Mongoose database connections
│   ├── controllers/           # API handlers (Auth, designs, contact, search)
│   ├── middleware/            # JWT guards, rate limits, upload buffers
│   ├── models/                # MongoDB Mongoose models (Admin, Design, Message)
│   ├── routes/                # REST router mounts
│   ├── seed/                  # Seeding script creating 48 sample designs
│   ├── services/              # AI embeddings & cosine similarity calculations
│   └── uploads/               # Local folder storing seeded/uploaded images
└── frontend/
    ├── package.json           # Frontend Vite dependencies
    ├── vite.config.js         # React Vite config (serving client on Port 5173)
    ├── tailwind.config.js     # Brand colors configuration
    ├── postcss.config.js      
    ├── index.html             
    └── src/
        ├── main.jsx           # Mounting Toast providers and routers
        ├── index.css          # Styling tokens, custom scrollbars, glassmorphisms
        ├── App.jsx            
        ├── components/        # Shared layouts (Navbar, Footer, Floating Button)
        ├── context/           # Session management context (AuthContext)
        ├── pages/             # Layout viewports (Home, AdminLogin, AdminDashboard)
        ├── sections/          # Single-page subsections (Hero, AI Search, etc.)
        └── services/          # REST Axios API client
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A local instance running on port `27017` (or access to a MongoDB Atlas cluster)

### 2. Dependency Installation
From the root project folder, run the following command to download all packages for both the frontend and backend:
```bash
# Using Windows Command Prompt
npm run install:all
```

---

## Seeding the Database
The platform requires a default administrator and a collection of 48 designs (12 Wall Panels, 12 Temple Designs, 12 Custom CNC, 12 Wooden Crafts) to run. 

We generate 48 distinct geometric PNG patterns locally in code (saving them to `backend/uploads/`) and parse each through the CLIP model to index them with actual neural embeddings.

Run the seed command:
```bash
npm run seed
```

### Default Credentials
After running the seed script, you can log in to the admin panel (`http://localhost:5173/admin/login`) with:
- **Username**: `admin`
- **Password**: `admin3Dcnc123`

*Note: You can replace the seeded geometric images at any time through the Admin Dashboard CMS using the "Replace Image" feature.*

---

## Running the Application
To launch the MERN stack concurrently in development mode (API server on port `5000` and React Client on port `5173`), run:

```bash
npm run dev
```

Open your browser and navigate to:
- **Website Client**: [http://localhost:5173](http://localhost:5173)
- **Admin Dashboard CMS**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## Production Build
To test the production asset compilation on the React frontend, run:
```bash
npm run build
```
The compiled output is saved in `frontend/dist/`.

---

## Cloudinary Deployment (Optional)
By default, the platform writes files to the local disk (`backend/uploads/`) and serves them statically. To deploy to production with Cloudinary storage, add these to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Once added, the system automatically routes all design additions and edits to your Cloudinary storage while keeping the background AI embedding indexing functional.
