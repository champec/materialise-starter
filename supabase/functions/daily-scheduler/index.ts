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

console.log('Edge function loaded')

// Function to generate token
const generateToken = async (roomName, isHcp, nbf) => {
  console.log('Generating token for:', isHcp ? 'HCP' : 'Patient', 'NBF:', nbf)
  const properties = {
    room_name: roomName,
    ...(nbf && { nbf }), // Only include nbf if it's provided
    ...(isHcp
      ? {
          is_owner: true,
          enable_screenshare: true
        }
      : {
          enable_screenshare: false,
          start_video_off: true,
          close_tab_on_exit: true,
          redirect_on_meeting_exit: 'pharmex.uk'
        })
  }

  try {
    console.log('Sending token request to Daily.co')
    const tokenResponse = await fetch(DAILY_API_MEETINGTOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({ properties })
    })

    if (!tokenResponse.ok) {
      console.error('Token generation failed:', tokenResponse.status, await tokenResponse.text())
      throw new Error(`HTTP Error: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token generated successfully')
    return tokenData.token
  } catch (error) {
    console.error('Failed to generate token:', error)
    throw error
  }
}

Deno.serve(async req => {
  console.log('Request received')

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled')
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('Parsing request body')
    const { scheduledTime } = await req.json()
    console.log('Scheduled time:', scheduledTime)

    console.log('Creating Daily.co room')
    const roomResponse = await fetch(DAILY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        privacy: 'private',
        properties: {
          max_participants: 2,
          enable_prejoin_ui: true,
          enable_knocking: true // This enables the waiting room feature
        }
      })
    })

    if (!roomResponse.ok) {
      console.error('Room creation failed:', roomResponse.status, await roomResponse.text())
      throw new Error(`HTTP Error: ${roomResponse.status}`)
    }

    const roomData = await roomResponse.json()
    console.log('Room created:', roomData.name)

    console.log('Generating tokens')
    const hostNbf = scheduledTime ? scheduledTime - 600 : null // 5 minutes before scheduled time
    const hcpToken = await generateToken(roomData.name, true, hostNbf)
    const patientToken = await generateToken(roomData.name, false, scheduledTime)

    const response = {
      room: roomData,
      hcpToken: hcpToken,
      patientToken: patientToken,
      scheduledTime: scheduledTime
    }

    console.log('Sending response')
    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
