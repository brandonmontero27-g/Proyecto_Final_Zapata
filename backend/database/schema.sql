-- ============================================================
-- MotoMarket / Plataforma de venta de motocicletas — Esquema de base de datos
-- Motor: PostgreSQL (Supabase), autenticación: Supabase Auth (auth.users)
--
-- v3: dominio migrado de alquileres de habitaciones (UNSCH) a venta de
-- motocicletas. "profiles" sigue ligada 1:1 a auth.users; login/registro
-- los maneja Supabase Auth (backend/src/services/auth.service.js).
-- Ejecutar en: Supabase Dashboard > SQL Editor, o via `supabase db push`.
-- ============================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum ('buyer', 'seller', 'admin');
create type verification_status as enum ('none', 'pending', 'approved', 'rejected');
create type motorcycle_category as enum ('scooter', 'naked', 'deportiva', 'enduro', 'cub', 'electrica');
create type motorcycle_condition as enum ('new', 'used');
create type fuel_type as enum ('gasolina', 'electrica', 'hibrida');
create type transmission_type as enum ('manual', 'automatica');
create type listing_status as enum ('approved', 'pending', 'suspended', 'flagged');
create type chat_presence as enum ('online', 'offline');
create type message_sender as enum ('buyer', 'seller');
create type audit_log_type as enum ('system', 'user', 'motorcycle');
create type notification_type as enum (
  'motorcycle_approved',
  'motorcycle_flagged',
  'motorcycle_suspended',
  'motorcycle_pending_review'
);

-- ------------------------------------------------------------
-- Trigger genérico para mantener updated_at
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- TABLA: profiles
-- Datos de aplicación de cada usuario. id = auth.users.id (1:1).
-- El email/password ya viven en auth.users, gestionados por Supabase Auth.
-- ------------------------------------------------------------
create table profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  name                  text not null,
  role                  user_role not null default 'buyer',
  phone                 text,
  is_verified           boolean not null default false,
  verification_status   verification_status not null default 'none',
  verification_doc_url  text,
  blocked_until         timestamptz,
  blocked_reason        text,
  avatar_url            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_profiles_role on profiles (role);
create index idx_profiles_verification_status on profiles (verification_status);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Crea el profile automaticamente cuando Supabase Auth crea un auth.users
-- (se dispara con supabase.auth.admin.createUser({ user_metadata: {...} })).
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'buyer'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ------------------------------------------------------------
-- TABLA: motorcycles
-- Publicaciones de venta de motos creadas por vendedores.
-- ------------------------------------------------------------
create table motorcycles (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references profiles (id) on delete cascade,
  title            text not null,
  brand            text not null,
  model            text not null,
  year             integer not null check (year >= 1980),
  category         motorcycle_category not null default 'naked',
  displacement_cc  integer not null check (displacement_cc >= 0),
  price            numeric(10, 2) not null check (price >= 0),
  mileage_km       integer not null default 0 check (mileage_km >= 0),
  fuel_type        fuel_type not null default 'gasolina',
  transmission     transmission_type not null default 'manual',
  color            text,
  description      text,
  contact_phone    text not null,
  whatsapp_phone   text,
  images           text[] not null default '{}',
  location         text not null,
  address          text,
  coordinate_x     numeric(9, 6),
  coordinate_y     numeric(9, 6),
  stock            integer not null default 1 check (stock >= 0),
  condition        motorcycle_condition not null default 'used',
  verified_by_tico boolean not null default false,
  status           listing_status not null default 'pending',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_motorcycles_status on motorcycles (status);
create index idx_motorcycles_brand on motorcycles (brand);
create index idx_motorcycles_category on motorcycles (category);
create index idx_motorcycles_condition on motorcycles (condition);
create index idx_motorcycles_price on motorcycles (price);
create index idx_motorcycles_seller on motorcycles (seller_id);
-- Búsqueda combinada típica del catálogo: marca + año + precio maximo + estado.
create index idx_motorcycles_search on motorcycles (status, brand, category, price);

create trigger trg_motorcycles_updated_at
  before update on motorcycles
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- TABLA: favorites
-- Motos guardadas por un comprador (❤️).
-- ------------------------------------------------------------
create table favorites (
  user_id        uuid not null references profiles (id) on delete cascade,
  motorcycle_id  uuid not null references motorcycles (id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (user_id, motorcycle_id)
);

create index idx_favorites_motorcycle on favorites (motorcycle_id);

-- ------------------------------------------------------------
-- TABLA: chats
-- Conversación directa entre un comprador y un vendedor,
-- generalmente asociada a una publicación de moto.
-- ------------------------------------------------------------
create table chats (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references profiles (id) on delete cascade,
  seller_id      uuid not null references profiles (id) on delete cascade,
  motorcycle_id  uuid references motorcycles (id) on delete set null,
  last_message   text,
  unread         boolean not null default true,
  status         chat_presence not null default 'offline',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (buyer_id, seller_id, motorcycle_id)
);

create index idx_chats_buyer on chats (buyer_id);
create index idx_chats_seller on chats (seller_id);

create trigger trg_chats_updated_at
  before update on chats
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- TABLA: chat_messages
-- Mensajes individuales dentro de un chat.
-- ------------------------------------------------------------
create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references chats (id) on delete cascade,
  sender      message_sender not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index idx_messages_chat_created on chat_messages (chat_id, created_at);

-- ------------------------------------------------------------
-- TABLA: verification_documents
-- Historial de documentos subidos para verificación de identidad del
-- vendedor (endpoint admin: GET /documentos/pendientes, PUT /documentos/:id).
-- ------------------------------------------------------------
create table verification_documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  doc_url       text not null,
  status        verification_status not null default 'pending',
  comment       text,
  reviewed_by   uuid references profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);

create index idx_verifdocs_status on verification_documents (status);
create index idx_verifdocs_user on verification_documents (user_id);

-- ------------------------------------------------------------
-- TABLA: audit_logs
-- Bitácora de acciones del sistema (panel de administrador).
-- ------------------------------------------------------------
create table audit_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles (id) on delete set null,
  actor_name   text not null,
  action       text not null,
  details      text,
  type         audit_log_type not null default 'user',
  created_at   timestamptz not null default now()
);

