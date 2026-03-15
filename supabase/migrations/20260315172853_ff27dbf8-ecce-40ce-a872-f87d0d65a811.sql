
-- Create shares table for persistent storage
CREATE TABLE public.shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('text', 'file')),
  content TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  file_path TEXT,
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  one_time_download BOOLEAN NOT NULL DEFAULT false,
  downloaded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Anyone can create shares (no auth required)
CREATE POLICY "Anyone can create shares"
  ON public.shares FOR INSERT
  WITH CHECK (true);

-- Anyone can read shares (access controlled by code + password in app)
CREATE POLICY "Anyone can read shares by code"
  ON public.shares FOR SELECT
  USING (true);

-- Anyone can update download status
CREATE POLICY "Anyone can mark shares as downloaded"
  ON public.shares FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete expired shares
CREATE POLICY "Anyone can delete shares"
  ON public.shares FOR DELETE
  USING (true);

-- Index for code lookups
CREATE INDEX idx_shares_code ON public.shares (code);

-- Index for expiration cleanup
CREATE INDEX idx_shares_expires_at ON public.shares (expires_at);

-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public)
VALUES ('shares', 'shares', true);

-- Storage policies - anyone can upload to shares bucket
CREATE POLICY "Anyone can upload shared files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shares');

-- Anyone can read shared files
CREATE POLICY "Anyone can read shared files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shares');

-- Anyone can delete shared files (for cleanup)
CREATE POLICY "Anyone can delete shared files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shares');
