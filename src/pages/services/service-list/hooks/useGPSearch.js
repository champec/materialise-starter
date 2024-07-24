import { useState, useEffect } from 'react'
import axios from 'axios'

const useGPSearch = patientData => {
  const [selectedGP, setSelectedGP] = useState(null)
  const [gpSearchTerm, setGpSearchTerm] = useState('')
  const [gpSearchResults, setGpSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const subscriptionKey = process.env.NEXT_PUBLIC_NHS_API_KEY

  useEffect(() => {
    console.log('PATIENT DATA', patientData)
    const fetchAndSetGP = async () => {
      if (patientData?.source === 'pds' && patientData?.gp_ods) {
        const gpInfo = await fetchGPInfo(patientData?.gp_ods)
      } else {
        setSelectedGP(null)
      }
    }

    fetchAndSetGP()
  }, [patientData])

  const fetchGPInfo = async odsCode => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`https://api.nhs.uk/service-search?api-version=2`, {
        params: {
          NACSCode: odsCode,
          top: 1
        },
        headers: {
          'subscription-key': subscriptionKey
        }
      })
      if (response.data.value && response.data.value.length > 0) {
        const gp = response.data.value[0]
        const selectedGP = {
          Address1: gp.Address1,
          Postcode: gp.Postcode,
          City: gp.City,
          ODSCode: gp.ODSCode,
          OrganisationName: gp.OrganisationName,
          ContactNumber: gp.Contacts.find(contact => contact.ContactMethodType === 'Telephone')?.ContactValue || null,
          EmailAddress: gp.Contacts.find(contact => contact.ContactMethodType === 'Email')?.ContactValue || null,
          source: 'PdsLink'
        }
        setSelectedGP(selectedGP)
      } else {
        setError('GP not found')
      }
    } catch (error) {
      console.error('Error fetching GP info:', error)
      setError('Error fetching GP info: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGPSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`https://api.nhs.uk/service-search?api-version=2`, {
        params: {
          search: gpSearchTerm,
          'organisation.type': 'gp',
          top: 10
        },
        headers: {
          'subscription-key': subscriptionKey
        }
      })
      setGpSearchResults(response.data.value || [])
    } catch (error) {
      console.error('Error searching for GPs:', error)
      setError('Error searching for GPs: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGPSelect = gp => {
    setSelectedGP({ ...gp, source: 'search' })
  }

  const handleRemoveGP = () => {
    setSelectedGP(null)
  }

  return {
    selectedGP,
    gpSearchTerm,
    gpSearchResults,
    isLoading,
    error,
    setSelectedGP,
    setGpSearchTerm,
    handleGPSearch,
    handleGPSelect,
    handleRemoveGP,
    fetchGPInfo
  }
}

export default useGPSearch
