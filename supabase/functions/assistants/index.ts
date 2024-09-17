import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from 'https://deno.land/x/openai@v4.61.1/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!
})

const getEmbeddings = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error getting embeddings:', error)
    throw error
  }
}

const getAICompletion = async (messages: any[], json: boolean, model = 'gpt-4o') => {
  console.log('CHAT GPT MESSAGES WE GET', { messages })
  try {
    const response = await openai.chat.completions.create({
      model: model,
      max_tokens: 2000,
      messages: messages,
      temperature: 0,
      response_format: { type: json ? 'json_object' : 'text' }
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error getting AI completion:', error)
    throw error
  }
}

const createSimulationThread = async () => {
  const thread = await openai.beta.threads.create()
  console.log('ASSISTANT CREATE SIMULATION THREAD', { thread, threadId: thread.id })
  return thread
}

const runSimulationAssistantStream = async (threadId: string, assistantId: string) => {
  console.log(`[Server] Starting runSimulationAssistantStream for thread ${threadId} and assistant ${assistantId}`)
  const stream = await openai.beta.threads.runs.createAndStream(threadId, { assistant_id: assistantId })
  console.log('[Server] Stream created from OpenAI')

  const readableStream = new ReadableStream({
    async start(controller) {
      console.log('[Server] Started reading from OpenAI stream')
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        console.log('[Server] Received chunk from OpenAI:', chunk)
        if (chunk.event === 'thread.message.delta' && chunk.data.delta?.content) {
          const content = chunk.data.delta.content[0].text.value
          console.log('[Server] Enqueueing content:', content)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
        } else if (chunk.event === 'thread.run.completed') {
          console.log('[Server] Run completed')
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'completed' })}\n\n`))
        }
      }
      console.log('[Server] OpenAI stream ended')
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'done' })}\n\n`))
      controller.close()
    }
  })

  console.log('[Server] Returning response with streaming headers')
  return new Response(readableStream, {
    headers: new Headers({
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })
  })
}

const runSimulationAssistant = async (threadId: string, assistantId: string) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  })

  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
  }

  if (runStatus.status === 'failed') {
    throw new Error('Run failed: ' + runStatus.last_error)
  }

  const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: 'desc' })

  const parsedContent = JSON.parse(messages.data[0].content[0].text.value)
  console.log('ASSISSTANT runsimulationassistant', { parsedContent })
  return parsedContent
}

const addMessageToThread = async (threadId: string, message: string) => {
  const messageOutput = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message
  })

  console.log('ASSISSTANT ADD MESSAGE TO THREAD', { messageOutput })
  return messageOutput
}

const handleOpenAIRequest = async (action: string, params: any) => {
  try {
    console.log('OpenAI object keys:', Object.keys(openai))
    console.log('OpenAI beta object keys:', Object.keys(openai.beta || {}))

    switch (action) {
      case 'getEmbeddings':
        return await getEmbeddings(params.text)
      case 'getAICompletion':
        return await getAICompletion(params.messages, params.json, params.model)
      case 'createSimulationThread':
        return await createSimulationThread()
      case 'runSimulationAssistant':
        return await runSimulationAssistant(params.threadId, params.assistantId)
      case 'runSimulationAssistantStream':
        return await runSimulationAssistantStream(params.threadId, params.assistantId)
      case 'addMessageToThread':
        return await addMessageToThread(params.threadId, params.message)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in handleOpenAIRequest:', error)
    throw error // Re-throw the error to be caught in the main serve function
  }
}

serve(async req => {
  console.log('[Server] Received request:', req.method, req.url)

  if (req.method === 'OPTIONS') {
    console.log('[Server] Responding to OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, params } = await req.json()
    console.log('[Server] Parsed request body:', { action, params })

    if (!action) {
      throw new Error('Missing required action parameter')
    }

    if (action === 'runSimulationAssistantStream') {
      console.log('[Server] Calling runSimulationAssistantStream')
      return await runSimulationAssistantStream(params.threadId, params.assistantId)
    }

    const result = await handleOpenAIRequest(action, params)
    console.log('[Server] Handled OpenAI request:', result)

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Server] Error:', error)
    const status =
      error.message === 'Invalid action' || error.message === 'Missing required action parameter' ? 400 : 500
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack // Include stack trace for debugging (remove in production)
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
