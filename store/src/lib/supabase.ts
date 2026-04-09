import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vybnneqxipninllzsfed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Ym5uZXF4aXBuaW5sbHpzZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDkxMzMsImV4cCI6MjA5MTMyNTEzM30.yzltlSWVJOuhjDSQFW44TfH4pKqcyi0ZbW94aHu8oTE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
