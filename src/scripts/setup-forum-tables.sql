-- Forum tables setup for Solar Glow
-- Run this in the SQL Editor in Supabase dashboard

-- Create forum_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories if needed (won't duplicate if they exist)
INSERT INTO public.forum_categories (name, name_ar, description, description_ar)
VALUES 
  ('General Discussion', 'النقاش العام', 'General topics related to solar energy', 'مواضيع عامة تتعلق بالطاقة الشمسية'),
  ('Solar Panels', 'الألواح الشمسية', 'Discussion about solar panels', 'نقاش حول الألواح الشمسية'),
  ('Inverters', 'المحولات', 'All about solar inverters', 'كل ما يتعلق بمحولات الطاقة الشمسية'),
  ('Batteries', 'البطاريات', 'Battery storage systems', 'أنظمة تخزين البطاريات'),
  ('Installation', 'التركيب', 'Tips and advice for installation', 'نصائح وإرشادات للتركيب'),
  ('Troubleshooting', 'استكشاف الأخطاء وإصلاحها', 'Help with system issues', 'المساعدة في مشاكل النظام')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for proper security (if needed)
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_categories
CREATE POLICY "Allow public read access to forum_categories" 
ON public.forum_categories FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage forum_categories" 
ON public.forum_categories FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create policies for forum_topics
CREATE POLICY "Allow public read access to approved forum_topics" 
ON public.forum_topics FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Allow authenticated users to create forum_topics" 
ON public.forum_topics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_topics" 
ON public.forum_topics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all forum_topics" 
ON public.forum_topics FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create policies for forum_replies
CREATE POLICY "Allow public read access to forum_replies" 
ON public.forum_replies FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum_replies" 
ON public.forum_replies FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own forum_replies" 
ON public.forum_replies FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all forum_replies" 
ON public.forum_replies FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.admin_users));
