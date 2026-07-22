# RetailSmart AI – Intelligent Retail & E-Commerce Seller Management Platform

RetailSmart is a full-stack web application designed for **shop owners and e-commerce sellers** to efficiently manage their daily business operations from a single platform. It provides a centralized dashboard where sellers can manage products, monitor inventory, process customer orders, track payments, handle returns, and analyze sales performance.

Built with **Node.js**, **Express.js**, **Firebase Firestore**, and a modern **Bootstrap 5 / Chart.js** frontend, RetailSmart offers a secure, user-friendly, and scalable solution for retail business management. The platform helps sellers streamline operations, reduce manual work, and make informed business decisions through real-time analytics and organized data management.

Whether running a local retail shop or an online store, RetailSmart simplifies store management by bringing all essential business functions together in one easy-to-use platform.

---

## Key Features

- 🔐 **Authentication & Security**: Seller registration, JWT-based route authorization, password hashing with `bcryptjs`.
- 📊 **Interactive Dashboard**: KPI metric cards (Total Revenue, Total Orders, Active Products, Low Stock Warnings), recent orders ledger, inventory alert banners, and daily sales velocity bar charts.
- 📦 **Product Management**: Full CRUD catalog control, image upload handling via `Multer`, description tags, pricing updates, and search filters.
- 🏬 **Inventory Control**: Real-time stock counts, custom low-stock threshold triggers (`quantity <= low_stock_threshold`), and quick stock replenishment modals.
- 🧾 **Order Processing**: Multi-state order tracking (Pending, Processing, Delivered, Cancelled) with automatic inventory stock deduction/restoration on status transitions.
- 💳 **Payments & Billing**: Transaction history, revenue summaries (Total Earnings, Pending Payouts, Transaction Count), and payment status updates.
- 🔄 **Returns & Refunds**: Return ticket management with automated payment refund status updates upon approval.
- 📈 **Sales Analytics**: Monthly revenue trends (Chart.js line chart), daily sales velocity (Chart.js bar chart), best-selling product rankings, and low-velocity product identifiers.

---

## Technology Stack

### Frontend
- **HTML5 & Vanilla JavaScript**
- **Bootstrap 5** & **Bootstrap Icons**
- **Chart.js** (Data Visualizations)
- **Custom CSS3** (Dark Slate Glassmorphism Theme)

### Backend
- **Node.js** & **Express.js**
- **Firebase Admin SDK (v14)** (Firestore Database Connection)
- **JSON Web Tokens (JWT)** & **bcryptjs**
- **Multer** (Multipart File Uploads)

### Database
- **Firebase Firestore** (NoSQL Document Store)

---

## Project Folder Structure

```
RetailSmartAI/
│
├── .gitignore               # Git Ignore Rules (Configured to ignore secrets/node_modules)
├── README.md                # Project Documentation
├── package.json             # Root dependencies configuration
├── server.js                # Root server entry point
│
├── frontend/
│   ├── login.html           # Authentication Portal
│   ├── dashboard.html       # Seller Control Dashboard
│   ├── products.html        # Catalog Management
│   ├── inventory.html       # Stock Control Matrix
│   ├── orders.html          # Order Management & Actions
│   ├── payments.html        # Billing & Payout Ledger
│   ├── returns.html         # Return Tickets & Refunds
│   ├── analytics.html       # Sales Reports & Visualizations
│   ├── profile.html         # Store & Security Settings
│   ├── css/
│   │   └── style.css        # Premium Dark Theme Stylesheet
│   └── js/
│       └── main.js          # Shared Client Utilities & Auth Guard
│
├── backend/
│   ├── server.js            # Express Entry Point & Static Asset Host
│   ├── package.json         # Dependencies Config
│   ├── .env                 # Environment Configuration (Local only - gitignored)
│   ├── testFirestore.js     # Database Connection Diagnostic Tool
│   ├── config/
│   │   ├── firebase.js      # Firebase Admin Initialization Handler
│   │   └── firebase-service-account.json # Firebase Credentials (Local only - gitignored)
│   ├── controllers/         # Auth, Product, Inventory, Order, Payment, Return, Analytics Controllers
│   ├── routes/              # Express API Endpoint Routes
│   ├── middleware/          # JWT Auth Guard & Multer Image Upload Config
│   ├── models/              # Firestore Query Models (Seller, Product, Inventory, Order, Payment, Return, Analytics)
│   └── utils/
│
├── database/
│   └── seedFirestore.js     # Automated Firestore Mock Data Seeder Script
│
└── uploads/                 # Product Image Files Directory (Local only - gitignored)
```

---

## Installation & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- A Firebase Project with Firestore enabled.

---

### Step 1: Install Dependencies
Navigate to the `backend` directory and install the npm packages:

```bash
cd backend
npm install
```

---

### Step 2: Configure Firebase Credentials

1. Go to **Firebase Console** -> **Project Settings** -> **Service Accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Save the JSON key file inside the `backend/config/` directory as:
   `backend/config/firebase-service-account.json`

*(Alternatively, you can set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` inside `backend/.env`).*

---

### Step 3: Seed the Database
Run the automated Firestore seeding script to populate default demo data (seller account, products, stock levels, orders, payments, and analytics):

```bash
node database/seedFirestore.js
```

---

### Step 4: Launch the Platform

Start the Express backend server:

```bash
cd backend
npm run dev
# or
node server.js
```

Access the application in your browser at:
👉 **`http://localhost:5000`**

---

## Default Test Credentials

Use these pre-configured credentials to log in:

- **Email**: `demo@retailsmart.com`
- **Password**: `password123`

---

## API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register seller account | No |
| `POST` | `/api/auth/login` | Seller sign-in & JWT issue | No |
| `GET` | `/api/auth/profile` | Get authenticated seller profile | Yes |
| `GET` | `/api/products` | Get products list (supports `?search=`) | Yes |
| `POST` | `/api/products` | Create product with image upload | Yes |
| `PUT` | `/api/products/:id` | Update product details | Yes |
| `DELETE`| `/api/products/:id` | Delete product listing | Yes |
| `GET` | `/api/inventory` | View stock levels with product joins | Yes |
| `PUT` | `/api/inventory/:productId` | Update stock quantity & threshold | Yes |
| `GET` | `/api/inventory/alerts` | Get low stock warnings | Yes |
| `GET` | `/api/orders` | Fetch seller orders list | Yes |
| `PUT` | `/api/orders/:id/status` | Update status (Pending/Processing/Delivered/Cancelled) | Yes |
| `GET` | `/api/payments` | Retrieve billing transaction ledger | Yes |
| `GET` | `/api/payments/summary` | Revenue & pending payouts summary | Yes |
| `GET` | `/api/returns` | List product return requests | Yes |
| `PUT` | `/api/returns/:id/status` | Approve/Reject returns & issue refunds | Yes |
| `GET` | `/api/analytics/dashboard` | KPI metrics, charts & product velocity rankings | Yes |

---

## License

ISC License. Built for RetailSmart AI Platform.
