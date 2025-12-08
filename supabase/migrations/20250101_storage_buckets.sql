-- Create storage buckets for image uploads
-- These buckets will store user-uploaded images for profiles, tournaments, and coaching

-- Create profiles bucket (avatars and banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create tournaments bucket (banners and announcements)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournaments',
  'tournaments',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create coaching bucket (banners and course images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coaching',
  'coaching',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profiles bucket
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Profile images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- RLS Policies for tournaments bucket
CREATE POLICY "Tournament organizers can upload tournament images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tournaments'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('tournament_organizer', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Tournament organizers can update tournament images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tournaments'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('tournament_organizer', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Tournament organizers can delete tournament images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tournaments'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('tournament_organizer', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Tournament images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tournaments');

-- RLS Policies for coaching bucket
CREATE POLICY "Coaches can upload coaching images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coaching'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Coaches can update coaching images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'coaching'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Coaches can delete coaching images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'coaching'
  AND (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin', 'ceo')
    )
  )
);

CREATE POLICY "Coaching images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'coaching');

