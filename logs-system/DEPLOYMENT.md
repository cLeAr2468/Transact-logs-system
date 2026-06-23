# 🚀 Vercel Deployment Guide

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your backend API deployed and accessible

## Step 1: Prepare Your Project

### 1.1 Create `.env` file (Don't commit this!)
```bash
VITE_API_URL=https://your-backend-api.com/api
```

Replace `https://your-backend-api.com/api` with your actual backend URL.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **logs-system**
   - In which directory is your code located? **.**
   - Want to override settings? **N**

5. Add environment variable:
```bash
vercel env add VITE_API_URL
```
Enter your backend API URL when prompted.

6. Deploy to production:
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard (Easier)

1. Go to https://vercel.com/new

2. Import your Git repository (GitHub/GitLab/Bitbucket)

3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `logs-system`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-api.com/api`

5. Click **Deploy**

## Step 3: Update Backend CORS

Update your backend to allow requests from your Vercel domain:

```javascript
// In your backend (Express example)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Step 4: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Login functionality
- ✅ API calls working
- ✅ All routes accessible
- ✅ Images loading correctly

## Troubleshooting

### 404 on page refresh
✅ Already fixed with `vercel.json` rewrites configuration

### API calls failing
- Check VITE_API_URL environment variable
- Verify backend CORS settings
- Check browser console for errors

### Build fails
- Run `npm run build` locally first
- Check for any import errors
- Ensure all dependencies are in package.json

### Images not loading
- Ensure images are in the `public` folder
- Use correct paths (e.g., `/logo.png` not `./logo.png`)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.example.com/api` |

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update backend CORS with new domain

## Continuous Deployment

Once connected to Git:
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Auto-deploy to preview URLs

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
