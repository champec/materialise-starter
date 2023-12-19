import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('ANON_KEY') ?? '')

async function fetchMessagesFromActiveMQ() {
  const activeMQUrl = 'http://localhost:8161/api/message/encounter-report?type=queue' // Update with actual queue name
  const authHeaders = new Headers({
    Authorization: `Basic ${btoa('admin:admin')}` // Replace with actual credentials
  })

  const response = await fetch(activeMQUrl, { method: 'GET', headers: authHeaders })
  if (!response.ok) {
    throw new Error(`Error fetching messages: ${response.statusText}`)
  }
  const message = await response.text()
  return message ? [{ message_content: message }] : []
}

async function storeMessagesInSupabase(messages) {
  const { data, error } = await supabase.from('nhs111Messages').insert(messages)

  if (error) {
    console.error('Error logging to database:', error)
  } else {
    console.log('Data stored in Supabase:', data)
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const messages = await fetchMessagesFromActiveMQ()
    await storeMessagesInSupabase(messages)
    return new Response(JSON.stringify(messages), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
