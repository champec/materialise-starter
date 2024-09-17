// openaiClient.js
import OpenAI from './openai'

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true })

export const getEmbeddings = async text => {
  try {
    // This is a placeholder. Modify this once OpenAI provides a method to fetch embeddings.
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002', // Hypothetical embedding model
      input: text
    })

    return response.data[0].embedding // Hypothetical response structure
  } catch (error) {
    console.error('Error getting embeddings:', error)
    throw error
  }
}

export const getAICompletion = async (messages, json, model = 'gpt-4o') => {
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

export const createSimulationThread = async () => {
  const thread = await openai.beta.threads.create()
  console.log('ASSISTANT CREATE SIMULATION THREAD', { thread, threadId: thread.id })
  return thread
}

export const runSimulationAssistant = async (threadId, assistantId) => {
  // Create a run
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  })

  // Wait for the run to complete
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
  while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
  }

  if (runStatus.status === 'failed') {
    throw new Error('Run failed: ' + runStatus.last_error)
  }

  // console.log("SIMULATION THREAD RUN", {run, runStatus})
  // Retrieve the messages
  const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: 'desc' })

  // console.log("SIMULATION THREAD MESSAGES", {messages})

  // Return the last message (which should be the assistant's response)

  const parsedContent = JSON.parse(messages.data[0].content[0].text.value)
  console.log('ASSISSTANT runsimulationassistant', { parsedContent })
  return parsedContent
}

export const runSimulationAssistantStream = async (threadId, assistantId, setPartialResponse) => {
  const stream = await openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId
  })

  let accumulatedResponse = ''

  try {
    for await (const chunk of stream) {
      if (chunk.event === 'thread.message.delta' && chunk.data.delta?.content) {
        const chunkContent = chunk.data.delta.content[0].text.value
        accumulatedResponse += chunkContent
        setPartialResponse(prev => prev + chunkContent)
      } else if (chunk.event === 'thread.run.completed') {
        console.log('Run completed')
      } else if (chunk.event === 'done') {
        console.log('Streaming complete')
        break
      }
    }

    console.log('ASSISTANTACCUMULATED RESPONSE', { accumulatedResponse })
    return accumulatedResponse
  } catch (error) {
    console.error('Error in stream processing:', error)
    throw error
  }
}

export const addMessageToThread = async (threadId, message) => {
  const messageOutput = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message
  })

  console.log('ASSISSTANT ADD MESSAGE TO THREAD', { messageOutput })
  return messageOutput
}

export { openai }
