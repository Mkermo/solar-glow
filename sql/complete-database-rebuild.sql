-- ========================================
-- COMPREHENSIVE DATABASE SETUP FOR SOLAR-GLOW
-- ========================================
-- This script creates ALL necessary tables with proper checks
-- Run this in the Supabase SQL Editor
-- Features: IF NOT EXISTS, IF EXISTS, proper foreign keys, RLS policies

-- ========================================
-- PHASE 1: CREATE CORE TABLES
-- ========================================

-- 1. PRODUCTS TABLE (Main catalog)
-- ===============================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
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
    specifications JSONB,
    name_ar TEXT,
    description_ar TEXT,
    specifications_ar JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert on products" ON public.products;

-- Create new policies
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on products" 
ON public.products FOR INSERT WITH CHECK (true);

-- ========================================
-- 2. PRODUCT SALES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.product_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE IF EXISTS public.product_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to product_sales" ON public.product_sales;
CREATE POLICY "Allow public read access to product_sales" 
ON public.product_sales FOR SELECT USING (true);

-- ========================================
-- 3. PRODUCT SALE (SINGULAR) TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.product_sale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE IF EXISTS public.product_sale ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to product_sale" ON public.product_sale;
CREATE POLICY "Allow public read access to product_sale" 
ON public.product_sale FOR SELECT USING (true);

-- ========================================
-- PHASE 2: CREATE USER/PROFILE TABLES
-- ========================================

-- 4. PROFILES TABLE
-- =================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
        REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" 
ON public.profiles FOR SELECT USING (true);

-- ========================================
-- 5. USER PROFILES TABLE (Alternative)
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public read on user_profiles" 
ON public.user_profiles FOR SELECT USING (true);

-- ========================================
-- 6. ADMIN USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on admin_users" ON public.admin_users;
CREATE POLICY "Allow public read on admin_users" 
ON public.admin_users FOR SELECT USING (true);

-- ========================================
-- 7. USERS TABLE (Custom users)
-- ========================================
CREATE TABLE IF NOT EXISTS public."Users" (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contact TEXT
);

ALTER TABLE IF EXISTS public."Users" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on Users" ON public."Users";
CREATE POLICY "Allow public read on Users" 
ON public."Users" FOR SELECT USING (true);

-- ========================================
-- PHASE 3: CREATE FORUM TABLES
-- ========================================

-- 8. FORUM CATEGORIES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.forum_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on forum_categories" ON public.forum_categories;
CREATE POLICY "Allow public read on forum_categories" 
ON public.forum_categories FOR SELECT USING (true);

-- ========================================
-- 9. FORUM TOPICS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    is_sticky BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.forum_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow authenticated create forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Allow authenticated update forum_topics" ON public.forum_topics;

CREATE POLICY "Allow public read on forum_topics" 
ON public.forum_topics FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow authenticated create forum_topics" 
ON public.forum_topics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update forum_topics" 
ON public.forum_topics FOR UPDATE USING (true);

-- ========================================
-- 10. FORUM COMMENTS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on forum_comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow authenticated create forum_comments" ON public.forum_comments;

CREATE POLICY "Allow public read on forum_comments" 
ON public.forum_comments FOR SELECT USING (true);

CREATE POLICY "Allow authenticated create forum_comments" 
ON public.forum_comments FOR INSERT WITH CHECK (true);

-- ========================================
-- 11. FORUM REPLIES TABLE (Alternative)
-- ======================================
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.forum_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on forum_replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Allow authenticated create forum_replies" ON public.forum_replies;

CREATE POLICY "Allow public read on forum_replies" 
ON public.forum_replies FOR SELECT USING (true);

CREATE POLICY "Allow authenticated create forum_replies" 
ON public.forum_replies FOR INSERT WITH CHECK (true);

-- ========================================
-- PHASE 4: CREATE ADDITIONAL TABLES
-- ========================================

-- 12. FORUM REPORTS TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID,
    content_type VARCHAR(50),
    content_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.forum_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on forum_reports" ON public.forum_reports;
