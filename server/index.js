const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')
const next = require('next')
const { createProxyMiddleware } = require('http-proxy-middleware')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const nhsApiUrl = 'https://api.nhs.uk/service-search'
const headers = {
  'subscription-key': '6962cbaffb4b44ed9163179d027afccc'
}

app.prepare().then(() => {
  const server = express()

  server.use(cors()) // Use cors() on the Express server object, not the Next.js app object

  server.get('/fetchPharmacies', async (req, res) => {
    const skip = req.query.skip
    const limit = req.query.limit
    const response = await fetch(
      `${nhsApiUrl}?api-version=2&$skip=${skip}&$top=${limit}&$filter=OrganisationTypeId eq 'PHA'`,
      {
        headers
      }
    )
    const data = await response.json()
    res.send(data.value)
  })

  // Everything else gets passed to the Next.js handler
  server.all('*', (req, res) => handle(req, res))

  server.listen(3001, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3001')
  })
})
