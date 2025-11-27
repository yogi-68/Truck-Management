# 🚛 Truck Trip & Goods Delivery Management System

A complete cloud-based logistics management system built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## ✨ Features

### 📋 Trip Sheet Management
- Auto-generated Trip IDs
- Track lorry, driver, route, and expenses
- Real-time trip status (Running/Completed)
- Diesel, toll, and expense tracking
- Automatic profit/loss calculations

### 📦 Goods Consignment Notes (GC Notes)
- Auto-generated GC Numbers with QR codes
- Complete consignor and consignee details
- GSTIN support for GST compliance
- Multiple payment modes (Cash, UPI, Account, ToPay)
- Delivery tracking (Pending/In-Transit/Delivered)
- Door delivery and office pickup options

### 💰 Payment & Revenue Management
- Freight collection tracking
- ToPay outstanding management
- Daily and monthly revenue reports
- Expense vs Revenue analytics
- Profit-Loss calculations per trip
- Payment history with multiple methods

### 📊 Reports & Analytics
- Date-wise GC Notes and Trips
- Driver-wise performance reports
- Truck utilization reports
- Consignor/Consignee history
- Outstanding ToPay amounts
- Export to PDF and Excel

### 👥 User Roles
- **Admin**: Full access to all modules, edit/delete permissions
- **Booking Clerk**: Create trips, GC notes, mark deliveries

### 📈 Dashboard
- Live statistics (trips, revenue, expenses)
- Pending deliveries tracking
- Outstanding payments
- Monthly profit/loss graphs
- Quick action shortcuts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **QR Codes**: qrcode library
- **Excel Export**: xlsx library

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (free tier works)

### Step 1: Clone and Install

```powershell
cd "c:\Users\yoges\OneDrive\Desktop\Truck Management"
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### Step 3: Configure Environment Variables

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy the entire content and run it in SQL Editor

This will create:
- All necessary tables (users, trucks, drivers, routes, trips, gc_notes, payments, expenses)
- Auto-generated ID functions
- Triggers for automatic calculations
- Row Level Security policies
- Useful views for reporting
- Seed data for common routes

### Step 5: Create First Admin User

After running migrations, create your first admin user:

1. Sign up through Supabase Auth (Dashboard → Authentication → Users → Add User)
2. Or use the sign-up functionality in the app once running
3. Run this SQL to make the user an admin:

```sql
INSERT INTO public.users (id, email, full_name, role, phone_number)
VALUES (
  'user-uuid-from-auth-users', 
  'admin@example.com', 
  'Admin Name', 
  'admin', 
  '+919876543210'
);
```

Replace `user-uuid-from-auth-users` with the UUID from `auth.users` table.

### Step 6: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Truck Management/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Main dashboard
│   ├── trips/               # Trip management
│   ├── gc-notes/            # GC Note management
│   ├── reports/             # Reports and analytics
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── supabase.ts          # Supabase client & types
│   └── utils.ts             # Utility functions
├── supabase/
│   └── migrations/          # Database schema
├── .env.local.example       # Environment variables template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── tailwind.config.ts       # Tailwind config
```

## 🚀 Usage Guide

### Creating a Trip

1. Go to Dashboard → Create New Trip
2. Select truck, driver, and route
3. Enter starting time and expenses
4. System auto-generates Trip ID
5. Add GC Notes to the trip

### Creating GC Note

1. Select an active trip
2. Fill consignor and consignee details
3. Enter goods description and weight
4. Set freight charges
5. Choose payment mode
6. System generates GC Number and QR code
7. Print or download PDF receipt

### Completing a Trip

1. Go to Trips list
2. Select trip to complete
3. Enter ending time
4. System calculates total revenue from attached GC notes
5. Mark trip as Completed

### Marking Delivery

1. Go to GC Notes list
2. Find pending delivery
3. Mark as delivered
4. Optional: Upload delivery proof image

### Viewing Reports

1. Go to Reports section
2. Select report type and date range
3. Apply filters (driver, truck, customer)
4. Export as PDF or Excel

## 📊 Database Schema

Key tables:
- `users` - Admin and clerk accounts
- `trucks` - Vehicle registry
- `drivers` - Driver information
- `routes` - Route master (Chennai-Bangalore, etc.)
- `trips` - Trip sheets with expenses
- `gc_notes` - Consignment notes
- `payments` - Payment records
- `expenses` - Additional expenses

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Supabase Auth for authentication
- Secure API routes
- Data validation at database level

## 🎨 Customization

### Adding New Routes

Go to Supabase SQL Editor:

```sql
INSERT INTO public.routes (from_location, to_location, distance_km, estimated_hours)
VALUES ('Mumbai', 'Delhi', 1400, 28);
```

### Modifying GC Note Fields

Edit the `gc_notes` table schema in `supabase/migrations/001_initial_schema.sql` and create a new migration.

## 📱 Future Enhancements

- [ ] WhatsApp/SMS notifications
- [ ] Mobile app for drivers
- [ ] GPS tracking integration
- [ ] Barcode scanner support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Invoice generation for monthly customers

## 🐛 Troubleshooting

### Database Connection Errors
- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active
- Ensure migrations have been run

### TypeScript Errors
```powershell
npm install
```

### Build Errors
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

## 📄 License

This project is proprietary software for logistics management.

## 👨‍💻 Support

For issues and feature requests, contact your development team.

---

**Built with ❤️ for efficient logistics management**
