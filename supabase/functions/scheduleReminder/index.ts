import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const NOTIFY_API_ENDPOINT = 'https://api.notifications.service.gov.uk/v2/notifications/sms'
const SUPABASE_API_URL = 'https://xsqwpmqfbirqdncoephf.supabase.co/rest/v1/consultation_reminders?sent=neq.true'
const SUPABASE_ANON_KEY = Deno.env.get('ANON_KEY')

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const notifications = await req.json() // Array of notifications

    const { phoneNumber, apiKey, message } = notifications

    console.log('notification', apiKey, phoneNumber, message)

    // Extract API key parts for JWT
    const apiKeyParts = apiKey.split('-')
    const API_KEY_NAME = apiKeyParts[0]
    const ISS_UUID = apiKeyParts.slice(1, 6).join('-')
    const SECRET_KEY_UUID = apiKey.substring(apiKey.indexOf(ISS_UUID) + ISS_UUID.length + 1)

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
          personalisation: { message }
        })
      })

      const notifyData = await notifyResponse.json()
      console.log('notifyData', notifyData)
      if (notifyResponse.ok) {
        // Update the 'sent' status in the Supabase table
        try {
          const updateResponse = await fetch(`${SUPABASE_API_URL}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: 'return=representation'
            },
            body: JSON.stringify({ sent: true })
          })
        } catch (error) {
          console.error('Error updating Supabase table:', error)
          return new Response(JSON.stringify({ error: error }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } else {
        console.error('Error sending SMS:', notifyData)
        return new Response(JSON.stringify({ error: JSON.stringify(notifyData) }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ message: 'Notifications processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
