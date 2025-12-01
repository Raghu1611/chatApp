# Chat Application - Vercel Deployment Guide

## 📋 Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account
- MongoDB Atlas database
- Cloudinary account

## 🚀 Deployment Steps

### 1️⃣ Prepare Your Code

**Backend (.env variables needed):**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
NODE_ENV=production
```

**Frontend (.env variables needed):**
```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SOCKET_URL=https://your-backend-url.vercel.app
```

### 2️⃣ Deploy Backend

1. **Push to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chatapp-backend.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your backend repository
   - Configure project:
     - Framework Preset: Other
     - Root Directory: `./` (or leave blank)
     - Build Command: (leave empty)
     - Output Directory: (leave empty)
   
3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Click "Deploy"

4. **Copy Backend URL:**
   - After deployment, copy your backend URL (e.g., `https://chatapp-backend.vercel.app`)

### 3️⃣ Deploy Frontend

1. **Update Frontend Environment:**
   - Create `.env.production` in frontend folder:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_SOCKET_URL=https://your-backend-url.vercel.app
   ```

2. **Push to GitHub:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chatapp-frontend.git
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your frontend repository
   - Configure project:
     - Framework Preset: Vite
     - Root Directory: `./` (or leave blank)
     - Build Command: `npm run build`
     - Output Directory: `dist`
   
4. **Add Environment Variables:**
   - Add `VITE_API_URL` and `VITE_SOCKET_URL` with your backend URL
   - Click "Deploy"

### 4️⃣ Update CORS Settings

Update your backend `server.js` CORS configuration:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-url.vercel.app'  // Add your frontend URL
  ],
  credentials: true
}));
```

Redeploy backend after this change.

## 🔧 Troubleshooting

### Socket.IO Issues
If real-time features don't work, ensure:
1. Backend URL is correct in frontend `.env`
2. CORS is properly configured
3. Socket.IO is initialized correctly

### Database Connection
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Vercel's IP ranges to whitelist

### Environment Variables
- Double-check all env variables are set in Vercel dashboard
- Redeploy after adding/changing variables

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connection working
- [ ] Socket.IO real-time features working
- [ ] File uploads working (Cloudinary)
- [ ] Authentication working
- [ ] All features tested

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update CORS and environment variables with new domain

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables
4. Test API endpoints directly

---

**Note:** Vercel's free tier has limitations. For production apps with high traffic, consider upgrading or using dedicated hosting.
