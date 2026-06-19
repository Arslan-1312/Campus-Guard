# 🛡️ HU Campus Guard

**Hazara University Campus Issue Reporting & Management System**

A full-stack MERN application that allows students to report campus issues (harassment, bullying, ragging, smoking, etc.) and enables proctors and the chief proctor to manage and resolve them — with real-time notifications, anonymous complaint support, evidence uploads, and analytics.

---

## Features

### Student
- Register & login
- Submit complaints (named or **anonymous**)
- Upload evidence (photos, videos, PDFs)
- Track anonymous complaints via reference number
- Real-time status updates & comments
- Email notifications at every stage

### Proctor
- Dashboard with assigned complaint stats
- View and manage assigned complaints
- Update status (In Progress / Resolved / Rejected)
- Post comments (public or internal/private)
- Email & real-time notifications

### Chief Proctor
- Full dashboard with charts (status, category, monthly trend)
- View ALL complaints system-wide
- Assign complaints to proctors
- Override priority, add notes
- Manage all users (activate/deactivate)
- Create proctor and chief proctor accounts
- Proctor performance analytics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Bootstrap 5, Chart.js, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| File Upload | Cloudinary + Multer |
| Email | Nodemailer + Gmail SMTP |
| Real-Time | Socket.io |

