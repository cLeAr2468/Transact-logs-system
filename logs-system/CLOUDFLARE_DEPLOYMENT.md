# 🚀 Cloudflare Pages Deployment Guide

## Prerequisites
- A Cloudflare account (sign up at https://dash.cloudflare.com)
- Your backend API deployed and accessible
- Node.js and npm installed

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Or install locally (already in package.json):
```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser to authenticate.

## Step 3: Deploy to Cloudflare Pages

### Option A: Automatic Deployment via Git (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Configure for Cloudflare Pages"
   git push origin main
   ```

2. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Go to **Workers & Pages**
   - Click **Create application**
   - Choose **Pages**
   - Click **Connect to Git**

3. **Connect your repository**
   - Select your GitHub account
   - Choose `Transact-logs-system` repository
   - Click **Begin setup**

4. **Configure build settings**
   - **Project name**: `transact-logs-system`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `logs-system`

5. **Add environment variables**
   - Click **Add variable**
   - Name: `VITE_API_URL`
   - Value: Your backend API URL (e.g., `https://your-api.com/api`)

6. **Click "Save and Deploy"**

### Option B: Direct Deployment via Wrangler CLI

1. **Build your project**
   ```bash
   cd logs-system
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npm run pages:deploy
   ```

   Or using wrangler directly:
   ```bash
   npx wrangler pages deploy dist --project-name=transact-logs-system
   ```

3. **Set environment variables** (for production)
   ```bash
   npx wrangler pages secret put VITE_API_URL
   ```
   Enter your API URL when prompted.

## Step 4: Configure Custom Domain (Optional)

1. Go to your Pages project in Cloudflare Dashboard
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow DNS configuration instructions

## Step 5: Update Backend CORS

Make sure your backend allows requests from your Cloudflare Pages domain:

```javascript
// Example: Express.js backend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://transact-logs-system.pages.dev',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Local Development

Test Cloudflare Pages locally:

```bash
npm run pages:dev
```

This builds the project and runs it with Cloudflare Pages dev server.

## Environment Variables

### For Production (Cloudflare Dashboard):
1. Go to **Settings** → **Environment variables**
2. Add:
   - `VITE_API_URL`: Your production API URL

### For Local Development:
Create a `.dev.vars` file (don't commit this):
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Troubleshooting

### Build Fails
- Check that `vite` is in `dependencies` not `devDependencies`
- Run `npm run build` locally to test
- Check build logs in Cloudflare Dashboard

### 404 on Page Refresh
- ✅ Already fixed with `public/_redirects` file
- This ensures React Router works correctly

### API Calls Failing
- Verify `VITE_API_URL` is set in Cloudflare
- Check backend CORS configuration
- Check browser console for errors

### Build Command Not Found
- Ensure `wrangler` is installed: `npm install`
- Use `npx wrangler` instead of `wrangler`

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run pages:dev` | Test Cloudflare Pages locally |
| `npm run pages:deploy` | Deploy directly via CLI |
| `npx wrangler pages deployment list` | List deployments |
| `npx wrangler pages deployment tail` | View deployment logs |

## Features

✅ Automatic deployments on Git push  
✅ Preview deployments for pull requests  
✅ Free SSL certificates  
✅ Global CDN  
✅ Unlimited bandwidth  
✅ Rollback to previous deployments  

## URLs

- **Production**: `https://transact-logs-system.pages.dev`
- **Preview**: `https://[branch-name].transact-logs-system.pages.dev`
- **Dashboard**: https://dash.cloudflare.com

## Next Steps

1. Configure environment variables
2. Set up custom domain (optional)
3. Enable branch deployments for testing
4. Configure build notifications

## Support

- Cloudflare Docs: https://developers.cloudflare.com/pages
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler
- Community: https://community.cloudflare.com
