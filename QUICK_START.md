# Quick Start Guide - LMS + SIS System

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- MongoDB - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- npm (comes with Node.js)

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create a `.env` file in the `backend` folder:

```bash
# Copy the example file
cp .env.example .env
```

Update the `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms_sis_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

**For MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string.

### Step 3: Start Backend Server

```bash
# Still in backend folder
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
npm install react-router-dom axios
```

### Step 5: Configure Frontend Environment

Create a `.env` file in the `frontend` folder:

```bash
cp .env.example .env
```

The file should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Start Frontend Server

```bash
# Still in frontend folder
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:3000/
```

### Step 7: Access the Application

Open your browser and navigate to: **http://localhost:3000**

You'll see the login page. Create an account to get started!

## 📚 First Steps

### Create Your First Admin Account

1. Click "Register here" on the login page
2. Fill in your details:
   - First Name, Last Name
   - Email (e.g., admin@school.edu)
   - Password (min 6 characters)
   - **Role**: Select "Admin"
3. Click "Create Account"

You'll be automatically logged in and redirected to the Admin Dashboard!

### Create a Student Account

From the Admin Dashboard:
1. Go to "Users" → "Add New User"
2. Fill in student details
3. Role: "Student"
4. After creating the user, go to "Students" → "Add New Student"
5. Link the user to create a complete student profile

## 🔧 Common Issues & Solutions

### Backend Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Make sure MongoDB is running
- Windows: Open Services, start "MongoDB Server"
- Mac/Linux: `sudo systemctl start mongod`
- Or use MongoDB Atlas cloud database

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: 
- Change the PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### Frontend Issues

**Cannot connect to backend**
```
Network Error / ERR_CONNECTION_REFUSED
```
**Solution**:
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` file
- Try accessing http://localhost:5000 directly in browser

**Module not found errors**
```
Error: Cannot find module 'react-router-dom'
```
**Solution**:
```bash
cd frontend
npm install react-router-dom axios
```

## 📖 Testing the System

### Test Student Enrollment Flow

1. **As Admin**:
   - Create a subject (Subjects → Add Subject)
   - Add an offering for current semester
   - Create a student profile

2. **As Student** (login with student credentials):
   - Go to Dashboard
   - Click "Self-Enroll"
   - Select subjects
   - Submit enrollment

3. **As Admin**:
   - Go to Enrollments
   - Approve the pending enrollment
   - Create tuition record for the enrollment

4. **As Student**:
   - View Registration Card
   - Check Tuition & Billing

## 🎯 Next Steps

- **Customize**: Update school name, branding, and colors
- **Populate Data**: Add subjects, students, and instructors
- **Configure**: Set tuition rates in backend (tuition.controller.js)
- **Explore**: Try all the features in each portal

## 📞 Need Help?

Check the main README.md for:
- Complete API documentation
- Database schema details
- Feature descriptions
- Security best practices

## ⚡ Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Change `JWT_SECRET` to a strong, random string
4. Deploy to:
   - Heroku
   - DigitalOcean
   - AWS EC2
   - Render.com

### Frontend Deployment

1. Build for production:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - Firebase Hosting
   - AWS S3 + CloudFront

3. Update `VITE_API_URL` to your production backend URL

## 🎉 You're All Set!

Your LMS + SIS system is now running. Start exploring and customizing it for your school's needs!
