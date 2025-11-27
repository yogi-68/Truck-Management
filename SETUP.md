# 🚀 Quick Setup Guide

## Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js 18 or higher installed
- ✅ npm or yarn package manager
- ✅ A Supabase account (free tier is fine)
- ✅ Git (optional, for version control)

## Step-by-Step Installation

### 1️⃣ Install Dependencies

Open PowerShell in the project folder and run:

```powershell
npm install
```

This will install all required packages:
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS (styling)
- Supabase client
- shadcn/ui components
- PDF generation libraries
- Excel export utilities
- And more...

**Expected time**: 2-5 minutes depending on internet speed

### 2️⃣ Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "New Project"
3. Sign in with GitHub (recommended) or email
4. Create a new organization (if first time)
5. Click "New Project"
6. Fill in:
   - **Name**: truck-management (or your choice)
   - **Database Password**: Create a strong password and SAVE IT
   - **Region**: Choose closest to you (e.g., Mumbai for India)
7. Click "Create new project"
8. Wait 2-3 minutes for setup to complete

### 3️⃣ Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: A long key starting with `eyJ...`

**COPY THESE - YOU'LL NEED THEM NEXT!**

### 4️⃣ Configure Environment Variables

1. In your project folder, find `.env.local.example`
2. Create a NEW file called `.env.local` (remove `.example`)
3. Open `.env.local` and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace** with your actual values from Step 3!

### 5️⃣ Set Up Database

1. Go back to Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file: `supabase/migrations/001_initial_schema.sql`
5. **Copy ALL the content** (Ctrl+A, Ctrl+C)
6. **Paste** into Supabase SQL Editor
7. Click **Run** (or press Ctrl+Enter)

**You should see**: "Success. No rows returned"

This creates:
- ✅ All database tables
- ✅ Security policies
- ✅ Auto-increment functions
- ✅ Sample routes (Chennai-Bangalore, etc.)

### 6️⃣ Create Your Admin Account

#### Option A: Using Supabase Dashboard (Easier)

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: your email
   - **Password**: your password
   - Check "Auto Confirm User"
4. Click **Create user**
5. **Copy the User ID** shown (looks like: `550e8400-e29b-41d4-a716-446655440000`)

Now go back to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, full_name, role, phone_number)
VALUES (
  'paste-your-user-id-here',
  'your-email@example.com',
  'Your Full Name',
  'admin',
  '+919876543210'
);
```

**Replace**:
- `paste-your-user-id-here` → Your copied User ID
- `your-email@example.com` → Your email
- `Your Full Name` → Your name
- `+919876543210` → Your phone number

Click **Run**

#### Option B: Using the App (After First Run)

Sign up through the app interface, then manually promote to admin using SQL above.

### 7️⃣ Start the Application

In PowerShell, run:

```powershell
npm run dev
```

**You should see**:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in 2.5s
```

### 8️⃣ Open in Browser

1. Open your browser
2. Go to: http://localhost:3000
3. You should see the dashboard!

## 🎉 Success Checklist

If everything worked, you should be able to:
- ✅ See the Dashboard with statistics
- ✅ Navigate between pages (Trips, GC Notes, Reports)
- ✅ Create new trips
- ✅ Create GC notes
- ✅ Generate PDFs

## ❌ Common Issues & Fixes

### Issue: "Cannot find module" errors

**Fix**: Make sure you ran `npm install` and it completed successfully.

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Database connection errors

**Fix**: Check your `.env.local` file:
- File name must be exactly `.env.local` (not `.env.local.txt`)
- No spaces around the `=` sign
- Restart dev server after changing: Ctrl+C, then `npm run dev`

### Issue: "Relation does not exist" database errors

**Fix**: Run the migration SQL again in Supabase SQL Editor

### Issue: Can't log in

**Fix**: 
1. Make sure you created the user in Supabase Auth
2. Make sure you inserted the record into `public.users` table with matching ID
3. Password must be at least 6 characters

### Issue: Page not loading / blank screen

**Fix**:
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

## 📚 Next Steps

After successful setup:

1. **Add Master Data**:
   - Add your trucks: Dashboard → Master Data → Trucks
   - Add drivers: Dashboard → Master Data → Drivers
   - Add routes: Or use SQL to add more routes

2. **Create First Trip**:
   - Go to Trips → Create New Trip
   - Select truck, driver, and route
   - Enter starting details

3. **Create First GC Note**:
   - Go to GC Notes → Create New
   - Select the trip you created
   - Fill in consignor and consignee details
   - Generate PDF!

4. **Explore Features**:
   - View reports
   - Export to Excel
   - Print GC notes
   - Track deliveries

## 🆘 Need Help?

If you're stuck:

1. Check this file again carefully
2. Check the main README.md for more details
3. Verify all environment variables are correct
4. Check browser console for errors (F12)
5. Check terminal for error messages

## 🔧 Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run lint
```

## 📞 Support

This system is ready for production use. All features are implemented:
- ✅ Trip Management
- ✅ GC Note Management
- ✅ PDF Generation
- ✅ Excel Export
- ✅ Reports
- ✅ Dashboard Analytics
- ✅ Role-based Access
- ✅ QR Code Generation

Happy Managing! 🚛📦
