# EbookApp — Paid, Read-Only Ebook Access

A MERN app where students pay (via Stripe) to unlock read-only access to book
content. Admin uploads a .docx/.pdf, the text is extracted once into the
database, and the original file is discarded — nothing downloadable is ever
served to a reader. Content is watermarked with the reader's name/email as a
deterrent against screenshotting and sharing.

## How content protection works (read this first)

**Nothing rendered in a browser can be made 100% impossible to copy** — a
determined user can always screenshot the screen. What this app does instead:

1. Original files never touch the frontend — only extracted text does, one
   chapter at a time, over an authenticated API call.
2. Text selection, right-click, Ctrl+C/P/S/U, and printing are disabled.
3. Every page is watermarked with the logged-in reader's name and email, so
   any leaked screenshot is traceable back to who shared it.
4. Access is gated server-side on a *completed* Stripe payment — checked on
   every single chapter request, not just once at login.

This is the same tradeoff every "read-only" platform (Kindle Cloud Reader,
Scribd, O'Reilly) makes. It stops casual copying and circulation; it can't
stop a screenshot.

## Project structure

```
ebook-app/
  backend/    Express + MongoDB API
  frontend/   React (Vite) app
```

## 1. Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — see "Getting your keys" below
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173.

## 2. Getting your keys

**MongoDB Atlas (free)**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access → add a user + password
3. Network Access → allow access from anywhere (0.0.0.0/0) for now
4. Get your connection string, put it in `MONGO_URI`

**Stripe (free to test)**
1. Sign up at https://dashboard.stripe.com — no business verification
   needed to use **test mode**
2. Developers → API keys → copy the **test** Secret key into
   `STRIPE_SECRET_KEY`
3. For webhooks locally, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
   It prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`
4. Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC
5. When your uncle is ready to accept real payments, switch to live API
   keys and complete Stripe's identity verification (needs a bank account)

**JWT_SECRET**: any long random string, e.g. generate one with
`openssl rand -hex 32`.

**ADMIN_SIGNUP_CODE**: pick a secret word. Whoever registers with this code
in the signup form becomes an admin (see "Creating the admin account" below).

## 3. Creating the admin account (your uncle's account)

The public register form only creates student accounts. To create the first
admin:
1. Set `ADMIN_SIGNUP_CODE` in the backend `.env` to a secret value
2. Use a tool like Postman (or curl) to call:
   ```
   POST /api/auth/register
   { "name": "...", "email": "...", "password": "...", "adminCode": "<your secret>" }
   ```
3. That account can now log in and see the "Admin" tab to upload books.
4. Afterwards you can remove/rotate `ADMIN_SIGNUP_CODE` if you want to lock
   down further admin creation.

## 4. Uploading a book

Admin → Upload a new book → fill in title/price → choose the .docx or .pdf.
The app extracts chapters automatically by looking for headings like
"Chapter 1", "Chapter Two", "Part 1". If your uncle's books don't follow
that pattern, the whole book is stored as one chapter — you can improve the
chapter-splitting logic in `backend/utils/extractContent.js` once you see
real files.

**A new upload is unpublished by default** — check the extracted chapters
look right (you can view chapter count in the admin table), then hit
Publish to make it visible to students.

## 5. Deploying (free tier path)

1. **Database**: MongoDB Atlas (already set up above)
2. **Backend**: push `backend/` to GitHub, deploy on https://render.com as
   a Web Service (`npm install` build command, `npm start` start command).
   Add all your `.env` values as environment variables in Render's dashboard.
3. **Frontend**: push `frontend/` to GitHub, deploy on https://vercel.com.
   Set `VITE_API_URL` to your Render backend URL + `/api`.
4. **Stripe webhook in production**: in the Stripe Dashboard, add an endpoint
   pointing to `https://your-render-url/api/payments/webhook`, copy its
   signing secret into Render's `STRIPE_WEBHOOK_SECRET`.
5. Update `CLIENT_URL` in the backend env to your Vercel URL, and CORS will
   automatically allow it.

## 6. Why this won't crash easily

- Centralized error handler in `server.js` catches anything unhandled in a
  route instead of taking the process down.
- `unhandledRejection`/`uncaughtException` listeners log instead of dying
  silently (pair this with Render's auto-restart for real resilience).
- Mongoose connection failure exits cleanly so your host's process manager
  restarts it, rather than running with a dead DB.
- File uploads are size-limited (25MB) and type-checked before processing.
- Temp uploaded files are always deleted in a `finally` block, even if
  extraction fails — the `uploads/` folder won't fill up with orphaned files.
- Payment status is only ever trusted from Stripe's signed webhook, never
  from the browser redirect — so no one can fake "I paid" by just visiting
  a success URL.

## What's deliberately left simple (extend as needed)

- No password-reset flow yet (add if students will forget passwords)
- No pagination on the book list (fine for 4 books, add later if it grows)
- Chapter-splitting regex is a heuristic — refine once you see real files
- No image/diagram support in chapters (mammoth/pdf-parse extract text only)
