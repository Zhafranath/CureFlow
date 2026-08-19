-- =====================================================================
-- CUREFLOW POSTGRESQL SCHEMA (SUPABASE)
-- =====================================================================
-- 1. Profiles Table (Standalone custom username auth)
create table if not exists public.profiles (
  id uuid primary key,
  name text not null unique,
  role text not null check (role in ('doctor', 'pharmacist', 'technician')),
  password text not null default 'password123',
  email text,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
create policy "Allow all actions on profiles" on public.profiles for all using (true) with check (true);


-- 2. Sensor Readings Table (Unified IoT Sensor, Actuator & Schedule Table)
create table if not exists public.sensor_readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  turbidity integer not null default 12,
  food_level numeric not null default 68.0,
  water_level numeric not null default 74.0,
  temp integer not null default 28,
  mode text not null default 'auto' check (mode in ('auto', 'manual')),
  times text[] not null default array['07:00', '12:00', '18:00'],
  frequency integer not null default 1,
  paused_until timestamptz,
  last_fed timestamptz,
  pump_flow boolean not null default true,
  pump_drain boolean not null default false,
  pump_add boolean not null default false,
  grow_light boolean not null default true,
  grow_light_from text not null default '06:00',
  grow_light_to text not null default '18:00',
  servo boolean not null default false,
  change_water boolean not null default false,
  updated_at timestamptz default now()
);

-- Enable RLS for sensor_readings
alter table public.sensor_readings enable row level security;
create policy "Allow all actions on sensor_readings" on public.sensor_readings for all using (true) with check (true);-- Seed default profiles and sensor readings row for shared anonymous IoT session and demo accounts
insert into public.profiles (id, name, role, email, password) values
('00000000-0000-0000-0000-000000000000', 'CureFlow Member', 'technician', 'anonymous@cureflow.com', 'password123'),
('11111111-1111-1111-1111-111111111111', 'dr. Raka Pratama', 'doctor', 'doctor@cureflow.com', 'password123'),
('22222222-2222-2222-2222-222222222222', 'Apt. Sinta Dewi', 'pharmacist', 'pharmacist@cureflow.com', 'password123'),
('33333333-3333-3333-3333-333333333333', 'Teknisi Bagas', 'technician', 'technician@cureflow.com', 'password123')
on conflict (id) do nothing;

insert into public.sensor_readings (user_id, mode, times, pump_flow, pump_drain, pump_add, grow_light, grow_light_from, grow_light_to, servo, change_water, turbidity, food_level, water_level, updated_at) values
('00000000-0000-0000-0000-000000000000', 'auto', array['07:00', '12:00', '18:00'], true, false, false, true, '06:00', '18:00', false, false, 12, 68.0, 74.0, now()),
('11111111-1111-1111-1111-111111111111', 'auto', array['07:00', '12:00', '18:00'], true, false, false, true, '06:00', '18:00', false, false, 12, 68.0, 74.0, now()),
('22222222-2222-2222-2222-222222222222', 'auto', array['07:00', '12:00', '18:00'], true, false, false, true, '06:00', '18:00', false, false, 12, 68.0, 74.0, now()),
('33333333-3333-3333-3333-333333333333', 'auto', array['07:00', '12:00', '18:00'], true, false, false, true, '06:00', '18:00', false, false, 12, 68.0, 74.0, now())
on conflict (user_id) do nothing;
-- 3. Catalog Table (Bed Tanaman)
create table if not exists public.catalog (
  id text primary key,
  plant text not null,
  quantity integer not null default 1,
  planted_at bigint not null,
  grow_days integer not null default 30
);
alter table public.catalog enable row level security;
create policy "Allow all actions on catalog" on public.catalog for all using (true) with check (true);


-- 4. Fish Stock Table (Kolam Ikan)
create table if not exists public.fish_stock (
  id text primary key,
  type text not null,
  quantity integer not null default 0,
  added_at bigint not null
);
alter table public.fish_stock enable row level security;
create policy "Allow all actions on fish_stock" on public.fish_stock for all using (true) with check (true);


-- 5. Doctor Requests Table (Permintaan Dokter)
create table if not exists public.doctor_requests (
  id text primary key,
  doctor_name text not null,
  remedy_id text not null,
  plant text not null,
  complaint text not null,
  status text not null check (status in ('pending', 'approved', 'declined')),
  created_at bigint not null,
  decided_at bigint
);
alter table public.doctor_requests enable row level security;
create policy "Allow all actions on doctor_requests" on public.doctor_requests for all using (true) with check (true);
-- =====================================================================
-- DEMO TABLES (Pemisahan tabel agar data login demo tidak bentrok)
-- =====================================================================

