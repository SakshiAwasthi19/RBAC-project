# PointMate - AICTE Points Tracker for VTU Students

PointMate is a comprehensive platform designed to help Vishweswaraya Technological University (VTU) students track and manage their AICTE Activity Points. It streamlines the process of discovering events, logging activities, and managing participation certificates, ensuring students meet their graduation requirements effortlessly.

---

## 📸 App Preview

### 🛡️ Admin Dashboard
![Admin Dashboard](screenshots/admin_dashboard.png)

---

### 🏠 Homepage
![Homepage](screenshots/homepage.png)

---

### 📅 Events Page
![Events Page](screenshots/events_page.png)

---

### 🎓 Student Dashboard
![Student Dashboard](screenshots/student_dashboard.png)

---

### 📋 Activity Log
![Activity Log](screenshots/activity_log.png)

---

### 🏅 Certificates Page
![Certificates Page](screenshots/certificates_page.png)

---

### 📝 Self Report Page
![Self Report Page](screenshots/self_report.png)

---

### 🏢 Organization Dashboard
![Organization Dashboard](screenshots/org_dashboard.png)

---

### ➕ Organization – Event Creation
![Event Creation Page](screenshots/org_event_creation.png)

---

### ⚙️ Organization – Event Management
![Event Management Page](screenshots/org_event_management.png)

---

## 🚀 Features

### For Students
- **Smart Dashboard**: Real-time visualization of AICTE points progress with a dynamic circular tracker.
- **Activity Timeline**: A premium, connected timeline showing recent engagements and their status (Approved/Pending).
- **Points Tracker**: Detailed breakdown of points earned across different AICTE categories.
- **Certificate Vault**: Secure storage and management of participation certificates and event photos.
- **Self-Reported Activities**: Ability to claim points for activities done outside the platform with AI-assisted validation.
- **Live Notifications**: Instant alerts for attendance marking, activity approvals, and upcoming events.

### For Organizations (Colleges/NGOs/Bodies)
- **Event Management**: Create and manage AICTE-approved campus events (restricted to verified organizations).
- **AI-Validation**: Platform uses Google's Generative AI to ensure events meet official AICTE guidelines.
- **Attendance System**: Quickly mark attendance, which automatically syncs points to student profiles.
- **Registration Review**: Streamlined interface to approve or reject student event registrations.

### For Admins
- **Global Oversight**: Centralized dashboard to monitor students, organizations, and events.
- **Organization Verification**: Review and approve/reject new organization registrations to ensure platform integrity.
- **Activity Verification**: Verify self-reported student activities to award AICTE points.
- **Data Integrity**: Manage platform users and ensure cascading deletion of inactive organizations.

---

## 🛠️ Tech Stack

### Frontend
- **React.js**: Core UI library.
- **Next.js**: Frontend framework/runtime for the client application.
- **Tailwind CSS**: Modern utility-first styling.
- **Framer Motion**: Smooth animations.
- **Lucide React**: Clean iconography.
- **React Hook Form**: Efficient form management.
- **React Router DOM**: Client-side route and dashboard flow handling.
- **Axios**: API communication.

### Backend
- **Node.js**: Server-side runtime.
- **Express.js**: Backend framework.
- **MongoDB & Mongoose**: NoSQL database and ORM.
- **JWT**: Secure token-based authentication.
- **Cloudinary**: Cloud-based media storage (Posters/Certificates).
- **Google Generative AI**: AI engine for event validation.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for media uploads)

### 1. Clone the repository
```bash
git clone <repository-url>
cd Pointmate_RBAC
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your MongoDB URL, JWT Secret, Cloudinary credentials, and Gemini API Key
```

### 3. Frontend Setup
```bash
cd frontend
# Install frontend dependencies
npm install

# Optional: if not already set at root, define frontend API URL for Next.js
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Running the Project
```bash
# Run Backend (from root)
npm run dev

# Run Frontend (from /frontend)
npm run dev
```

### 5. Frontend Production Commands (Next.js)
```bash
# From /frontend
npm run build
npm run start
```

---

## 📂 Project Structure

```text
Pointmate/
├── config/             # Database and Cloudinary configurations
├── controllers/        # Backend business logic
├── models/             # Mongoose schemas
├── routes/             # API endpoints
├── utils/              # Helper functions and AI validators
├── uploads/            # Local storage fallback for media
├── frontend/           # Next.js frontend application
│   ├── pages/          # Next.js entry pages and catch-all route
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and State management
│   │   ├── services/   # API service layer
│   │   └── pages/      # Main dashboard and landing pages
└── server.js           # Server entry point
```

---

## 📄 License
This project is licensed under the ISC License.

---

## 🌟 Acknowledgement
Developed to simplify the academic journey for VTU students.
