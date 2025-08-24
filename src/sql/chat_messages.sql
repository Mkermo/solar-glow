-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.forum_comments CASCADE;
DROP TABLE IF EXISTS public.forum_topics CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;

-- Create a table for forum categories
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for forum topics
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.forum_categories NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_sticky BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Create a table for forum comments
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic_id UUID REFERENCES public.forum_topics NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS policies for categories (everyone can view)
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.forum_categories
  FOR SELECT USING (true);

-- Set up RLS policies for topics
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.forum_topics
  FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for topic owners" ON public.forum_topics
  FOR UPDATE USING (auth.uid() = user_id);

-- Set up RLS policies for comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.forum_comments
  FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for comment owners" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for comment owners" ON public.forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample categories
INSERT INTO public.forum_categories (name, description)
VALUES 
  ('Solar Panel Installation', 'Discuss installation tips and best practices'),
  ('Maintenance', 'Maintenance tips and troubleshooting'),
  ('Energy Saving', 'Share your energy saving tips'),
  ('Product Reviews', 'Reviews and discussions about solar products');
create or replace function create_chat_tables()
returns void as $$
begin
  -- Example: create table if not exists
  if not exists (select from information_schema.tables where table_name = 'chat_messages') then
    create table public.chat_messages (
      id uuid primary key default gen_random_uuid(),
      user_id uuid,
      message text,
      created_at timestamp with time zone default now()
    );
  end if;
end;
$$ language plpgsql;