# EventMate 🎉

EventMate is a MERN-stack based college event management system designed to simplify event handling and communication between committee members and students.

The platform allows committee members to create and manage events, while students can view upcoming events, register for them, and receive email notifications so they never miss important college activities.

Additionally, the system helps track and manage student participation credits earned through events. Committee members can also export student and event data for reporting and management purposes.
---

# 🚀 Features

- Admin/Committee Event Management
- Student Registration & Login
- Add, Update & Delete Events
- Event Posters/Image Upload
- Email Notifications to Students
- Student Event Registration
- Super Admin Role Management
- Responsive UI

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Firebase Storage
- Nodemailer

---

# 📂 Project Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/eventmate.git
```

---

# ⚛️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

# 🔥 Backend Setup

```bash
cd backend
npm install
nodemon index.js
```

Backend will run on:

```bash
http://localhost:4000
```

---

# 👑 Super Admin Setup

To make a user Super Admin:

Go to MongoDB database and change the user's role manually.

Example:

```json
{
  "role": "superadmin"
}
```

You can update it directly from MongoDB Compass or MongoDB Atlas.

---

# 🔐 Environment Variables

Create `.env` file inside backend folder.

Example:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

# 📁 Folder Structure

```bash
EventMate/
│
├── frontend/
├── backend/
│
├── uploads/
├── package.json
└── README.md
```

---

# 📸 Main Modules

- Authentication System
- Event Management
- Student Dashboard
- Committee Dashboard
- Super Admin Panel
- Email Notification System

---

# 📌 Future Improvements

- Certificate Generation
- Mobile Application


---
