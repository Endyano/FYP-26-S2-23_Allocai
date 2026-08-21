This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The frontend alone isn't enough to run the app — there's also a Flask backend in `src/login/` that needs to be running at the same time, on `http://localhost:5000`. Without it, every page will show "Could not reach the server."

## Getting Started

First, run the frontend dev server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Backend setup (required)

```bash
cd src/login
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a file at `src/login/.env` with this content:

```
DB_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.wmuqbyzzagrdpflhstay
DB_PASSWORD=SSOp055szBO7edht

SUPABASE_URL=https://wmuqbyzzagrdpflhstay.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdXFieXp6YWdyZHBmbGhzdGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTA4MzAsImV4cCI6MjA5NjMyNjgzMH0.n5759FQ5PiObuRDivwKdgmm68IPJwunMrvvakpcYD9A

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=justinfrancisco969@gmail.com
SMTP_PASSWORD=wffh saeu srof ryzi
SMTP_FROM_NAME=Allocai
FRONTEND_URL=http://localhost:3000

GEMINI_API_KEY=AQ.Ab8RN6Lb7DqteH80Od4XD5bgij-odu2VYulKyVR_B8VqtcMuQg

SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=justinfrancisco969@gmail.com
```

Then run the backend:

```bash
python app.py
```

It should print `Running on http://localhost:5000`. If it doesn't:
- Check `.env` is at exactly `src/login/.env`, not the repo root.
- On macOS, port 5000 can already be taken by AirPlay Receiver. Check with `lsof -iTCP:5000 -sTCP:LISTEN` — if it shows `ControlCenter` instead of Python, turn off AirPlay Receiver in System Settings → General → AirDrop & Handoff, then restart `python app.py`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
