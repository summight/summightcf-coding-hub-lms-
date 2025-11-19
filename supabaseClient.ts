// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://lrnjknjdqtbmbzublvys.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybmprbmpkcXRibWJ6dWJsdnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjQ0MTEsImV4cCI6MjA3Nzg0MDQxMX0.SGB8kC_D6sUHKb_g_mfCTbs6CKL0QGKCRkhTc4fkyKg';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // Optionally disable Supabase Auth's automatic management if you rely entirely on your custom 'User' table logic
    // auth: { persistSession: false }, 
});

// NOTE: You must ensure '@supabase/supabase-js' is installed in your project.