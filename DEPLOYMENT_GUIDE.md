# 🛡️ HU Campus Guard — Complete Deployment Guide (100% FREE)

## Project Stack
- **Frontend**: React.js → Deployed on **Vercel** (free)
- **Backend**: Node.js/Express.js → Deployed on **Render** (free)
- **Database**: MongoDB → Hosted on **MongoDB Atlas** (free 512MB)
- **File Uploads**: **Cloudinary** (free 25GB)
- **Email**: **Gmail SMTP** via Nodemailer (free)
- **Real-Time**: Socket.io (bundled with backend)

---

## STEP 1 — MongoDB Atlas Setup (Free Database)

### 1.1 Create Account
1. Go to https://cloud.mongodb.com and click **Try Free**
2. Sign up with Google or email
3. Choose **Free (Shared)** tier → M0 Sandbox
4. Select region closest to Pakistan: **AWS / ap-south-1 (Mumbai)**
5. Cluster name: `CampusGuard`

### 1.2 Create Database User
1. In Atlas sidebar → **Database Access** → **Add New Database User**
2. Username: `campusguard_user`
3. Password: Generate a strong password (save it!)
4. Role: **Atlas Admin** → **Add User**

### 1.3 Whitelist IP
1. Sidebar → **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** → `0.0.0.0/0`
3. Click **Confirm**

### 1.4 Get Connection String
1. Sidebar → **Database** → **Connect** → **Connect your application**
2. Driver: Node.js, Version: 5.5 or later
3. Copy the connection string — looks like:
```
mongodb+srv://campusguard_user:<password>@campusguard.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Replace `<password>` with your password
5. Add the database name: replace `/?retryWrites` with `/campusguard?retryWrites`

**Final MONGO_URI:**
```
mongodb+srv://campusguard_user:YOUR_PASSWORD@campusguard.xxxxx.mongodb.net/campusguard?retryWrites=true&w=majority
```

---

## STEP 2 — Cloudinary Setup (Free File Uploads)

1. Go to https://cloudinary.com → **Sign Up Free**
2. After login, go to **Dashboard**
3. Note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

No additional configuration needed — the app creates the upload folder automatically.

---

## STEP 3 — Gmail SMTP Setup (Free Email)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required for App Passwords)
3. Search **App Passwords** → Select app: **Mail**, device: **Other** → name it "HU Campus Guard"
4. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

**Use in .env:**
```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcdefghijklmnop   ← no spaces
```

---

## STEP 4 — Deploy Backend on Render (Free)

### 4.1 Prepare Backend
1. Make sure your backend code is in a GitHub repository
2. Push to GitHub:
```bash
cd campusguard
git init
git add .
git commit -m "Initial HU Campus Guard commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campusguard.git
git push -u origin main
```

### 4.2 Create Render Account
1. Go to https://render.com → **Sign Up** with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo

### 4.3 Configure the Web Service
| Setting | Value |
|---------|-------|
| Name | `campusguard-api` |
| Region | Singapore (closest to Pakistan) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | **Free** |

### 4.4 Add Environment Variables on Render
Click **Advanced** → **Add Environment Variable** for each:

```
PORT                    = 5000
NODE_ENV                = production
MONGO_URI               = mongodb+srv://...your full uri...
JWT_SECRET              = HU_CampusGuard_SuperSecret_Key_2024_HazaraUniversity
JWT_EXPIRE              = 7d
CLOUDINARY_CLOUD_NAME   = your_cloud_name
CLOUDINARY_API_KEY      = your_api_key
CLOUDINARY_API_SECRET   = your_api_secret
EMAIL_SERVICE           = gmail
EMAIL_USER              = your_gmail@gmail.com
EMAIL_PASS              = your_app_password
EMAIL_FROM              = HU Campus Guard <your_gmail@gmail.com>
FRONTEND_URL            = https://campusguard.vercel.app
CLIENT_URL              = https://campusguard.vercel.app
```

### 4.5 Deploy
1. Click **Create Web Service**
2. Wait 3–5 minutes for first deployment
3. Note your API URL: `https://campusguard-api.onrender.com`

> ⚠️ **Render free tier spins down after 15 mins inactivity.** First request after sleep takes ~30 seconds. This is normal for free tier.

---

## STEP 5 — Deploy Frontend on Vercel (Free)

### 5.1 Create Vercel Account
1. Go to https://vercel.com → **Sign Up** with GitHub

### 5.2 Configure Frontend
Create file `frontend/.env.production`:
```
REACT_APP_API_URL=https://campusguard-api.onrender.com/api
REACT_APP_SOCKET_URL=https://campusguard-api.onrender.com
```

