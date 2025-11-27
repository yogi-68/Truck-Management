-- ============================================
-- TRUCK TRIP & GOODS DELIVERY MANAGEMENT SYSTEM
-- Database Schema for Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'clerk')),
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: trucks
-- ============================================
CREATE TABLE IF NOT EXISTS public.trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lorry_number TEXT UNIQUE NOT NULL,
  model TEXT,
  capacity_kg NUMERIC(10,2),
  registration_date DATE,
  insurance_expiry DATE,
  fitness_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trucks_lorry_number ON public.trucks(lorry_number);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON public.trucks(status);

-- ============================================
-- TABLE: drivers
-- ============================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT,
  license_expiry DATE,
  date_of_birth DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_license ON public.drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers(phone_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- ============================================
-- TABLE: routes
-- ============================================
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  distance_km NUMERIC(10,2) NOT NULL,
  estimated_hours NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_location, to_location)
);

CREATE INDEX IF NOT EXISTS idx_routes_from_to ON public.routes(from_location, to_location);

-- ============================================
-- TABLE: trips (Trip Sheet)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id TEXT UNIQUE NOT NULL,
  truck_id UUID NOT NULL REFERENCES public.trucks(id) ON DELETE RESTRICT,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  starting_time TIMESTAMP WITH TIME ZONE NOT NULL,
  ending_time TIMESTAMP WITH TIME ZONE,
  total_distance_km NUMERIC(10,2) NOT NULL,
  diesel_liters NUMERIC(10,2) DEFAULT 0,
  diesel_cost NUMERIC(12,2) DEFAULT 0,
  toll_charges NUMERIC(12,2) DEFAULT 0,
  other_expenses NUMERIC(12,2) DEFAULT 0,
  driver_allowance NUMERIC(12,2) DEFAULT 0,
  total_trip_expense NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(diesel_cost, 0) + 
    COALESCE(toll_charges, 0) + 
    COALESCE(other_expenses, 0) + 
    COALESCE(driver_allowance, 0)
  ) STORED,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  trip_profit_loss NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(total_revenue, 0) - (
      COALESCE(diesel_cost, 0) + 
      COALESCE(toll_charges, 0) + 
      COALESCE(other_expenses, 0) + 
      COALESCE(driver_allowance, 0)
    )
  ) STORED,
  trip_status TEXT DEFAULT 'running' CHECK (trip_status IN ('running', 'completed')),
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_trip_id ON public.trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck_id ON public.trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON public.trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(trip_status);
CREATE INDEX IF NOT EXISTS idx_trips_starting_time ON public.trips(starting_time);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at);

