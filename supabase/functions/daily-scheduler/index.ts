//Deno.env.get(MY_SECRET_NAME)
//supabase secrets set --env-file ./supabase/.env
// echo "MY_NAME=Yoda" >> ./supabase/.env.local - create the env file and sets the variable
// const { data, error } = await supabase.functions.invoke('hello-world', {
//   body: { name: 'Functions' },
// })
import { corsHeaders } from '../_shared/cors.ts'

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')
const DAILY_API_ENDPOINT = 'https://api.daily.co/v1/rooms'
const DAILY_API_MEETINGTOKEN = 'https://api.daily.co/v1/meeting-tokens'

// Function to generate token
const generateToken = async (roomName, isHcp) => {
  const properties = isHcp
    ? {
        room_name: roomName,
        is_owner: true,
        enable_screenshare: true
        // enable_recording: 'cloud'
        // additional properties for HCP
      }
    : {
        room_name: roomName,
        enable_screenshare: false,
        start_video_off: true,
        close_tab_on_exit: true,
        redirect_on_meeting_exit: 'www.google.com'
        // additional properties for patient
      }

  try {
    const tokenResponse = await fetch(DAILY_API_MEETINGTOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({ properties })
    })

    if (!tokenResponse.ok) {
      throw new Error(`HTTP Error: ${tokenResponse}`)
    }

    console.log('tokenResponse', tokenResponse)
    const tokenData = await tokenResponse.json()
    return tokenData.token
  } catch (error) {
    console.error('Failed to generate token:', error)
    throw error
  }
}

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
        ...corsHeaders,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          nbf: scheduledTime, // Unix timestamp for "Not Before" time
          max_participants: 2, // Limit to 2 people
          enable_prejoin_ui: true
          // Add any additional properties you need
        }
      })
    })

    if (!roomResponse.ok) {
      throw new Error(`HTTP Error: ${roomResponse.status}`)
    }

    const roomData = await roomResponse.json()
    const roomName = roomData.name

    // Generate tokens for HCP and patient
    const hcpToken = await generateToken(roomName, true)
    const patientToken = await generateToken(roomName, false)

    // Include tokens in the response
    const response = {
      room: roomData,
      hcpToken: hcpToken,
      patientToken: patientToken
    }

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
