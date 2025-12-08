-- ============================================
-- CRÉATION DES BUCKETS DE STOCKAGE SUPABASE
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Créer le bucket "profiles" pour les avatars et bannières utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Créer le bucket "tournaments" pour les images de tournois
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournaments',
  'tournaments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Créer le bucket "coaching" pour les images de coaching
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coaching',
  'coaching',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================
-- POLITIQUES RLS POUR LES BUCKETS
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to tournaments" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for tournaments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to coaching" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for coaching" ON storage.objects;

-- Policy: Tout le monde peut LIRE les images (buckets publics)
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

CREATE POLICY "Public read access for tournaments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tournaments');

CREATE POLICY "Public read access for coaching"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'coaching');

-- Policy: Les utilisateurs authentifiés peuvent UPLOADER
CREATE POLICY "Authenticated users can upload to profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload to tournaments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tournaments');

CREATE POLICY "Authenticated users can upload to coaching"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'coaching');

-- Policy: Les utilisateurs authentifiés peuvent METTRE À JOUR leurs images
CREATE POLICY "Authenticated users can update profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can update tournaments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tournaments');

CREATE POLICY "Authenticated users can update coaching"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'coaching');

-- Policy: Les utilisateurs authentifiés peuvent SUPPRIMER leurs images
CREATE POLICY "Authenticated users can delete from profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can delete from tournaments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tournaments');

CREATE POLICY "Authenticated users can delete from coaching"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'coaching');

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT id, name, public, file_size_limit FROM storage.buckets;

