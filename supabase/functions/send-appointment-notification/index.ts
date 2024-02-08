//Deno.env.get(MY_SECRET_NAME)
//supabase secrets set --env-file ./supabase/.env
// echo "MY_NAME=Yoda" >> ./supabase/.env.local - create the env file and sets the variable
// const { data, error } = await supabase.functions.invoke('hello-world', {
//   body: { name: 'Functions' },
// })
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('ANON_KEY') ?? '')

async function logToDatabase(type, message, orgId, threadId, messageId) {
  const { data, error } = await supabase
    .from('sms_logs')
    .insert([{ type, message, organisation_id: orgId, thread_id: threadId }])

  if (type === 'error') {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ organisation_id: orgId, message: message, title: 'Error sending SMS' })

    if (error) {
      console.error('Error logging to database:', error)
      return new Response(JSON.stringify({ error: error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // update the most recent message from the sms_messages table with this thread_id status as failed
    const { data: updateData, error: updateError } = await supabase
      .from('sms_messages')
      .update({ status: 'failed' })
      .eq('id', messageId)

    if (updateError) {
      console.error('Error updating sms_messages table:', updateError)
      return new Response(JSON.stringify({ error: updateError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  if (error) {
    console.error('Error logging to database:', error)
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

const NOTIFY_API_ENDPOINT = 'https://api.notifications.service.gov.uk/v2/notifications/sms'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  const { phoneNumber, message, apiKey, msgTemplate, orgId, threadId, messageId } = await req.json()

  const apiKeyParts = apiKey.split('-')
  const API_KEY_NAME = apiKeyParts[0]
  const ISS_UUID = apiKeyParts.slice(1, 6).join('-') // UUIDs have 4 dashes, making 5 parts

  const SECRET_KEY_UUID = apiKey.substring(apiKey.indexOf(ISS_UUID) + ISS_UUID.length + 1)

  // console.log('ISS_UUID:', ISS_UUID)
  // console.log('SECRET_KEY_UUID:', SECRET_KEY_UUID)

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
        template_id: msgTemplate, //'58c0fdb1-1291-4c80-8985-93eebad4726e', // Set your template ID here
        personalisation: {
          message: message
        }
      })
    })

    if (!notifyResponse.ok) {
      const errorData = await notifyResponse.json()
      console.error('Notify API Error:', errorData)
      await logToDatabase('error', JSON.stringify(errorData), orgId, threadId, messageId)
      return new Response(JSON.stringify({ error: errorData }), {
        status: notifyResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const notifyData = await notifyResponse.json()
    // Log successful response to database
    await logToDatabase('success', JSON.stringify(notifyData), orgId, threadId, messageId)

    return new Response(JSON.stringify(notifyData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Internal Server Error:', error.message)
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
