import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:          AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------------------------
// Database types
// ---------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      todos: {
        Row:    { id: string; user_id: string; text: string; completed: boolean; created_at: string };
        Insert: { id?: string; user_id: string; text: string; completed?: boolean; created_at?: string };
        Update: { text?: string; completed?: boolean };
      };
      profiles: {
        Row:    { id: string; full_name: string | null; plan: 'free' | 'pro'; updated_at: string };
        Insert: { id: string; full_name?: string | null; plan?: 'free' | 'pro' };
        Update: { full_name?: string | null; plan?: 'free' | 'pro' };
      };
    };
  };
};
