-- Ensure profiles table has all required columns and constraints

-- Add role column if not exists (with default value)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;
    RAISE NOTICE 'Added role column to profiles table';
  ELSE
    RAISE NOTICE 'Role column already exists in profiles table';
  END IF;
END $$;

-- Update existing profiles without role to have 'user' role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Drop old constraint if exists
DO $$ 
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add constraint to ensure role is valid
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'moderator', 'admin', 'ceo'));

-- Create index for role queries if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Verify the column exists and show structure
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'SUCCESS: profiles.role column exists and is ready';
  ELSE
    RAISE EXCEPTION 'FAILED: profiles.role column does not exist';
  END IF;
END $$;
