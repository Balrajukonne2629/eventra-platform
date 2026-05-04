# 🚀 Eventra – Smart Event Management Platform

Eventra is a full-stack event management platform designed to streamline event creation, participation, and coordination between organizers, students, and faculty.

---

## 🌐 Live Demo

- 🔗 Frontend: https://eventra-platform.vercel.app  
- 🔗 Backend API: https://eventra-platform.onrender.com  

---

## ✨ Features

### 🔐 Authentication
- JWT-based secure login & registration  
- Role-based access (Organizer / Student)

### 🧑‍💼 Organizer
- Create and manage events  
- Notify faculty via email  
- View participants for each event  

### 🎓 Student
- Browse all events  
- Register for events (team-based)  
- View registered events  

### 📧 Email System
- Automatic email notification to faculty  
- Includes organizer details (Name, Email, Dept, Roll No.)  
- Reply goes directly to organizer  

### 🔍 Smart Features
- Search events by name or club  
- View newly added & closing soon events  
- Team name validation  

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Auth:** JWT (jose)  
- **Email:** Nodemailer  
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📂 Project Structure
```
eventra/
│
├── frontend/ # Next.js frontend
├── backend/ # Node.js backend
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone Repo
```bash
git clone https://github.com/Balrajukonne2629/eventra-platform.git
cd eventra-platform
```

---

## ⚙️ Installation & Setup

### 1. Clone Repo
```
git clone https://github.com/Balrajukonne2629/eventra-platform.git
cd eventra-platform
```
2. Setup Backend
```
cd backend
npm install
npm run dev
```
4. Setup Frontend
```
cd frontend
npm install
npm run dev
```
🔐 Environment Variables
```
Backend (.env)
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://eventra-platform.onrender.com
```
## 📸 Screenshots
Add screenshots here
Login Page
Organizer Dashboard
Student Dashboard
Event Creation
Registration Modal

## 📌 Version
v2.0.0 – Production Upgrade

## 👨‍💻 Authors
Balraju Konne
Sai Kushal M

## 🚀 Future Improvements
Refresh token authentication
Notification system
Analytics dashboard
Advanced filtering


## ⭐ Final Note
This project demonstrates a complete full-stack architecture with authentication, role-based access, and real-world features suitable for academic and portfolio purposes.
