//Deno.env.get(MY_SECRET_NAME)
//supabase secrets set --env-file ./supabase/.env
// echo "MY_NAME=Yoda" >> ./supabase/.env.local - create the env file and sets the variable
// const { data, error } = await supabase.functions.invoke('hello-world', {
//   body: { name: 'Functions' },
// })
import { corsHeaders } from '../_shared/cors.ts'

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const DAILY_API_ENDPOINT = 'https://api.daily.co/v1/rooms'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { scheduledTime } = await req.json() // Extract the scheduled start time from the request body

    const roomResponse = await fetch(DAILY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          nbf: scheduledTime, // Unix timestamp for "Not Before" time
          max_participants: 2 // Limit to 2 people
          // Add any additional properties you need
        }
      })
    })

    if (!roomResponse.ok) {
      throw new Error(`HTTP Error: ${roomResponse.status}`)
    }

    const roomData = await roomResponse.json()
    return new Response(JSON.stringify(roomData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
