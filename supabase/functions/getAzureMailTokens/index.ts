import { corsHeaders } from '../_shared/cors.ts'

const AZURE_MAIL_SECRETE_VALUE = Deno.env.get('azureMailSecrete')
const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, clientId, redirectUrl } = await req.json()

    console.log(code)
    console.log(clientId)
    console.log(redirectUrl)
    console.log(AZURE_MAIL_SECRETE_VALUE)

    // Prepare the request for the token exchange
    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('scope', 'Mail.Read Mail.Send offline_access')
    params.append('code', code)
    params.append('redirect_uri', redirectUrl)
    params.append('grant_type', 'authorization_code')
    // params.append('client_secret', AZURE_MAIL_SECRETE_VALUE)

    // Make a POST request to the Azure token endpoint
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    // // Check for successful response
    // if (!tokenResponse.ok) {
    //   const errorBody = await tokenResponse.json()
    //   console.error('Token Exchange Error Details:', errorBody)
    //   return new Response(JSON.stringify({ error: errorBody }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: tokenResponse.status // Use the actual status code from the Azure response
    //   });
    // }

    // Extract tokens from the response
    const tokenData = await tokenResponse.json()

    console.log('TOKEN RESPONSE', tokenData)
    // Return tokens to the client
    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Failed to exchange authorization code for tokens:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
