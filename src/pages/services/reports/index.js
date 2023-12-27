import React, { useState, useEffect, useCallback } from 'react'
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import _ from 'lodash'

const GPSearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const NHS_API_ENDPOINT = 'https://api.nhs.uk/service-search'
  const subscriptionKey = process.env.NEXT_PUBLIC_NHS_API_KEY // Replace with your subscription key

  // Debounced fetch data function using lodash
  const debouncedFetchData = useCallback(
    _.debounce(async query => {
      if (query) {
        setLoading(true)
        const url = new URL(`${NHS_API_ENDPOINT}`)
        const params = {
          'api-version': '2',
          search: query
          // add other parameters as required
        }
        url.search = new URLSearchParams(params).toString()

        console.log('url', url.toString())

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'subscription-key': subscriptionKey
              // add other headers as required
            }
          })

          if (response.ok) {
            const data = await response.json()
            setResults(data.value) // Update according to actual response structure
          } else {
            throw new Error('Failed to fetch data: ' + response.statusText)
          }
        } catch (error) {
          console.error(error)
        }

        setLoading(false)
      }
    }, 400),
    []
  )

  // Call the debounced fetch function when the search query changes
  useEffect(() => {
    debouncedFetchData(searchQuery)
    // Cancel the debounce on useEffect cleanup.
    return debouncedFetchData.cancel
  }, [searchQuery, debouncedFetchData])

  const handleInputChange = event => {
    setSearchQuery(event.target.value)
  }

  return (
    <div>
      <h1>Search for NHS Services</h1>
      <TextField
        label='Enter Service Name'
        variant='outlined'
        type='search'
        autoComplete='off'
        value={searchQuery}
        onChange={handleInputChange}
        fullWidth
      />
      <Button variant='contained' color='primary' onClick={() => debouncedFetchData(searchQuery)}>
        Search
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <List>
          {results.map((result, index) => (
            <ListItem key={index}>
              <ListItemText primary={result.OrganisationName} secondary={`${result.Address1}, ${result.City}`} />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  )
}

export default GPSearchComponent