Commit and push this file.

### 5.3 Import to Vercel
1. Vercel Dashboard → **New Project** → Import from GitHub
2. Select your repo
3. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Create React App |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |

### 5.4 Add Environment Variables on Vercel
In **Environment Variables** section:
```
REACT_APP_API_URL      = https://campusguard-api.onrender.com/api
REACT_APP_SOCKET_URL   = https://campusguard-api.onrender.com
```

### 5.5 Deploy
1. Click **Deploy**
2. Wait 2–3 minutes
3. Your site is live at: `https://campusguard.vercel.app` (or similar)

---

## STEP 6 — Update CORS on Render

Go back to Render → your service → **Environment** → update:
```
FRONTEND_URL = https://YOUR-ACTUAL-VERCEL-URL.vercel.app
```
Then **Manual Deploy** → **Deploy latest commit**

---

## STEP 7 — Seed the Database

### Option A: Run seed from local machine
```bash
# In backend folder, with your .env file filled
cd backend
npm install
node seed.js
```

### Option B: Run via Render Shell
1. Render Dashboard → your service → **Shell**
2. Type: `node seed.js`

---

## STEP 8 — Verify Everything Works

Test these URLs in your browser:
- ✅ `https://YOUR-API.onrender.com/api/health` → should return `{"success":true,...}`
- ✅ `https://campusguard.vercel.app` → should show landing page
- ✅ Login with `student@hu.edu.pk / password123`
- ✅ Login with `proctor@hu.edu.pk / password123`
- ✅ Login with `chief@hu.edu.pk / password123`

---

## LOCAL DEVELOPMENT SETUP

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/campusguard.git
cd campusguard

# ─── Backend ───
cd backend
npm install
cp .env.example .env
# Fill in .env with your values (MongoDB Atlas, Cloudinary, Gmail)
node seed.js          # seed demo accounts
npm run dev           # starts on http://localhost:5000

# ─── Frontend (new terminal) ───
cd ../frontend
npm install
cp .env.example .env
# .env already has REACT_APP_API_URL=http://localhost:5000/api
npm start             # starts on http://localhost:3000
```

---

## PROJECT FOLDER STRUCTURE

```
campusguard/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile, password
│   │   ├── complaintController.js # Full CRUD + assign + status + comments
│   │   ├── dashboardController.js # Analytics for all 3 roles
│   │   ├── notificationController.js
│   │   └── userController.js      # User management
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + role authorize
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── User.js                # Student, Proctor, Chief schema
│   │   ├── Complaint.js           # Full complaint schema with evidence
│   │   └── Notification.js        # Real-time notifications
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── emailService.js        # Nodemailer + HTML templates
│   │   ├── generateToken.js       # JWT generation
│   │   ├── notificationHelper.js  # Create + emit notifications
│   │   └── socketHandler.js       # Socket.io events + online tracking
│   ├── seed.js                    # Demo data seeder
│   ├── server.js                  # Express + Socket.io entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/shared/
    │   │   ├── Layout.js           # Sidebar + Topbar wrapper
    │   │   ├── Sidebar.js          # Navigation by role
    │   │   ├── StatusBadge.js      # Status, Priority, Category badges
    │   │   └── Topbar.js           # Header with notifications
    │   ├── context/
    │   │   ├── AuthContext.js      # Auth state + login/logout
    │   │   └── SocketContext.js    # Socket.io real-time state
    │   ├── pages/
    │   │   ├── LandingPage.js      # Public homepage
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── ForgotPasswordPage.js
    │   │   ├── ResetPasswordPage.js
    │   │   ├── TrackComplaintPage.js  # Anonymous tracking
    │   │   ├── NotificationsPage.js
    │   │   ├── NotFound.js
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.js
    │   │   │   ├── SubmitComplaint.js
    │   │   │   ├── MyComplaints.js
    │   │   │   ├── ComplaintDetail.js
    │   │   │   └── StudentProfile.js
    │   │   ├── proctor/
    │   │   │   ├── ProctorDashboard.js
    │   │   │   ├── AssignedComplaints.js
    │   │   │   └── ProctorComplaintDetail.js
    │   │   └── chiefproctor/
    │   │       ├── ChiefDashboard.js   ← charts & analytics
    │   │       ├── AllComplaints.js
    │   │       ├── ChiefComplaintDetail.js
    │   │       ├── ManageUsers.js
    │   │       └── CreateStaff.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── api.js             # Axios instance + interceptors
    │   ├── App.js                 # Routes + guards
    │   └── index.js
    ├── package.json
    └── .env.example
