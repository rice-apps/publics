import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

<<<<<<< HEAD
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
=======
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
>>>>>>> d3ddfc8 (complete quickstart)