create index idx_audit_created_desc on audit_logs (created_at desc);
create index idx_audit_type on audit_logs (type);

-- ------------------------------------------------------------
-- TABLA: notifications
-- Notificaciones dirigidas a un usuario (campanita en la navbar):
-- una fila por destinatario (fan-out real), asi el estado de
-- lectura es siempre por-usuario.
-- ------------------------------------------------------------
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references profiles (id) on delete cascade,
  actor_id      uuid references profiles (id) on delete set null,
  type          notification_type not null,
  title         text not null,
  body          text,
  motorcycle_id uuid references motorcycles (id) on delete cascade,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_recipient_created on notifications (recipient_id, created_at desc);
create index idx_notifications_recipient_unread on notifications (recipient_id) where read_at is null;

-- ============================================================
-- Row Level Security (RLS) — Supabase la exige para exponer
-- tablas vía su API REST/Realtime. El backend usa la secret key
-- (supabaseAdmin), que ignora RLS; estas policies cubren el caso
-- de que el frontend algún día consulte Supabase directamente con
-- la publishable key.
-- ============================================================
alter table profiles enable row level security;
alter table motorcycles enable row level security;
alter table favorites enable row level security;
alter table chats enable row level security;
alter table chat_messages enable row level security;
alter table verification_documents enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;

-- Lectura pública de motos aprobadas (catálogo sin login)
create policy "motorcycles_public_read" on motorcycles
  for select using (status = 'approved');

-- Un usuario puede leer y actualizar su propio profile
create policy "profiles_self_read" on profiles
  for select using (auth.uid() = id);

create policy "profiles_self_update" on profiles
  for update using (auth.uid() = id);

-- Un usuario puede leer y marcar como leidas sus propias notificaciones.
-- Sin policy de insert: solo el backend (supabaseAdmin) inserta.
create policy "notifications_self_read" on notifications
  for select using (auth.uid() = recipient_id);

create policy "notifications_self_update" on notifications
  for update using (auth.uid() = recipient_id);

-- El resto de accesos (escritura de motos, chats, admin) deben ir
-- por el backend con la secret key, o ampliarse con policies propias
-- de auth.uid() segun se necesite.