-- 3b. Demo Catalog Table (Bed Tanaman Demo)
create table if not exists public.demo_catalog (
  id text primary key,
  plant text not null,
  quantity integer not null default 1,
  planted_at bigint not null,
  grow_days integer not null default 30
);
alter table public.demo_catalog enable row level security;
create policy "Allow all actions on demo_catalog" on public.demo_catalog for all using (true) with check (true);

-- 4b. Demo Fish Stock Table (Kolam Ikan Demo)
create table if not exists public.demo_fish_stock (
  id text primary key,
  type text not null,
  quantity integer not null default 0,
  added_at bigint not null
);
alter table public.demo_fish_stock enable row level security;
create policy "Allow all actions on demo_fish_stock" on public.demo_fish_stock for all using (true) with check (true);

-- 5b. Demo Doctor Requests Table (Permintaan Dokter Demo)
create table if not exists public.demo_doctor_requests (
  id text primary key,
  doctor_name text not null,
  remedy_id text not null,
  plant text not null,
  complaint text not null,
  status text not null check (status in ('pending', 'approved', 'declined')),
  created_at bigint not null,
  decided_at bigint
);
alter table public.demo_doctor_requests enable row level security;
create policy "Allow all actions on demo_doctor_requests" on public.demo_doctor_requests for all using (true) with check (true);


-- =====================================================================
-- SEED INITIAL SEED DATA FOR DEMO TABLES ONLY
-- =====================================================================

-- Catalog Demo Seed
insert into public.demo_catalog (id, plant, quantity, planted_at, grow_days) values
('c1', 'Brokoli', 12, (extract(epoch from now()) * 1000 - 92::bigint * 24 * 60 * 60 * 1000)::bigint, 80),
('c2', 'Bayam', 18, (extract(epoch from now()) * 1000 - 41::bigint * 24 * 60 * 60 * 1000)::bigint, 35),
('c3', 'Kale', 10, (extract(epoch from now()) * 1000 - 60::bigint * 24 * 60 * 60 * 1000)::bigint, 55),
('c4', 'Microgreens', 40, (extract(epoch from now()) * 1000 - 12::bigint * 24 * 60 * 60 * 1000)::bigint, 10),
('c5', 'Selada', 24, (extract(epoch from now()) * 1000 - 9::bigint * 24 * 60 * 60 * 1000)::bigint, 30),
('c6', 'Daun mint', 8, (extract(epoch from now()) * 1000 - 5::bigint * 24 * 60 * 60 * 1000)::bigint, 21),
('c7', 'Tomat ceri', 6, (extract(epoch from now()) * 1000 - 20::bigint * 24 * 60 * 60 * 1000)::bigint, 70)
on conflict (id) do nothing;

-- Fish Demo Seed
insert into public.demo_fish_stock (id, type, quantity, added_at) values
('fish1', 'nila', 45, (extract(epoch from now()) * 1000 - 30::bigint * 24 * 60 * 60 * 1000)::bigint),
('fish2', 'lele', 30, (extract(epoch from now()) * 1000 - 20::bigint * 24 * 60 * 60 * 1000)::bigint)
on conflict (id) do nothing;

-- Doctor Requests Demo Seed
insert into public.demo_doctor_requests (id, doctor_name, remedy_id, plant, complaint, status, created_at) values
('req1', 'dr. Anindya', 'r6', 'Daun mint', 'Tekanan darah tinggi', 'pending', (extract(epoch from now()) * 1000 - 3::bigint * 60 * 60 * 1000)::bigint)
on conflict (id) do nothing;

-- =====================================================================
-- 6. STORAGE BUCKET & POLICIES (Untuk Integrasi ESP32-CAM)
-- =====================================================================

-- Membuat bucket penyimpanan baru bernama 'plant-images' secara publik
insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do nothing;

-- Hapus policy lama jika ada untuk mencegah error duplikasi saat skema di-run ulang
drop policy if exists "Akses Publik Penuh untuk plant-images" on storage.objects;

-- Membuat kebijakan (policy) agar aplikasi Next.js bebas mengunggah, membaca, memperbarui, dan menghapus gambar
create policy "Akses Publik Penuh untuk plant-images"
on storage.objects for all
using ( bucket_id = 'plant-images' )
with check ( bucket_id = 'plant-images' );
