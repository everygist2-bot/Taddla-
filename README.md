# Taddla — Verified Consumer Reviews & Product Insights Platform

Taddla is a full-stack review platform featuring AI-powered review summaries, photo recognition, long-term product experience timelines, and community ratings.

---

## 🚀 Exporting / Deploying to GitHub

### Method 1: Export Directly via Google AI Studio UI (Recommended)
1. In the top-right corner of Google AI Studio, click on **Settings** (gear icon) or **Export / Share**.
2. Select **Export to GitHub**.
3. Authenticate with your GitHub account when prompted.
4. Choose an existing GitHub repository or create a new repository (public or private).
5. Click **Push / Export** to automatically push all project files directly to GitHub.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone your GitHub repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📦 Production Build & Server Start

To build and run the full-stack application locally or in production:

```bash
# Build Vite frontend & Esbuild backend server
npm run build

# Start the compiled CommonJS server
npm run start
```

---

## 🌐 Deploying Full-Stack Application

Since Taddla uses Express backend routes (`server.ts`) for Gemini AI API calls alongside the Vite React frontend:

- **Render / Railway / Fly.io / Heroku / Cloud Run**:
  - Build Command: `npm run build`
  - Start Command: `npm run start`
  - Node Version: `18+`
  - Environment Variables: Set `GEMINI_API_KEY` in your hosting platform dashboard.
