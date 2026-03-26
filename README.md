# Nexstay_Apartment-Management-System
Mini_Project:Apartment Management System 
<h1 align="center">🏢 NEXSTAY — Apartment Management System</h1>

<p align="center">
  <b>A modern, full-stack web application for managing apartments, bookings, payments, and tenant services.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Backend-PHP%20(PDO)-777BB4?style=for-the-badge&logo=php" alt="PHP"/>
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Build-Vite%205-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Style-TailwindCSS%203-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/Platform-XAMPP-orange?style=flat-square" alt="Platform"/>
</p>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Installation & Setup](#-installation--setup)
- [▶️ Running the Application](#️-running-the-application)
- [👤 Default Accounts](#-default-accounts)
- [📖 User Guide](#-user-guide)
- [🔧 Admin Guide](#-admin-guide)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Reference](#-api-reference)
- [🛠️ Configuration](#️-configuration)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🏠 For Residents (Users)
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure registration & login with session-based auth |
| 🛏️ **Browse Rooms** | Explore available rooms across 5 floors with filtering |
| 📝 **Book Rooms** | Submit booking requests with preferred move-in dates |
| 💳 **Payments** | Initiate and track UPI-based payments with transaction IDs |
| 🔧 **Service Requests** | Raise maintenance/service requests (Plumbing, Electrical, etc.) |
| 👤 **Profile Management** | Edit profile, change password, view activity timeline |
| 📊 **Dashboard** | View current room, booking status, payment history, and services |

### 🛡️ For Administrators
| Feature | Description |
|---------|-------------|
| 📈 **Dashboard Overview** | Real-time stats: occupancy rate, revenue, active bookings |
| 🏢 **Room Management** | Create, update, delete rooms; manage floor assignments |
| 📋 **Booking Management** | Approve/reject bookings; manage booking lifecycle |
| 👥 **Resident Management** | View and manage all residents and their assigned rooms |
| 💰 **Payment Management** | Verify payments, track transaction history |
| 🔧 **Service Requests** | Assign, update status, and resolve service requests |
| 👤 **User Management** | Manage user accounts, toggle active status |
| 📜 **Activity Logs** | Full audit trail of system actions |
| ⚙️ **Settings** | System configuration and management |

### 🎨 Design Highlights
- **Glassmorphism UI** — Premium frosted-glass aesthetic throughout
- **Animated Background** — Dynamic particle animation system
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** — Eye-friendly dark mode with violet/purple accent palette
- **Micro-Animations** — Smooth transitions and hover effects using Framer Motion

---

## 🏗️ Tech Stack

```
┌──────────────────────────────────────────────────┐
│                   NEXSTAY STACK                  │
├──────────────┬───────────────────────────────────┤
│  Frontend    │  React 18 + Vite 5               │
│  Styling     │  TailwindCSS 3 + Custom CSS      │
│  Animations  │  Framer Motion (motion)           │
│  Icons       │  Lucide React                     │
│  Routing     │  React Router DOM v6              │
│  Backend     │  PHP 8+ (REST API)                │
│  Database    │  MySQL (via PDO)                  │
│  Server      │  Apache (XAMPP)                   │
│  Build Tool  │  Vite 5                           │
└──────────────┴───────────────────────────────────┘
```

---

## ⚙️ Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **XAMPP** | 8.0+ (includes Apache, MySQL, PHP) | [Download XAMPP](https://www.apachefriends.org/download.html) |
| **Node.js** | 18+ (includes npm) | [Download Node.js](https://nodejs.org/) |
| **Git** | Latest | [Download Git](https://git-scm.com/) |

> [!IMPORTANT]
> XAMPP must have **Apache** and **MySQL** modules. PHP version should be 8.0 or higher.

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
cd C:\xampp\htdocs
git clone https://github.com/YOUR_USERNAME/Apart.git
cd Apart
```

> [!NOTE]
> The project **must** be placed inside `C:\xampp\htdocs\Apart` (or your XAMPP's `htdocs` directory) for the PHP API to work correctly.

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This will install all required packages: React, Vite, TailwindCSS, Framer Motion, Lucide Icons, etc.

### Step 3: Set Up the Database

1. **Start XAMPP** — Open XAMPP Control Panel and start **Apache** and **MySQL**.

2. **Open phpMyAdmin** — Navigate to [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser.

3. **Import the database:**
   - Click on the **"Import"** tab at the top
   - Click **"Choose File"** and select `database.sql` from the project root
   - Click **"Go"** to execute

   **OR** use the command line:
   ```bash
   # Windows (XAMPP default path)
   C:\xampp\mysql\bin\mysql.exe -u root < database.sql
   ```

> [!TIP]
> The `database.sql` file will automatically:
> - Create the `nexstay` database
> - Create all 8 required tables
> - Seed 5 floors and 15 rooms with default data

### Step 4: Verify Database Configuration

The database connection is configured in `api/config.php`. Settings:

```php
DB_HOST = 'localhost'
DB_NAME = 'nexstay'
DB_USER = 'root'
DB_PASS = ''           // Default XAMPP has no password
DB_PORT = 3307         // Non-default port (used in this project)
DB_PORT_ALT = 3306     // Falls back to default port
```

> [!IMPORTANT]
> This project uses MySQL port **3307** (non-default). The system tries port 3307 first and falls back to the default port 3306 automatically. If your MySQL runs on a different port, update `DB_PORT` in `api/config.php`.

---

## ▶️ Running the Application

### Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**

### Start the Development Server

```bash
npm run dev
```

The app will start at: **[http://localhost:5173](http://localhost:5173)**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

> [!IMPORTANT]
> **Both XAMPP (Apache + MySQL) and the Vite dev server must be running simultaneously.**
> - Vite serves the React frontend on port `5173`
> - Vite proxies all `/api/*` requests to XAMPP's Apache on port `80`

### Build for Production (Optional)

```bash
npm run build
```

This creates an optimized build in the `dist/` folder. To preview:

```bash
npm run preview
```

---

## 👤 Default Accounts

By default, there is no hardcoded admin account for security reasons.

### Creating an Admin Account

1. Register a normal user account at [http://localhost:5173/auth](http://localhost:5173/auth) using:
   - **Email:** `admin@nexstay.com`
   - **Password:** `admin123`
2. Open **phpMyAdmin** → select `nexstay` database → `users` table
3. Change the user's `role` from `user` to `admin`
4. You can now login to the admin panel using this username and password.

### Creating a Regular User

Simply register at [http://localhost:5173/auth](http://localhost:5173/auth). New accounts are created with the `user` role by default.

---

## 📖 User Guide

### 🏠 Home Page
- Landing page with hero section, features overview, building preview, amenities, and testimonials
- Navigate to different sections using the top navigation bar

### 🔐 Registration & Login
1. Click **"Login"** in the navigation bar
2. Toggle between **Login** and **Register** modes
3. Register with: Name, Email, Phone, Password
4. Login with: Email and Password

### 🛏️ Browsing Rooms
1. Navigate to **"Rooms"** from the navbar
2. Browse rooms organized by floor (Floor 1–5)
3. Filter rooms by availability status
4. Click on any room card to view details

### 📝 Booking a Room
1. Go to a room's detail page
2. Click **"Book Now"**
3. Fill in: Move-in date, Duration (months), Additional notes
4. Submit — your booking will be in **"Pending"** status
5. Wait for admin approval

### 💳 Making Payments
1. Once your booking is **Approved**, a payment option appears
2. Click **"Pay Now"** to open the payment modal
3. Select payment method (UPI)
4. Enter transaction ID after completing payment
5. Submit for admin verification

### 🔧 Requesting Services
1. Navigate to **"Services"** (requires login)
2. Click **"New Request"**
3. Select: Service Type (Plumbing, Electrical, Cleaning, etc.)
4. Set Priority: Normal / High / Urgent
5. Describe the issue and submit

### 👤 Profile Dashboard
- View your current room assignment
- Track booking status history
- View payment records
- See service request updates
- Edit profile information
- Change password

---

## 🔧 Admin Guide

Admins are redirected to `/admin` upon login. The admin panel includes:

### 📊 Dashboard
- **Occupancy Rate** — percentage of booked/occupied rooms
- **Total Revenue** — sum of verified payments
- **Active Bookings** — count of current active bookings
- **Pending Requests** — service requests awaiting action

### 🏢 Rooms Management
- View all rooms organized by floor
- **Create** new rooms with: room number, floor, price, description, image
- **Edit** existing room details
- **Delete** rooms (with confirmation)
- Monitor room status: Available, Booked, Occupied, Maintenance, Inactive

### 📋 Bookings Management
- View all booking requests (Pending, Approved, Active, etc.)
- **Approve** or **Reject** pending bookings
- Approved bookings automatically update room status

### 💰 Payments
- View all payment transactions
- **Verify** payments submitted by users
- Track payment statuses: Pending → Initiated → Success → Verified

### 👥 Users & Residents
- View all registered users
- Toggle user active/inactive status
- View current residents and their assigned rooms

### 🔧 Service Requests
- View all service requests with priority indicators
- Update status: Pending → Assigned → In Progress → Completed
- Add admin notes to each request

### 📜 Activity Logs
- Complete audit trail of all system actions
- Filter by action type, user, and date range

---

## 🗄️ Database Schema

The system uses **8 tables** in the `nexstay` MySQL database:

```
┌───────────────────┐     ┌───────────────────┐
│      users        │     │      floors        │
├───────────────────┤     ├───────────────────┤
│ id (PK)           │     │ id (PK)           │
│ name              │     │ floor_number      │
│ email (UNIQUE)    │     │ name              │
│ phone             │     │ description       │
│ password          │     └────────┬──────────┘
│ role (user/admin) │              │
│ is_active         │              │
│ is_resident       │     ┌────────▼──────────┐
│ created_at        │     │      rooms        │
└────────┬──────────┘     ├───────────────────┤
         │                │ id (PK)           │
         │                │ room_number       │
         │                │ floor_id (FK)     │
         │                │ monthly_price     │
         │                │ status            │
         │                │ resident_id (FK)  │
         │                └────────┬──────────┘
         │                         │
    ┌────▼─────────────────────────▼──┐
    │           bookings              │
    ├─────────────────────────────────┤
    │ id (PK)                         │
    │ user_id (FK → users)            │
    │ room_id (FK → rooms)            │
    │ move_in_date                    │
    │ duration_months                 │
    │ monthly_amount / total_amount   │
    │ status (Pending/Approved/...)   │
    │ payment_status                  │
    │ approved_by (FK → users)        │
    └────────────┬────────────────────┘
                 │
    ┌────────────▼────────────────────┐
    │          payments               │
    ├─────────────────────────────────┤
    │ id (PK)                         │
    │ user_id (FK) / booking_id (FK)  │
    │ amount / payment_method         │
    │ transaction_id                  │
    │ status (Pending/.../Verified)   │
    └─────────────────────────────────┘

Other tables: service_requests, user_activity, booking_audit_log
```

### Seed Data
The `database.sql` includes:
- **5 Floors** (First Floor through Fifth Floor)
- **15 Rooms** (3 rooms per floor)
  - Floors 1–4: ₹15,000/month
  - Floor 5 (Premium): ₹18,000/month with terrace access

---

## 🔌 API Reference

All API endpoints are PHP files located in the `/api` directory. They accept and return JSON.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/register.php` | Register a new user |
| `GET/POST` | `/api/login.php` | Login (creates session) |
| `GET/POST` | `/api/logout.php` | Destroy session |
| `GET/POST` | `/api/user_current.php` | Get current logged-in user |

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/rooms.php` | List all rooms (with filters) |
| `GET/POST` | `/api/room_get.php?id=X` | Get room details by ID |
| `GET/POST` | `/api/room_create.php` | Admin: Create a room |
| `GET/POST` | `/api/room_update.php` | Admin: Update a room |
| `GET/POST` | `/api/room_delete.php` | Admin: Delete a room |
| `GET/POST` | `/api/room_availability.php` | Check room availability |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/booking_create.php` | Create a booking request |
| `GET/POST` | `/api/booking_approve.php` | Admin: Approve a booking |
| `GET/POST` | `/api/booking_cancel.php` | Cancel a booking |
| `GET/POST` | `/api/bookings_user.php` | List current user's bookings |
| `GET/POST` | `/api/bookings_admin.php` | Admin: List all bookings |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/payment_initiate.php` | Initiate a payment |
| `GET/POST` | `/api/payment_update.php` | Update payment details |
| `GET/POST` | `/api/payment_verify.php` | Admin: Verify a payment |
| `GET/POST` | `/api/payments_user.php` | List current user's payments |
| `GET/POST` | `/api/payments_admin.php` | Admin: List all payments |

### Service Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/service_create.php` | Submit a service request |
| `GET/POST` | `/api/service_status_update.php` | Update request status |
| `GET/POST` | `/api/services_user.php` | List user's service requests |
| `GET/POST` | `/api/services_admin.php` | Admin: List all requests |

### Users & Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/user_update.php` | Update profile info |
| `GET/POST` | `/api/user_update_password.php` | Change password |
| `GET/POST` | `/api/users_admin.php` | Admin: List all users |
| `GET/POST` | `/api/user_manage.php` | Admin: Manage user account |
| `GET/POST` | `/api/admin_summary.php` | Admin: Dashboard stats |
| `GET/POST` | `/api/residents_admin.php` | Admin: List residents |
| `GET/POST` | `/api/activity_admin.php` | Admin: Activity logs |

---

## 🛠️ Configuration

### Database Configuration (`api/config.php`)

| Constant | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | `localhost` | MySQL server host |
| `DB_NAME` | `nexstay` | Database name |
| `DB_USER` | `root` | MySQL username |
| `DB_PASS` | *(empty)* | MySQL password |
| `DB_PORT` | `3307` | Primary MySQL port **(non-default)** |
| `DB_PORT_ALT` | `3306` | Fallback port (default MySQL port) |

### Vite Configuration (`vite.config.mjs`)

| Setting | Value | Description |
|---------|-------|-------------|
| Dev Server | `localhost:5173` | Frontend development server |
| API Proxy | `localhost/Apart` | Proxies `/api/*` to XAMPP |
| Build Output | `dist/` | Production build directory |

### Customizing MySQL Port

This project is configured to use port **3307** (non-default). If your MySQL runs on the standard port `3306`, the system will fall back to it automatically. To use a completely different port, edit `api/config.php`:

```php
const DB_PORT     = YOUR_PORT;  // Primary port to try first
const DB_PORT_ALT = 3306;       // Fallback port
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code patterns and naming conventions
- PHP API files should return JSON responses
- React components use functional components with hooks
- Use TailwindCSS utility classes for styling
- Test both user and admin workflows after changes

---

<p align="center">
  <b>Built with ❤️ using React + PHP + MySQL</b>
  <br/>
  <sub>⭐ If this project helped you, consider giving it a star!</sub>
</p>
