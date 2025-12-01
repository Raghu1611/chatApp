# 🚀 Quick Deployment Guide

## Option 1: Deploy via Vercel CLI (Fastest)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Backend
```bash
cd backend
vercel login
vercel --prod
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

## Option 2: Deploy via Vercel Dashboard (Recommended)

### Step 1: Create GitHub Repositories

**Backend:**
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/chatapp-backend.git
git push -u origin main
```

**Frontend:**
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/chatapp-frontend.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repositories
3. **Configure** environment variables (see .env.example files)
4. **Deploy!**

## 📝 Important Environment Variables

### Backend (Vercel Dashboard)
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NODE_ENV` - Set to `production`

### Frontend (Vercel Dashboard)
- `VITE_API_URL` - Your backend URL (e.g., https://chatapp-backend.vercel.app)
- `VITE_SOCKET_URL` - Same as VITE_API_URL

## ⚠️ After Deployment

1. **Update CORS** in backend `server.js`:
   ```javascript
   origin: ['https://your-frontend.vercel.app']
   ```

2. **Redeploy backend** after CORS update

3. **Test all features**:
   - Login/Signup
   - Real-time messaging
   - File uploads
   - Video calls

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Cloudinary: https://cloudinary.com/console

---

Need help? Check `DEPLOYMENT.md` for detailed instructions!
