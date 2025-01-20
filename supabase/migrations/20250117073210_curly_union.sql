/*
  # Create storage bucket for product images

  1. New Storage Bucket
    - Creates a new public bucket for product images
    - Sets up appropriate security policies
  
  2. Security
    - Enable authenticated users to upload images
    - Allow public access for viewing images
    - Enforce 5MB file size limit through application logic
*/

-- Create the storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'product-images' AND owner = auth.uid());

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

-- Allow public access to view product images
CREATE POLICY "Allow public access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');