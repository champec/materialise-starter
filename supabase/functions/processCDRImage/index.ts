import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.12.4'
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!
})

async function processImage(image, systemMessage, pharmacyRegisters) {
  try {
    const messages = [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Process this image:' },
          {
            type: 'image_url',
            image_url: {
              url: image
            }
          }
        ]
      }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Make sure to use the correct model for vision tasks
      messages: messages,
      response_format: { type: 'json_object' },
      max_tokens: 1000
    })

    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, systemMessage, pharmacyRegisters, organisationId } = await req.json()

    if (!image || !systemMessage || !pharmacyRegisters || !organisationId) {
      throw new Error('Missing required parameters')
    }

    const processedData = await processImage(image, systemMessage, pharmacyRegisters)

    return new Response(JSON.stringify(processedData), {
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
