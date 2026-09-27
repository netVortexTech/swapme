-- Catch a Morning — Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Availability slots table
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  period TEXT NOT NULL DEFAULT 'morning' CHECK (period IN ('morning', 'afternoon')),
  status TEXT NOT NULL DEFAULT 'available' 
    CHECK (status IN ('available', 'pending', 'approved', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, period)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_slot_id UUID NOT NULL REFERENCES availability_slots(id),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(availability_slot_id) WHERE status IN ('pending', 'approved')
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_availability_slots_date ON availability_slots(date);
CREATE INDEX idx_availability_slots_status ON availability_slots(status);
CREATE INDEX idx_bookings_slot_id ON bookings(availability_slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(employee_email);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Booking function with concurrency protection
CREATE OR REPLACE FUNCTION create_booking(
  p_slot_id UUID,
  p_employee_name TEXT,
  p_employee_email TEXT,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_slot_status TEXT;
BEGIN
  -- Lock the slot row and check status
  SELECT status INTO v_slot_status
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF v_slot_status IS NULL THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF v_slot_status != 'available' THEN
    RAISE EXCEPTION 'Slot not available';
  END IF;

  -- Update slot status
  UPDATE availability_slots
  SET status = 'pending', updated_at = NOW()
  WHERE id = p_slot_id;

  -- Insert booking
  INSERT INTO bookings (availability_slot_id, employee_name, employee_email, message, status)
  VALUES (p_slot_id, p_employee_name, p_employee_email, p_message, 'pending')
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security

-- Enable RLS on all tables
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Availability slots policies
CREATE POLICY "Anyone can read availability slots"
  ON availability_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert availability slots"
  ON availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can update availability slots"
  ON availability_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can delete availability slots"
  ON availability_slots FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Anyone can read bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Admins policies
CREATE POLICY "Only admins can read admins"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can insert admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
