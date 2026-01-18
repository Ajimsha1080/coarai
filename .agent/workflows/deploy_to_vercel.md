---
description: How to deploy the application to Vercel
---

# Deploying to Vercel

You can deploy this application to Vercel easily using their CLI or by connecting a Git repository.

## Option 1: Vercel CLI (Recommended for manual deploys)

1.  **Install Vercel CLI** (if not already installed):
    ```powershell
    npm install -g vercel
    ```

2.  **Login to Vercel**:
    ```powershell
    vercel login
    ```

3.  **Deploy**:
    Run the following command in the project root:
    ```powershell
    vercel
    ```
    - Set up and deploy? [Y/n] **y**
    - Which scope do you want to deploy to? **(Select your account)**
    - Link to existing project? [y/N] **n** (unless you already created one)
    - What’s your project’s name? **(Press Enter or give it a name)**
    - In which directory is your code located? **./** (Press Enter)
    - Want to modify these settings? [y/N] **n** (Auto-detection usually works)

4.  **Set Environment Variables**:
    You MUST add your API keys to Vercel for the app to work online.
    
    You can do this via the dashboard URL provided after deployment, or using the CLI:
    ```powershell
    vercel env add VITE_GEMINI_API_KEY
    ```
    (Paste the value from your .env file)
    
    Repeating for other keys:
    ```powershell
    vercel env add VITE_FIREBASE_API_KEY
    vercel env add VITE_FIREBASE_AUTH_DOMAIN
    vercel env add VITE_FIREBASE_PROJECT_ID
    vercel env add VITE_FIREBASE_STORAGE_BUCKET
    vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
    vercel env add VITE_FIREBASE_APP_ID
    vercel env add VITE_TAVILY_API_KEY
    ```

5.  **Redeploy to apply env vars**:
    ```powershell
    vercel --prod
    ```

## Option 2: Git Integration (Automatic)

1.  Push your code to GitHub/GitLab/Bitbucket.
2.  Go to [Vercel Dashboard](https://vercel.com/new).
3.  Import your repository.
4.  In the **Environment Variables** section, add all keys from your `.env` file.
5.  Click **Deploy**.
