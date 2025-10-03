-- Create car_images table to store multiple images per car
CREATE TABLE IF NOT EXISTS public.car_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better performance
CREATE INDEX idx_car_images_car_id ON public.car_images(car_id);
CREATE INDEX idx_car_images_is_primary ON public.car_images(is_primary);

-- Add comments
COMMENT ON TABLE public.car_images IS 'Stores multiple images for each car';
COMMENT ON COLUMN public.car_images.car_id IS 'Foreign key to the cars table';
COMMENT ON COLUMN public.car_images.image_url IS 'URL/path to the car image in storage';
COMMENT ON COLUMN public.car_images.is_primary IS 'Indicates if this is the primary/main image for the car';

-- Enable Row Level Security
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for car_images

-- Car owners can insert images for their own cars
CREATE POLICY "Car owners can insert images for their cars"
ON public.car_images FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cars
        WHERE cars.id = car_images.car_id
        AND cars.owner_id = auth.uid()
    )
);

-- Car owners can view images for their own cars
CREATE POLICY "Car owners can view their car images"
ON public.car_images FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.cars
        WHERE cars.id = car_images.car_id
        AND cars.owner_id = auth.uid()
    )
);

-- Drivers can view images for cars assigned to them
CREATE POLICY "Drivers can view assigned car images"
ON public.car_images FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.car_assignments ca
        JOIN public.cars c ON c.id = ca.car_id
        WHERE c.id = car_images.car_id
        AND ca.driver_id = auth.uid()
        AND ca.unassigned_at IS NULL
    )
);

-- Admins can view all car images
CREATE POLICY "Admins can view all car images"
ON public.car_images FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Car owners can update images for their own cars
CREATE POLICY "Car owners can update their car images"
ON public.car_images FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.cars
        WHERE cars.id = car_images.car_id
        AND cars.owner_id = auth.uid()
    )
);

-- Car owners can delete images for their own cars
CREATE POLICY "Car owners can delete their car images"
ON public.car_images FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.cars
        WHERE cars.id = car_images.car_id
        AND cars.owner_id = auth.uid()
    )
);

-- Migrate existing car image_url data to car_images table
INSERT INTO public.car_images (car_id, image_url, is_primary)
SELECT id, image_url, TRUE
FROM public.cars
WHERE image_url IS NOT NULL AND image_url != '';

-- Remove the image_url column from cars table
ALTER TABLE public.cars DROP COLUMN IF EXISTS image_url;

