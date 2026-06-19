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

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/campusguard.git
cd campusguard

# Backend
cd backend && npm install
cp .env.example .env   # Fill in your credentials
node seed.js           # Create demo accounts
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm install
cp .env.example .env
npm start              # http://localhost:3000
```

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| 👨‍🎓 Student | student@hu.edu.pk | password123 |
| 👮 Proctor | proctor@hu.edu.pk | password123 |
| 🏛️ Chief Proctor | chief@hu.edu.pk | password123 |

---

## Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions to deploy **100% free** using:
- MongoDB Atlas (database)
- Render (backend)
- Vercel (frontend)
- Cloudinary (file uploads)
- Gmail SMTP (emails)

---

*Developed for Hazara University, Mansehra, KPK, Pakistan*
