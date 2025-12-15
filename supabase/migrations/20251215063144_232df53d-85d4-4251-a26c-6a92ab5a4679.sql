-- Create seller_statuses table for 24-hour stories
CREATE TABLE public.seller_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.seller_statuses ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their own statuses
CREATE POLICY "Store owners can manage their statuses"
ON public.seller_statuses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = seller_statuses.store_id
    AND s.owner_user_id = auth.uid()
  )
);

-- Public can view active (non-expired) statuses
CREATE POLICY "Public can view active statuses"
ON public.seller_statuses
FOR SELECT
USING (expires_at > now());

-- Admins can manage all statuses
CREATE POLICY "Admins can manage all statuses"
ON public.seller_statuses
FOR ALL
USING (is_admin(auth.uid()));

-- Create index for efficient querying of active statuses
CREATE INDEX idx_seller_statuses_store_expires ON public.seller_statuses(store_id, expires_at DESC);
CREATE INDEX idx_seller_statuses_expires ON public.seller_statuses(expires_at);