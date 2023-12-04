//Deno.env.get(MY_SECRET_NAME)
//supabase secrets set --env-file ./supabase/.env
// echo "MY_NAME=Yoda" >> ./supabase/.env.local - create the env file and sets the variable
// const { data, error } = await supabase.functions.invoke('hello-world', {
//   body: { name: 'Functions' },
// })
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const NOTIFY_API_ENDPOINT = 'https://api.notifications.service.gov.uk/v2/notifications/sms'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, apiKey } = await req.json()

    const apiKeyParts = apiKey.split('-')
    const API_KEY_NAME = apiKeyParts[0]
    const ISS_UUID = apiKeyParts.slice(1, 6).join('-') // UUIDs have 4 dashes, making 5 parts

    const SECRET_KEY_UUID = apiKey.substring(apiKey.indexOf(ISS_UUID) + ISS_UUID.length + 1)

    console.log('ISS_UUID:', ISS_UUID)
    console.log('SECRET_KEY_UUID:', SECRET_KEY_UUID)

    const keyData = {
      name: 'HMAC',
      hash: { name: 'SHA-256' }
    }

    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET_KEY_UUID), keyData, true, ['sign'])

    const jwt = await create(
      { alg: 'HS256', typ: 'JWT' },
      {
        iss: ISS_UUID,
        iat: getNumericDate(new Date())
      },
      key
    )
    console.log('JWT', jwt)

    // Call Notify API to send the SMS
    try {
      const notifyResponse = await fetch(NOTIFY_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          template_id: '58c0fdb1-1291-4c80-8985-93eebad4726e', // Set your template ID here
          personalisation: {
            message: message
          }
        })
      })

      const notifyData = await notifyResponse.json()
      return new Response(JSON.stringify(notifyData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.log('error', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.log('error', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
