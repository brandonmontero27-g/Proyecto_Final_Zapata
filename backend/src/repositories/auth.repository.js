import { supabaseAdmin, supabasePublic } from '../config/supabase.js';

export function createAuthUser({ email, password, name, role, phone }) {
  return supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, phone }
  });
}

export function signInWithPassword({ email, password }) {
  return supabasePublic.auth.signInWithPassword({ email, password });
}

export function findProfileById(id) {
  return supabaseAdmin.from('profiles').select('*').eq('id', id).single();
}

export function updateAuthPassword(userId, password) {
  return supabaseAdmin.auth.admin.updateUserById(userId, { password });
}
