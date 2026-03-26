# Hosting Your AI Platform for Free

To host a full-stack app (Next.js + Python API + Database) for free, you need a combination of services that connect to your GitHub repository.

## 1. Push to GitHub

First, you need to create a repository on GitHub and push your code:

1.  Go to [github.com/new](https://github.com/new) and create a repository named `compai-suite`.
2.  Run these commands in your terminal:
    ```powershell
    git remote add origin https://github.com/YOUR_USERNAME/compai-suite.git
    git branch -M main
    git push -u origin main
    ```

## 2. Free Hosting Providers

Since GitHub Pages only hosts static files, you should use these **Free-Tier** providers that integrate with GitHub:

### Frontend (Next.js)
*   **[Vercel](https://vercel.com/)**: The best for Next.js. Connect your GitHub repo, and it will deploy automatically for free.

### Backend & Database (FastAPI + Postgres)
*   **[Zeabur](https://zeabur.com/)**: Excellent for multi-service apps. It can deploy your `docker-compose.yml` (partially) or individual services for free.
*   **[Neon](https://neon.tech/)**: Best free "Serverless Postgres" for your database.
*   **[Upstash](https://upstash.com/)**: Best free "Serverless Redis".

## 3. Deployment Steps (Recommended)

1.  **Database**: Create a free project on **Neon.tech** and copy the `DATABASE_URL`.
2.  **API**: Import your repo to **Vercel** or **Render.com**. Add your `GOOGLE_API_KEY` and `DATABASE_URL` as Environment Variables.
3.  **UI**: Vercel will automatically detect the `apps/web` folder and deploy it.

## 4. Native Local Setup (No Docker/Podman)

If Podman/WSL is giving you issues, you can run the app directly on Windows:

### A. Database (Cloud)
1. Create a free project at [Neon.tech](https://neon.tech/).
2. Copy the **Connection String** (Postgres URL).
3. Create a `.env` file in `apps/api/` and paste:
   ```env
   DATABASE_URL=postgres://user:pass@ep-host.region.aws.neon.tech/neondb?sslmode=require
   ```

### B. Backend (Python)
1. Open terminal in `apps/api/`.
2. Create virtual environment: `python -m venv venv`
3. Activate: `.\venv\Scripts\activate`
4. Install: `pip install -r requirements.txt`
5. Run: `python index.py`

### C. Frontend (Next.js)
1. Open a second terminal in `apps/web/`.
2. Install: `npm install`
3. Run: `npm run dev`

---

## 5. Alternative: GitHub Codespaces

If you just want a "cloud computer" to run your app for free:
1.  Go to your GitHub repo.
2.  Press the **`.`** (period) key or click **Code > Codespaces > Create codespace**.
3.  It will open a browser-based VS Code and run your `docker-compose` automatically! (Free for 60 hours/month).
