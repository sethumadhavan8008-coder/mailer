# Bulk Mail MERN Application

A beginner-friendly bulk email application using React, Node.js, Express, MongoDB, and Nodemailer.

## 1. Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and add your MongoDB URI and SMTP credentials.

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the URL shown by Vite, normally `http://localhost:5173`.

## 3. SMTP

For Gmail:
- Turn on 2-Step Verification.
- Create a Google App Password.
- Put that App Password in `SMTP_PASS`.
- Do not put the password in React or commit `.env` to GitHub.

## API

- `POST /api/emails/send` - send and save an email
- `GET /api/emails/history` - fetch email history
- `GET /api/health` - health check