```

---

## API ENDPOINTS REFERENCE

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Student registration |
| POST | `/login` | Public | Login (all roles) |
| GET | `/me` | Private | Get own profile |
| PUT | `/profile` | Private | Update profile |
| PUT | `/change-password` | Private | Change password |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password/:token` | Public | Reset password |
| POST | `/create-staff` | Chief | Create proctor/chief account |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | List complaints (role-filtered) |
| POST | `/` | Private | Submit new complaint (+ file upload) |
| GET | `/track/:ref` | Public | Track anonymous complaint |
| GET | `/proctors` | Chief | Get all proctors for assignment |
| GET | `/:id` | Private | Get complaint detail |
| PUT | `/:id/assign` | Chief | Assign to proctor |
| PUT | `/:id/status` | Proctor/Chief | Update status + resolution |
| POST | `/:id/comment` | Private | Add comment (internal flag) |
| DELETE | `/:id` | Private | Delete complaint |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/chief` | Chief Proctor |
| GET | `/proctor` | Proctor |
| GET | `/student` | Student |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications |
| PUT | `/read-all` | Mark all as read |
| PUT | `/:id/read` | Mark one as read |
| DELETE | `/:id` | Delete notification |

### Users (`/api/users`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/proctors` | Private | List active proctors |
| GET | `/` | Chief | List all users |
| GET | `/:id` | Chief | Get user |
| PUT | `/:id/toggle-active` | Chief | Activate/deactivate |

---

## SOCKET.IO EVENTS

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user_join` | `userId` | Register user as online |
| `join_complaint` | `complaintId` | Join complaint room |
| `leave_complaint` | `complaintId` | Leave complaint room |
| `typing` | `{complaintId, userName}` | Typing indicator |
| `stop_typing` | `{complaintId}` | Stop typing |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `online_users` | `[userId, ...]` | Updated online user list |
| `new_notification` | `notification` | Real-time notification |
| `new_complaint` | `{complaint}` | New complaint (to admins) |
| `complaint_updated` | `complaint` | Complaint was updated |
| `new_comment` | `{complaintId, comment}` | New comment posted |
| `status_changed` | `{complaintId, status}` | Status was updated |
| `user_typing` | `{userName}` | Someone is typing |
| `user_stop_typing` | — | Typing stopped |

---

## FREE TIER LIMITS

| Service | Free Limit | Notes |
|---------|-----------|-------|
| MongoDB Atlas | 512 MB storage | More than enough for ~50K complaints |
| Render | 750 hrs/month, sleeps after 15min | Use UptimeRobot to prevent sleeping |
| Vercel | 100 GB bandwidth/month | Unlimited for normal use |
| Cloudinary | 25 GB storage, 25 GB bandwidth | ~50,000 images |
| Gmail SMTP | 500 emails/day | Sufficient for university use |

### Keep Render Awake (Optional)
Use https://uptimerobot.com (free):
1. Create account → **New Monitor**
2. Monitor Type: **HTTP(s)**
3. URL: `https://campusguard-api.onrender.com/api/health`
4. Monitoring Interval: **5 minutes**

This pings your backend every 5 minutes so it never sleeps.

---

## SECURITY CHECKLIST

- ✅ JWT authentication on all protected routes
- ✅ Role-based access control (student / proctor / chief_proctor)
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Rate limiting (200 req/15min)
- ✅ CORS restricted to frontend URL
- ✅ Input validation and sanitization
- ✅ File type and size validation on uploads
- ✅ Anonymous complaints don't expose student identity
- ✅ Internal comments hidden from students
- ✅ Environment variables for all secrets
- ✅ MongoDB indexes for performance

---

## TROUBLESHOOTING

**Backend won't start on Render:**
- Check logs → ensure all env variables are set
- Ensure `Root Directory` is set to `backend`
- Check MongoDB connection string has the database name

**Frontend can't connect to backend:**
- Check `REACT_APP_API_URL` points to your Render URL
- Check CORS: `FRONTEND_URL` on Render matches your Vercel URL exactly
- Look in browser DevTools → Network tab for failed requests

**Emails not sending:**
- Ensure 2FA is enabled on Gmail before generating App Password
- The App Password has no spaces when stored in .env
- Check Gmail isn't blocking the sign-in

**File uploads failing:**
- Verify Cloudinary credentials are correct
- Check file size (max 10MB per file, 5 files max)
- Allowed types: jpg, jpeg, png, gif, pdf, mp4, mov

**Socket.io not connecting:**
- On Render free tier, Socket.io requires the `polling` transport as fallback (already configured)
- Verify `REACT_APP_SOCKET_URL` is set correctly

---

*Built with ❤️ for Hazara University, Mansehra — HU Campus Guard MERN Stack Project*
