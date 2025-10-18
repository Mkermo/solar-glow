-- Complete Database Setup for Solar-Glow
-- This script creates all necessary tables for the application
-- Run this in the Supabase SQL Editor

-- 1. PRODUCTS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sold_quantity INTEGER NOT NULL DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on products" 
ON public.products FOR INSERT 
WITH CHECK (true);

-- 2. PRODUCT SALES TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.product_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product_sales" 
ON public.product_sales FOR SELECT 
USING (true);

-- 3. FORUM CATEGORIES TABLE
-- ==========================
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forum_categories" 
ON public.forum_categories FOR SELECT 
USING (true);

-- 4. FORUM TOPICS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    is_sticky BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forum_topics" 
ON public.forum_topics FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Allow authenticated users to create forum_topics" 
ON public.forum_topics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own forum_topics" 
ON public.forum_topics FOR UPDATE 
USING (true);

-- 5. FORUM COMMENTS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to forum_comments" 
ON public.forum_comments FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to create forum_comments" 
ON public.forum_comments FOR INSERT 
WITH CHECK (true);

-- 6. CHAT MESSAGES TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chat_messages" 
ON public.chat_messages FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to create chat_messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (true);

-- 7. STORAGE BUCKETS (if needed)
-- ==============================
-- These are typically created via the Supabase UI, not SQL
-- But you can check in the Storage tab

-- INSERT SAMPLE DATA
-- ==================

-- Insert forum categories if empty
INSERT INTO public.forum_categories (name, name_ar, description, description_ar)
SELECT * FROM (
  VALUES 
    ('General Discussion', 'النقاش العام', 'General topics related to solar energy', 'مواضيع عامة تتعلق بالطاقة الشمسية'::text),
    ('Solar Panels', 'الألواح الشمسية', 'Discussion about solar panels', 'نقاش حول الألواح الشمسية'),
    ('Inverters', 'المحولات', 'All about solar inverters', 'كل ما يتعلق بمحولات الطاقة الشمسية'),
    ('Batteries', 'البطاريات', 'Battery storage systems', 'أنظمة تخزين البطاريات'),
    ('Installation', 'التركيب', 'Tips and advice for installation', 'نصائح وإرشادات للتركيب'),
    ('Troubleshooting', 'استكشاف الأخطاء وإصلاحها', 'Help with system issues', 'المساعدة في مشاكل النظام')
) t(name, name_ar, description, description_ar)
WHERE NOT EXISTS (SELECT 1 FROM public.forum_categories LIMIT 1);

-- Insert sample products if empty
INSERT INTO public.products (name, description, price, category, image_url, stock_quantity, is_hidden)
SELECT * FROM (
  VALUES
    ('Monocrystalline Solar Panel 400W', 'High-efficiency mono panel with 20.4% conversion rate', 299.99::decimal, 'solar_panels', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 50, false),
    ('Polycrystalline Solar Panel 350W', 'Cost-effective poly panel for residential use', 249.99::decimal, 'solar_panels', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 75, false),
    ('String Inverter 5kW', 'Reliable string inverter for residential systems', 899.99::decimal, 'inverters', 'https://images.unsplash.com/photo-1605980413173-11c3d6a47a8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 25, false),
    ('Hybrid Inverter 7.6kW', 'Smart inverter with battery compatibility', 1499.99::decimal, 'inverters', 'https://images.unsplash.com/photo-1605980413173-11c3d6a47a8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 20, false),
    ('Lithium Battery 10kWh', 'High-capacity lithium storage solution', 4999.99::decimal, 'batteries', 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 15, false),
    ('Smart Battery 15kWh', 'Advanced battery with monitoring system', 6999.99::decimal, 'batteries', 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 10, false),
    ('Roof Mount Kit', 'Complete roof mounting solution for 6 panels', 299.99::decimal, 'mounting', 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 40, false),
    ('Solar Cable 10m', 'UV-resistant PV cable pair', 49.99::decimal, 'accessories', 'https://via.placeholder.com/300', 200, false),
    ('MC4 Connectors Pack', 'Pack of 5 pairs of MC4 connectors', 29.99::decimal, 'accessories', 'https://via.placeholder.com/300', 150, false)
) t(name, description, price, category, image_url, stock_quantity, is_hidden)
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
    BEFORE UPDATE ON public.forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
    BEFORE UPDATE ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SUCCESS: All tables created and configured
COMMIT;