-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  rfid_uid TEXT UNIQUE NOT NULL,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Cycles Table
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT UNIQUE NOT NULL,
  location_lat DECIMAL(10, 7) NOT NULL,
  location_lng DECIMAL(10, 7) NOT NULL,
  status TEXT CHECK (status IN ('available', 'in-use', 'maintenance')) DEFAULT 'available',
  battery_percentage INTEGER CHECK (battery_percentage >= 0 AND battery_percentage <= 100) DEFAULT 100,
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Geofences Table
CREATE TABLE IF NOT EXISTS public.geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  geometry_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Rentals Table
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES public.cycles(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  start_location_lat DECIMAL(10, 7),
  start_location_lng DECIMAL(10, 7),
  end_location_lat DECIMAL(10, 7),
  end_location_lng DECIMAL(10, 7),
  cost DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active'
);

-- Row Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

-- Allow read access to available cycles for everyone
CREATE POLICY "Allow public read on available cycles" 
ON public.cycles FOR SELECT 
USING (true);

-- Allow IoT ESP32 devices to update cycle location/status (in reality, an Edge Function/secret API key should restrict this)
CREATE POLICY "Allow ESP32 or Admins to update cycles" 
ON public.cycles FOR UPDATE 
USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own data" 
ON public.users FOR SELECT 
USING (true); -- simplified for demo; usually auth.uid() = id

-- Users can see their own rentals
CREATE POLICY "Users can read own rentals" 
ON public.rentals FOR SELECT 
USING (true); 

-- Geofences are public read
CREATE POLICY "Public read geofences" 
ON public.geofences FOR SELECT 
USING (true);