-- ============================================
-- TABLE: gc_notes (Goods Consignment Note)
-- ============================================
CREATE TABLE IF NOT EXISTS public.gc_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gc_number TEXT UNIQUE NOT NULL,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Consignor (Sender) Details
  consignor_name TEXT NOT NULL,
  consignor_address TEXT NOT NULL,
  consignor_phone TEXT NOT NULL,
  consignor_gstin TEXT,
  
  -- Consignee (Receiver) Details
  consignee_name TEXT NOT NULL,
  consignee_address TEXT NOT NULL,
  consignee_phone TEXT NOT NULL,
  consignee_gstin TEXT,
  
  -- Goods Details
  number_of_articles INTEGER NOT NULL,
  description_of_goods TEXT NOT NULL,
  weight_kg NUMERIC(10,2) NOT NULL,
  
  -- Freight Charges
  freight_rate NUMERIC(10,2) NOT NULL,
  freight_amount NUMERIC(12,2) NOT NULL,
  hc_charge NUMERIC(12,2) DEFAULT 0,
  sc_charge NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(freight_amount, 0) + 
    COALESCE(hc_charge, 0) + 
    COALESCE(sc_charge, 0)
  ) STORED,
  
  -- Payment Details
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'account', 'topay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'topay')),
  
  -- Delivery Details
  delivery_option TEXT NOT NULL CHECK (delivery_option IN ('office', 'door_delivery')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in_transit', 'delivered')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivered_by UUID REFERENCES public.users(id),
  delivery_proof_image TEXT,
  
  -- QR Code & Tracking
  qr_code_data TEXT,
  
  -- Notes
  remarks TEXT,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gc_notes_gc_number ON public.gc_notes(gc_number);
CREATE INDEX IF NOT EXISTS idx_gc_notes_trip_id ON public.gc_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_gc_notes_date_time ON public.gc_notes(date_time);
CREATE INDEX IF NOT EXISTS idx_gc_notes_consignor ON public.gc_notes(consignor_name);
CREATE INDEX IF NOT EXISTS idx_gc_notes_consignee ON public.gc_notes(consignee_name);
CREATE INDEX IF NOT EXISTS idx_gc_notes_payment_status ON public.gc_notes(payment_status);
CREATE INDEX IF NOT EXISTS idx_gc_notes_delivery_status ON public.gc_notes(delivery_status);
CREATE INDEX IF NOT EXISTS idx_gc_notes_created_at ON public.gc_notes(created_at);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gc_note_id UUID NOT NULL REFERENCES public.gc_notes(id) ON DELETE RESTRICT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
  reference_number TEXT,
  remarks TEXT,
  received_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_gc_note_id ON public.payments(gc_note_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

-- ============================================
-- TABLE: expenses
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('diesel', 'toll', 'maintenance', 'driver_allowance', 'other')),
  amount NUMERIC(12,2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  receipt_image TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_type ON public.expenses(expense_type);

-- ============================================
-- FUNCTION: Auto-generate Trip ID
-- ============================================
CREATE OR REPLACE FUNCTION generate_trip_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.trips 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_id := 'TRIP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Auto-generate GC Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_gc_number()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.gc_notes 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_id := 'GC-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update Trip Revenue
-- ============================================
CREATE OR REPLACE FUNCTION update_trip_revenue()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.trips
  SET total_revenue = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM public.gc_notes
    WHERE trip_id = NEW.trip_id
  )
  WHERE id = NEW.trip_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating trip revenue
DROP TRIGGER IF EXISTS trigger_update_trip_revenue ON public.gc_notes;
CREATE TRIGGER trigger_update_trip_revenue
AFTER INSERT OR UPDATE OR DELETE ON public.gc_notes
FOR EACH ROW
EXECUTE FUNCTION update_trip_revenue();

-- ============================================
-- FUNCTION: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trucks_updated_at ON public.trucks;
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gc_notes_updated_at ON public.gc_notes;
CREATE TRIGGER update_gc_notes_updated_at BEFORE UPDATE ON public.gc_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gc_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Users: Admin can see all, clerks can see themselves
DROP POLICY IF EXISTS "Users: Admin full access" ON public.users;
CREATE POLICY "Users: Admin full access" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users: Clerk self access" ON public.users;
CREATE POLICY "Users: Clerk self access" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Trucks: All authenticated users can view, only admin can modify
DROP POLICY IF EXISTS "Trucks: View for authenticated" ON public.trucks;
CREATE POLICY "Trucks: View for authenticated" ON public.trucks
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Trucks: Admin modify" ON public.trucks;
CREATE POLICY "Trucks: Admin modify" ON public.trucks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drivers: All authenticated users can view, only admin can modify
DROP POLICY IF EXISTS "Drivers: View for authenticated" ON public.drivers;
CREATE POLICY "Drivers: View for authenticated" ON public.drivers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Drivers: Admin modify" ON public.drivers;
CREATE POLICY "Drivers: Admin modify" ON public.drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Routes: All authenticated users can access
DROP POLICY IF EXISTS "Routes: All authenticated" ON public.routes;
CREATE POLICY "Routes: All authenticated" ON public.routes
  FOR ALL USING (auth.role() = 'authenticated');

-- Trips: All authenticated can view, clerks can create, admin can modify
DROP POLICY IF EXISTS "Trips: View for authenticated" ON public.trips;
CREATE POLICY "Trips: View for authenticated" ON public.trips
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Trips: Clerk create" ON public.trips;
CREATE POLICY "Trips: Clerk create" ON public.trips
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Trips: Admin modify" ON public.trips;
CREATE POLICY "Trips: Admin modify" ON public.trips
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Trips: Admin delete" ON public.trips;
CREATE POLICY "Trips: Admin delete" ON public.trips
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- GC Notes: All authenticated can view, clerks can create, admin can modify
DROP POLICY IF EXISTS "GC Notes: View for authenticated" ON public.gc_notes;
CREATE POLICY "GC Notes: View for authenticated" ON public.gc_notes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "GC Notes: Clerk create" ON public.gc_notes;
CREATE POLICY "GC Notes: Clerk create" ON public.gc_notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "GC Notes: Clerk update own" ON public.gc_notes;
CREATE POLICY "GC Notes: Clerk update own" ON public.gc_notes
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "GC Notes: Admin full modify" ON public.gc_notes;
CREATE POLICY "GC Notes: Admin full modify" ON public.gc_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments: All authenticated can view and create
DROP POLICY IF EXISTS "Payments: All authenticated" ON public.payments;
CREATE POLICY "Payments: All authenticated" ON public.payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Expenses: All authenticated can access
DROP POLICY IF EXISTS "Expenses: All authenticated" ON public.expenses;
CREATE POLICY "Expenses: All authenticated" ON public.expenses
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: Default Routes
-- ============================================
INSERT INTO public.routes (from_location, to_location, distance_km, estimated_hours) VALUES
  ('Chennai', 'Bengaluru', 345, 6.5),
  ('Bengaluru', 'Chennai', 345, 6.5),
  ('Chennai', 'Mumbai', 1340, 24),
  ('Mumbai', 'Chennai', 1340, 24),
  ('Bengaluru', 'Hyderabad', 570, 10),
  ('Hyderabad', 'Bengaluru', 570, 10),
  ('Chennai', 'Hyderabad', 630, 11),
  ('Hyderabad', 'Chennai', 630, 11)
ON CONFLICT (from_location, to_location) DO NOTHING;

-- ============================================
-- VIEWS: Useful reporting views
-- ============================================

-- View: Daily Revenue Summary
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
  DATE(date_time) as date,
  COUNT(*) as total_gc_notes,
  SUM(total_amount) as total_revenue,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN payment_status = 'topay' THEN total_amount ELSE 0 END) as topay_amount,
  SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
  SUM(CASE WHEN delivery_status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM public.gc_notes
GROUP BY DATE(date_time)
ORDER BY DATE(date_time) DESC;

-- View: Driver Performance
CREATE OR REPLACE VIEW driver_performance AS
SELECT 
  d.id,
  d.driver_name,
  d.phone_number,
  COUNT(t.id) as total_trips,
  SUM(t.total_distance_km) as total_distance,
  SUM(t.total_revenue) as total_revenue,
  SUM(t.total_trip_expense) as total_expenses,
  SUM(t.trip_profit_loss) as total_profit
FROM public.drivers d
LEFT JOIN public.trips t ON d.id = t.driver_id
GROUP BY d.id, d.driver_name, d.phone_number;

-- View: Outstanding ToPay
CREATE OR REPLACE VIEW outstanding_topay AS
SELECT 
  gc.id,
  gc.gc_number,
  gc.date_time,
  gc.consignor_name,
  gc.consignee_name,
  gc.total_amount,
  t.trip_id,
  t.from_location,
  t.to_location
FROM public.gc_notes gc
JOIN public.trips t ON gc.trip_id = t.id
WHERE gc.payment_status = 'topay'
ORDER BY gc.date_time DESC;

-- View: Truck Utilization
CREATE OR REPLACE VIEW truck_utilization AS
SELECT 
  tr.id,
  tr.lorry_number,
  COUNT(t.id) as total_trips,
  SUM(t.total_distance_km) as total_distance,
  SUM(t.total_revenue) as total_revenue,
  SUM(t.diesel_cost) as total_diesel_cost,
  AVG(t.trip_profit_loss) as avg_profit_per_trip
FROM public.trucks tr
LEFT JOIN public.trips t ON tr.id = t.truck_id
GROUP BY tr.id, tr.lorry_number;
