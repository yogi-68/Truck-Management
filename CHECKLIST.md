# ✅ PROJECT CHECKLIST - Verify Your Setup

Use this checklist to ensure everything is set up correctly.

## 📋 Pre-Installation Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Code editor (VS Code recommended)

## 📦 Installation Checklist

- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors
- [ ] No red error messages in terminal

## 🔐 Supabase Setup Checklist

- [ ] Created new Supabase project
- [ ] Project is fully initialized (not in setup mode)
- [ ] Copied Project URL from settings
- [ ] Copied Anon Key from settings
- [ ] Created `.env.local` file (not `.env.local.example`)
- [ ] Pasted correct URL and Key in `.env.local`
- [ ] No extra spaces or quotes around values

## 💾 Database Setup Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied entire `001_initial_schema.sql` file
- [ ] Pasted and ran SQL successfully
- [ ] Saw "Success. No rows returned" message
- [ ] Checked tables exist (8 tables should be visible)
- [ ] Verified routes table has sample data

### Tables to Verify (in Table Editor):
- [ ] users
- [ ] trucks
- [ ] drivers
- [ ] routes (should have 8 sample routes)
- [ ] trips
- [ ] gc_notes
- [ ] payments
- [ ] expenses

## 👤 User Setup Checklist

- [ ] Created user in Supabase Authentication
- [ ] Copied User ID (UUID format)
- [ ] Ran INSERT SQL for public.users table
- [ ] User role is set to 'admin'
- [ ] Email matches between auth.users and public.users

## 🚀 Application Startup Checklist

- [ ] Ran `npm run dev` successfully
- [ ] Saw "Ready in X.Xs" message
- [ ] No compilation errors
- [ ] Server running on http://localhost:3000

## 🌐 Browser Verification Checklist

- [ ] Opened http://localhost:3000
- [ ] Page loads without errors
- [ ] Dashboard displays (even with 0 statistics)
- [ ] Sidebar navigation visible
- [ ] No JavaScript console errors (F12)

## 🔍 Functionality Test Checklist

### Navigation
- [ ] Can click Dashboard link
- [ ] Can click Trips link
- [ ] Can click GC Notes link
- [ ] Can click Reports link
- [ ] Can click Master Data link

### Dashboard
- [ ] Statistics cards display
- [ ] Shows "Trips Today: 0" or actual number
- [ ] Shows "GC Notes Today: 0" or actual number
- [ ] Revenue displays as ₹0.00 or actual amount
- [ ] Quick Actions section visible

## 🛠️ Optional: Test Data Creation

### Add a Truck
- [ ] Go to Supabase Table Editor → trucks
- [ ] Add new row with lorry_number (e.g., "TN01AB1234")
- [ ] Set status to "active"
- [ ] Save successfully

### Add a Driver
- [ ] Go to Supabase Table Editor → drivers
- [ ] Add new row with driver_name
- [ ] Add license_number and phone_number
- [ ] Set status to "active"
- [ ] Save successfully

### Create Test Trip (via SQL)
```sql
INSERT INTO public.trips (
  trip_id, truck_id, driver_id, route_id,
  from_location, to_location, starting_time,
  total_distance_km, diesel_liters, diesel_cost,
  toll_charges, other_expenses, driver_allowance,
  trip_status
) VALUES (
  'TRIP-TEST-001',
  'your-truck-uuid',
  'your-driver-uuid',
  'your-route-uuid',
  'Chennai',
  'Bengaluru',
  NOW(),
  345,
  50,
  5000,
  500,
  200,
  500,
  'running'
);
```

- [ ] Test trip created
- [ ] Appears in dashboard statistics
- [ ] Trip shows in Trips list (once page is created)

## 📄 PDF Generation Test (After Setup)

- [ ] Can generate GC Note PDF
- [ ] PDF contains QR code
- [ ] Company details show correctly
- [ ] Consignor/Consignee details display
- [ ] Amount calculations are correct

## 📊 Excel Export Test (After Setup)

- [ ] Can export GC Notes to Excel
- [ ] Excel file downloads successfully
- [ ] Data is properly formatted
- [ ] Column widths are readable
- [ ] Can open file in Excel/LibreOffice

## 🔒 Security Test

- [ ] Cannot access database without authentication
- [ ] RLS policies are active
- [ ] Different users see appropriate data
- [ ] Admin has full access
- [ ] Clerk has limited access

## ⚠️ Common Issues - Quick Fixes

### Issue: npm install fails
- [ ] Try: `Remove-Item -Recurse node_modules; npm install`
- [ ] Check internet connection
- [ ] Try: `npm cache clean --force`

### Issue: "Cannot find module" errors
- [ ] Verify npm install completed
- [ ] Check package.json exists
- [ ] Restart terminal/VS Code

### Issue: Database connection fails
- [ ] Check .env.local file name (not .txt)
- [ ] Verify no spaces in environment variables
- [ ] Restart dev server after .env changes
- [ ] Check Supabase project is active

### Issue: "Relation does not exist"
- [ ] Re-run migration SQL
- [ ] Check SQL ran without errors
- [ ] Verify table names in Supabase dashboard

### Issue: Login fails
- [ ] Check user exists in auth.users
- [ ] Check user exists in public.users
- [ ] Verify IDs match between tables
- [ ] Check password is 6+ characters

## 🎉 Success Indicators

You're ready when:
- ✅ Dashboard shows statistics (even if 0)
- ✅ Navigation works between pages
- ✅ No console errors
- ✅ Can create test data in database
- ✅ Database queries work

## 📞 Need Help?

If stuck after checking all items:

1. **Read error messages carefully** - they usually tell you what's wrong
2. **Check browser console** (F12) for JavaScript errors
3. **Check terminal** for server errors
4. **Verify .env.local** settings again
5. **Re-run database migration** SQL
6. **Start fresh**: Delete node_modules, reinstall, restart

## 🚀 Next Steps After Verification

Once all checkboxes are checked:

1. ✅ Add your company details to PDF templates
2. ✅ Add your actual trucks and drivers
3. ✅ Create real trips and GC notes
4. ✅ Test PDF generation
5. ✅ Train your staff
6. ✅ Go live!

## 📝 Production Readiness Checklist

Before going live:
- [ ] Change default company name in PDFs
- [ ] Add company logo (optional)
- [ ] Set up regular database backups
- [ ] Create additional admin/clerk users
- [ ] Test all features with real data
- [ ] Train team on system usage
- [ ] Keep Supabase dashboard accessible
- [ ] Note down admin passwords securely

---

**Print this checklist and tick items as you complete them!** ✅

**Having issues?** See SETUP.md for detailed troubleshooting.
