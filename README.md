# Hometown Hub – Digital Community Platform

A MERN-stack digital community platform that connects people with their hometown communities. Users can share posts, interact with community members, participate in events, receive notifications, and communicate through real-time chat.

## 🚀 Live Demo

- **Frontend:** https://hometown-hub-one.vercel.app
- **Backend API:** https://hometown-hub-backend-lktf.onrender.com
- **GitHub Repository:** https://github.com/anshikaa052-prog/Hometown-Hub

## ✨ Features

### User Features
- User registration and login
- User profile management
- Create, edit, and delete posts
- Like and comment on posts
- Join and explore communities
- Create and explore community events
- Real-time notifications
- Real-time chat

### Admin Features
- Admin dashboard
- Manage users and block/unblock accounts
- Review and manage reported content
- Community approval management
- View platform analytics

## 🛠️ Tech Stack

**Frontend:** React.js, JavaScript, HTML5, CSS3, Vite

**Backend:** Node.js, Express.js, Socket.IO

**Database:** MongoDB, Mongoose

**Tools & Deployment:** Git, GitHub, Vercel, Render, Cloudinary

## 📁 Project Structure

```text
Hometown-Hub/
├── client/
├── server/
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/anshikaa052-prog/Hometown-Hub.git
cd Hometown-Hub
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the client folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## 🌐 Deployment

- Frontend deployed on Vercel.
- Backend deployed on Render.
- MongoDB Atlas used for database hosting.
- Cloudinary used for media storage.

## 👩‍💻 Developed By

**Anshika Agarwal**

B.Tech – Computer Science and Engineering

Developed as an internship project using the MERN stack.

---

⭐ Thank you for exploring Hometown Hub!