// Import create client from supabase to create a client to communicate with my backend
import { createClient } from '@supabase/supabase-js'

// fetch environment variables and store them in a variable to pass to client (security of API keys)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_ORG
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY_ORG

//create the supabse client for Organisation
const supabaseOrg = createClient(supabaseUrl, supabaseKey, { auth: { storageKey: 's1' } })
const supabaseUser = createClient(supabaseUrl, supabaseKey, { auth: { storageKey: 's2' } })

//named export for the client
export { supabaseOrg, supabaseUser }