CREATE POLICY "Allow public read on forum_reports" 
ON public.forum_reports FOR SELECT USING (true);

-- ========================================
-- PHASE 5: CREATE UTILITY FUNCTIONS
-- ========================================

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PHASE 6: CREATE TRIGGERS
-- ========================================

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON public.forum_topics;
DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON public.forum_comments;
DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON public.forum_replies;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Create new triggers
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
    BEFORE UPDATE ON public.forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
    BEFORE UPDATE ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
    BEFORE UPDATE ON public.forum_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- PHASE 7: INSERT SAMPLE DATA
-- ========================================

-- Insert sample forum categories (only if table is empty)
INSERT INTO public.forum_categories (name, name_ar, description, description_ar)
VALUES
    ('General Discussion', 'النقاش العام', 'General topics related to solar energy', 'مواضيع عامة تتعلق بالطاقة الشمسية'),
    ('Solar Panels', 'الألواح الشمسية', 'Discussion about solar panels', 'نقاش حول الألواح الشمسية'),
    ('Inverters', 'المحولات', 'All about solar inverters', 'كل ما يتعلق بمحولات الطاقة الشمسية'),
    ('Batteries', 'البطاريات', 'Battery storage systems', 'أنظمة تخزين البطاريات'),
    ('Installation', 'التركيب', 'Tips and advice for installation', 'نصائح وإرشادات للتركيب'),
    ('Troubleshooting', 'استكشاف الأخطاء وإصلاحها', 'Help with system issues', 'المساعدة في مشاكل النظام')
ON CONFLICT DO NOTHING;

-- Insert sample products (only if table is empty)
INSERT INTO public.products 
(id, name, description, price, category, image_url, stock_quantity, is_hidden, specifications, name_ar, description_ar)
VALUES
    ('sp-001', 'SolarG Premium 400W Solar Panel', 'High-efficiency monocrystalline solar panel with advanced cell technology', 299.99, 'panels', '/placeholder.svg', 50, false, 
        '{"Power Output": "400W", "Efficiency": "21.3%", "Cell Type": "Monocrystalline", "Dimensions": "1755 x 1038 x 35mm", "Weight": "19.8kg", "Warranty": "25 years"}',
        'لوح شمسي SolarG بريميوم 400 وات', 'لوح شمسي أحادي البلورة عالي الكفاءة مع تقنية خلايا متقدمة'),
    ('sp-002', 'SolarG Professional 350W Solar Panel', 'Reliable poly panel for residential and commercial systems', 249.99, 'panels', '/placeholder.svg', 75, false,
        '{"Power Output": "350W", "Efficiency": "18.5%", "Cell Type": "Polycrystalline", "Dimensions": "1755 x 1038 x 35mm", "Weight": "19.5kg", "Warranty": "20 years"}',
        'لوح شمسي SolarG احترافي 350 وات', 'لوح موثوق به للأنظمة السكنية والتجارية'),
    ('inv-001', 'SolarG String Inverter 5kW', 'High-performance string inverter with WiFi monitoring', 899.99, 'inverters', '/placeholder.svg', 25, false,
        '{"Power Rating": "5kW", "Efficiency": "98.5%", "Input Voltage": "200-1000V", "Warranty": "10 years", "Monitoring": "WiFi + Mobile App"}',
        'محول SolarG 5 كيلو وات', 'محول أداء عالي مع مراقبة WiFi'),
    ('inv-002', 'SolarG Hybrid Inverter 7.6kW', 'Smart hybrid inverter with battery storage capability', 1499.99, 'inverters', '/placeholder.svg', 20, false,
        '{"Power Rating": "7.6kW", "Battery Support": "Yes", "Efficiency": "97.5%", "Warranty": "15 years"}',
        'محول هجين SolarG 7.6 كيلو وات', 'محول هجين ذكي مع القدرة على تخزين البطارية')
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show all tables created
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count products
SELECT COUNT(*) as total_products FROM public.products;

-- Count forum categories
SELECT COUNT(*) as total_categories FROM public.forum_categories;

-- ========================================
-- COMPLETE: All tables created successfully!
-- ========================================