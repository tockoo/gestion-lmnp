
-- Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'appartement',
  surface NUMERIC NOT NULL DEFAULT 0,
  acquisition_value NUMERIC NOT NULL DEFAULT 0,
  acquisition_date TEXT NOT NULL DEFAULT '',
  tax_regime TEXT NOT NULL DEFAULT 'reel-simplifie',
  monthly_copro_charges NUMERIC NOT NULL DEFAULT 0,
  annual_property_tax NUMERIC NOT NULL DEFAULT 0,
  rental_type TEXT NOT NULL DEFAULT 'longue-duree',
  nightly_rate NUMERIC,
  depreciation_building_value NUMERIC NOT NULL DEFAULT 0,
  depreciation_building_years NUMERIC NOT NULL DEFAULT 25,
  depreciation_furniture_value NUMERIC NOT NULL DEFAULT 0,
  depreciation_furniture_years NUMERIC NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  entry_date TEXT NOT NULL DEFAULT '',
  exit_date TEXT,
  monthly_rent_hc NUMERIC NOT NULL DEFAULT 0,
  monthly_charges NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL DEFAULT '',
  guest_email TEXT,
  guest_phone TEXT,
  check_in TEXT NOT NULL DEFAULT '',
  check_out TEXT NOT NULL DEFAULT '',
  nightly_rate NUMERIC NOT NULL DEFAULT 0,
  nights INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  platform_fees NUMERIC NOT NULL DEFAULT 0,
  cleaning_fees NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmee',
  platform TEXT NOT NULL DEFAULT 'airbnb',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  period_start TEXT NOT NULL DEFAULT '',
  period_end TEXT NOT NULL DEFAULT '',
  rent_hc NUMERIC NOT NULL DEFAULT 0,
  charges NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'impaye',
  amount_received NUMERIC NOT NULL DEFAULT 0,
  paid_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'autres',
  amount_ttc NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  invoice_ref TEXT NOT NULL DEFAULT '',
  tax_deductible BOOLEAN NOT NULL DEFAULT true,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  owner_name TEXT NOT NULL DEFAULT '',
  active_fiscal_year INTEGER NOT NULL DEFAULT 2025,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties
CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for tenants
CREATE POLICY "Users can view own tenants" ON public.tenants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON public.tenants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON public.tenants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON public.tenants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for reservations
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON public.reservations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reservations" ON public.reservations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for receipts
CREATE POLICY "Users can view own receipts" ON public.receipts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON public.receipts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON public.receipts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for expenses
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for settings
CREATE POLICY "Users can view own settings" ON public.settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
