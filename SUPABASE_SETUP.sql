-- =============================================
-- ITRA PERFUME SHOP - SUPABASE SETUP
-- Supabase SQL Editor mein ye paste karo
-- =============================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Products Table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text default 'men',
  image_url text,
  stock integer default 0,
  featured boolean default false,
  created_at timestamptz default now()
);

-- 3. Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  user_email text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) default 0,
  items jsonb default '[]',
  shipping_address text,
  created_at timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security) Policies
-- =============================================

-- Profiles: Users can only see/edit their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Products: Anyone can view, only admins can modify
alter table public.products enable row level security;
create policy "Anyone can view products" on products for select using (true);
create policy "Admins can manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders: Users see own, admins see all
alter table public.orders enable row level security;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- =============================================
-- Storage: product-images bucket
-- =============================================
-- Supabase Dashboard > Storage > New Bucket
-- Name: product-images
-- Public: YES (check the box)

-- Storage policies (run in SQL Editor)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public can view images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins can upload images" on storage.objects for insert with check (
  bucket_id = 'product-images' and
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete images" on storage.objects for delete using (
  bucket_id = 'product-images' and
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- =============================================
-- Make yourself admin (apni email se replace karo)
-- =============================================
-- update public.profiles set role = 'admin' where email = 'your@email.com';

-- =============================================
-- Sample Products (optional)
-- =============================================
insert into public.products (name, description, price, category, stock, featured) values
('Rose Noir', 'A dark, velvety rose with hints of oud and amber. Mysterious and captivating.', 4500, 'women', 20, true),
('Oud Al Karim', 'Pure aged oud from the forests of Assam. Rich, woody, timeless.', 8500, 'oud', 15, true),
('Aqua Lumière', 'Fresh citrus and ocean breeze. Light, invigorating, effortlessly modern.', 3200, 'men', 30, true),
('Saffron Dreams', 'Warm saffron entwined with sandalwood and musk. Deeply sensuous.', 5500, 'unisex', 12, false),
('Jasmine Royale', 'Queen of flowers captured in a bottle. Heady, floral, unforgettable.', 3800, 'women', 25, false),
('Black Cedar', 'Sharp cedar and vetiver with a smoky finish. Bold and confident.', 4200, 'men', 18, true);
