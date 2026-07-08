-- ============================================================
-- Migra el dominio de "alquileres de habitaciones (UNSCH)" a
-- "venta de motocicletas". No hay datos reales que preservar en el
-- proyecto (recien conectado), asi que se elimina el esquema anterior
-- por completo y se vuelve a crear con backend/database/schema.sql,
-- que ya contiene la definicion final (motorcycles, enums, RLS, etc.).
--
-- Uso: pegar este archivo en Supabase Dashboard > SQL Editor y
-- ejecutarlo, y a continuacion pegar y ejecutar backend/database/schema.sql.
-- ============================================================

drop table if exists notifications cascade;
drop table if exists audit_logs cascade;
drop table if exists verification_documents cascade;
drop table if exists chat_messages cascade;
drop table if exists chats cascade;
drop table if exists favorites cascade;
drop table if exists housing_listings cascade;
drop table if exists profiles cascade;

drop function if exists handle_new_auth_user() cascade;
drop function if exists set_updated_at() cascade;
drop function if exists truncate_all_tables() cascade;

drop type if exists notification_type;
drop type if exists audit_log_type;
drop type if exists message_sender;
drop type if exists chat_presence;
drop type if exists housing_status;
drop type if exists housing_type;
drop type if exists verification_status;
drop type if exists user_role;
