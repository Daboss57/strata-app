// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://thgglfiizkshkhcnogij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ2dsZmlpemtzaGtoY25vZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTI1NzAsImV4cCI6MjA4MzIyODU3MH0.RvlARrkmRxQCxhMtTJSUBNQEr6I37Q94x-D_hOS_z9k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
