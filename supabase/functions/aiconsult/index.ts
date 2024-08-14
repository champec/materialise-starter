import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.12.4'
import { corsHeaders } from '../_shared/cors.ts'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!
})

async function getRecommendation(
  systemMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  clinicianNotes: string,
  useJsonFormat: boolean
) {
  try {
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: clinicianNotes }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      response_format: useJsonFormat ? { type: 'json_object' } : { type: 'text' }
    })

    const content = completion.choices[0].message.content
    return useJsonFormat ? JSON.parse(content) : content
  } catch (error) {
    console.error('Error in getting clinical recommendation:', error)
    throw error
  }
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { systemMessage, conversationHistory, clinicianNotes, useJsonFormat } = await req.json()

    if (!systemMessage || !clinicianNotes || !Array.isArray(conversationHistory)) {
      throw new Error('Missing required parameters or invalid conversation history')
    }

    // Get recommendation
    const recommendation = await getRecommendation(systemMessage, conversationHistory, clinicianNotes, useJsonFormat)

    // Return the recommendation and the updated conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: clinicianNotes },
      { role: 'assistant', content: JSON.stringify(recommendation) }
    ]

    return new Response(JSON.stringify({ recommendation, updatedHistory }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
