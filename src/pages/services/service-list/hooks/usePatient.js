import { useState } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const SANDBOX_API_URL = 'https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4/Patient'

const usePatient = () => {
  const [searchType, setSearchType] = useState('demographics')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState(null)
  const [gender, setGender] = useState('')
  const [nhsNumber, setNhsNumber] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [patientData, setPatientData] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientInputValue, setPatientInputValue] = useState('')
  const [addNewPatientDialog, setAddNewPatientDialog] = useState(false)
  const [patientSource, setPatientSource] = useState('manual')

  const handleSearch = async e => {
    e.preventDefault()
    setFeedback(null)
    setIsLoading(true)

    let url = SANDBOX_API_URL
    let config = {
      method: 'get',
      headers: {
        'X-Request-ID': uuidv4(),
        'X-Correlation-ID': uuidv4()
      }
    }

    if (searchType === 'nhsNumber') {
      url = `${SANDBOX_API_URL}/${nhsNumber}`
    } else {
      let searchParams = new URLSearchParams()
      if (firstName) searchParams.append('given', firstName)
      if (middleName) searchParams.append('given', middleName)
      if (lastName) searchParams.append('family', lastName)
      if (dateOfBirth) {
        const formattedDate = dateOfBirth
          .toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
          .split('/')
          .reverse()
          .join('-')
        searchParams.append('birthdate', formattedDate)
      }
      if (gender) searchParams.append('gender', gender)
      searchParams.append('_fuzzy-match', true)
      config.params = searchParams
    }

    config.url = url

    try {
      const response = await axios(config)

      if (searchType === 'nhsNumber') {
        setPatientData(response.data)
        setFeedback(null)
      } else if (response.data.entry && response.data.entry.length > 0) {
        setPatientData(response.data)
        setFeedback(null)
      } else {
        setFeedback({ type: 'error', message: 'No patient found. Please try different search criteria.' })
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message)
      setFeedback({
        type: 'error',
        message: `An error occurred: ${error.response?.data?.issue?.[0]?.diagnostics || error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    const patient = patientData?.entry?.[0]?.resource || patientData

    console.log('CONFIRM PATIENT', patient)

    const getAddress = addresses => {
      if (addresses && addresses.length > 0) {
        return addresses[0].line.join(', ')
      }
      return ''
    }

    const getPostCode = addresses => {
      if (addresses && addresses.length > 0) {
        return addresses[0].postalCode
      }
      return ''
    }

    const getHouseNumber = addresses => {
      if (addresses && addresses.length > 0 && addresses[0].line && addresses[0].line.length > 0) {
        const firstLine = addresses[0].line[0]
        const houseNumber = firstLine.split(' ')[0]
        return isNaN(houseNumber) ? '' : houseNumber
      }
      return ''
    }

    const getName = names => {
      if (names && names.length > 0) {
        const name = names[0]
        return {
          first_name: name.given?.[0] || '',
          middle_name: name.given?.slice(1).join(' ') || '',
          last_name: name.family || '',
          full_name: `${name.given?.join(' ') || ''} ${name.family || ''}`.trim()
        }
      }
      return { first_name: '', middle_name: '', last_name: '', full_name: '' }
    }

    const getContact = telecoms => {
      const phone = telecoms?.find(t => t.system === 'phone')?.value || ''
      const email = telecoms?.find(t => t.system === 'email')?.value || ''
      return { phone, email }
    }

    const getGPInfo = gps => {
      if (gps && gps.length > 0) {
        const gp = gps[0]
        return gp.identifier.value
      }
      return 'GP information not available'
    }

    const { first_name, middle_name, last_name, full_name } = getName(patient.name)
    const { phone, email } = getContact(patient.telecom)

    const selectedPatient = {
      id: parseInt(patient.id, 10) || null,
      created_at: new Date().toISOString(),
      profile_id: null,
      email: email,
      mobile_number: phone,
      telephone_number: parseInt(phone.replace(/\D/g, '')) || null,
      nhs_number: parseInt(patient.id, 10) || null,
      address: getAddress(patient.address),
      post_code: getPostCode(patient.address),
      sex: patient.gender || '',
      dob: patient.birthDate || '',
      age: null,
      mobile_code: '+44',
      first_name,
      middle_name,
      last_name,
      created_by: null,
      house_number: getHouseNumber(patient.address),
      full_name,
      source: 'pds',
      gp_ods: getGPInfo(patient.generalPractitioner)
    }

    setSelectedPatient(selectedPatient)
  }

  const handleSearchAgain = () => {
    setPatientData(null)
    setFeedback(null)
  }

  return {
    searchType,
    setSearchType,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    nhsNumber,
    setNhsNumber,
    feedback,
    isLoading,
    patientData,
    selectedPatient,
    setSelectedPatient,
    handleSearch,
    handleConfirm,
    handleSearchAgain,
    patientInputValue,
    setPatientInputValue,
    addNewPatientDialog,
    setAddNewPatientDialog,
    handleEditPatient: () => {
      setAddNewPatientDialog(true)
    },
    handlePatientSelect: (value, source = 'database') => {
      setSelectedPatient(value)
      setPatientInputValue(value?.first_name || '')
      setPatientSource(source)
    },
    handlePatientInputChange: (event, value) => {
      // console.log('PATIENT INPUT CHANGE', event?.target, value)
      const newValue = event?.target?.value
      if (newValue) {
        setPatientInputValue(newValue)
      }
    }
  }
}

export default usePatient
