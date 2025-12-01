# 💬 Real-Time Chat Application

A modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. This application provides seamless real-time messaging, video calling, file sharing, and much more.

![Chat App](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** with JWT authentication
- **Secure Password Hashing** using bcrypt
- **Email Verification** system
- **Password Reset** functionality
- **Session Management** with automatic logout

### 💬 Messaging Features
- **Real-time Messaging** powered by Socket.IO
- **1-on-1 Chats** with typing indicators
- **Group Chats** with admin controls
- **Message Reactions** (❤️, 👍, 😂, 😮, 😢)
- **Reply to Messages** with context display
- **Edit Messages** (within 2 minutes)
- **Delete Messages**:
  - Delete for Me (local removal)
  - Delete for Everyone (within 2 minutes)
- **Message Status**: Sent, Delivered, Read (✓✓)
- **Pin Important Chats** to top
- **Search Users** to start conversations

### 📁 Media & File Sharing
- **Image Sharing** with preview
- **File Uploads** (documents, PDFs, etc.)
- **Voice Messages** with audio recording
- **Drag & Drop** file upload support
- **Cloud Storage** via Cloudinary

### 📞 Communication
- **Video Calls** (WebRTC-based)
- **Voice Calls** support
- **Call Notifications** for incoming calls
- **Screen Sharing** capabilities

### 👥 User Features
- **User Profiles** with avatar and bio
- **View Other Users' Profiles**
- **Block/Unblock Users**
- **Online/Offline Status**
- **Last Seen** timestamps
- **Update Profile** (name, bio, avatar)
- **Change Password** securely

### 🎨 UI/UX Features
- **Dark Mode** with smooth transitions
- **Responsive Design** (mobile, tablet, desktop)
- **Modern UI** with Tailwind CSS
- **Smooth Animations** and transitions
- **Emoji Support** in messages
- **Custom Notifications** (browser notifications)

### 👥 Group Chat Features
- **Create Groups** with custom names and avatars
- **Add/Remove Members**
- **Admin Controls**
- **Group Info Panel**
- **Only Admins Can Send** option
- **Member List** with online status

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons
- **WebRTC** - Video/audio calls

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time engine
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Cloud storage
- **Nodemailer** - Email service

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

You'll also need accounts for:
- **MongoDB Atlas** (database)
- **Cloudinary** (file storage)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/chatapp.git
cd chatapp
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# MONGO_URI, JWT_SECRET, CLOUDINARY credentials, etc.
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 🌍 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📁 Project Structure

```
chatapp/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── sockets/         # Socket.IO handlers
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main component
│   ├── index.html
│   └── package.json
│
├── DEPLOYMENT.md            # Deployment guide
├── QUICK_DEPLOY.md          # Quick deployment
└── README.md                # This file
```

## 🎯 Key Features Explained

### Message Editing & Deletion
- **Edit**: Users can edit their messages within 2 minutes of sending
- **Delete for Me**: Removes message from your view only
- **Delete for Everyone**: Removes message for all participants (2-minute window)
- **Visual Indicators**: "edited" label shows on edited messages

### Real-Time Features
- **Typing Indicators**: See when someone is typing
- **Online Status**: Real-time online/offline indicators
- **Message Status**: Track message delivery and read status
- **Instant Updates**: All changes sync across all connected clients

### User Privacy & Control
- **Block Users**: Prevent unwanted messages
- **Profile Privacy**: Control what others see
- **Message Deletion**: Remove messages you've sent
- **Secure Authentication**: JWT-based auth system

## 🔒 Security Features

- **Password Hashing** with bcrypt (10 salt rounds)
- **JWT Authentication** with secure tokens
- **HTTP-only Cookies** for session management
- **CORS Protection** with whitelist
- **Input Validation** on all endpoints
- **File Upload Restrictions** (size, type)
- **XSS Protection** with sanitization
- **Rate Limiting** on sensitive endpoints

## 🚀 Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

## 📱 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile
- `GET /users/:id` - Get user by ID
- `POST /users/:userId/block` - Block user
- `DELETE /users/:userId/block` - Unblock user
- `PATCH /users/me/bio` - Update bio

### Chats
- `GET /chats` - Get all chats
- `POST /chats` - Create new chat
- `POST /chats/group` - Create group chat
- `PATCH /chats/:id/pin` - Pin/unpin chat

### Messages
- `GET /chats/:id/messages` - Get messages
- `DELETE /messages/:id` - Delete message
- `PATCH /messages/:id/edit` - Edit message
- `POST /messages/upload` - Upload file

## 🎨 UI Screenshots

*(Add your screenshots here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/YOUR_PROFILE)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for media storage
- MongoDB Atlas for database hosting
- Vercel for deployment
- Tailwind CSS for styling

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

## 🗺️ Roadmap

- [ ] End-to-End Encryption
- [ ] Message Search
- [ ] Voice Notes Transcription
- [ ] Multi-language Support
- [ ] Message Forwarding
- [ ] Stickers & GIFs
- [ ] Chat Export
- [ ] Desktop App (Electron)
- [ ] Mobile App (React Native)

---

⭐ **Star this repo if you find it helpful!**

Made with ❤️ using MERN Stack
