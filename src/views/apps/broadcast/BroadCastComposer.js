import React, { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Slider,
  Button,
  TextField,
  IconButton
} from '@mui/material'
import Icon from 'src/@core/components/icon'

import BroadcastMessageForm from './BroadcastMessageForm'
import BroadCastRequestItem from './broadCastRequestItem'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import findOrCreateProfile from './elements/findOrCreateProfile'
import { useForm, Controller } from 'react-hook-form'

// ** RTK imports
import { useDispatch, useSelector } from 'react-redux'
import { createBroadcast } from 'src/store/apps/email/broadcastSlice'

function BroadCastComposer(props) {
  const {
    store,
    query,
    hidden,
    lgAbove,
    dispatch,
    setQuery,
    direction,
    updateMail,
    routeParams,
    labelColors,
    paginateMail,
    getCurrentMail,
    mailDetailsOpen,
    updateMailLabel,
    handleSelectMail,
    setMailDetailsOpen,
    handleSelectAllMail,
    handleLeftSidebarToggle
  } = props

  const [selectedServices, setSelectedServices] = useState([])
  const [services, setServices] = useState([])
  const [fetchedServices, setFetchedServices] = useState([])
  const [radius, setRadius] = useState(2000)
  const [distance, setDistance] = useState(2000)
  const [broadcastType, setBroadcastType] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formValues, setFormValues] = useState({
    transaction_type: 'replace',
    subject: '',
    messageBody: '',
    generic: '',
    item_type: 'drug',
    brand: '',
    quantity_type: 'packs',
    quantity_number: 1,
    state: 'full',
    purpose: '',
    replace_date: null,
    offer_price: 0,
    exchange_for: ''
  })
  const steps = ['Step 1: Basic Information', 'Step 2: Additional Information', 'Step 3: Confirmation']
  const [process, setProcess] = useState('')
  const [quickSelect, setQuickSelect] = useState('') // "nearby", "network", "recent", "manual"
  const orgId = useSelector(state => state.organisation.organisation.id)
  const defaultCoords = useSelector(state => state.organisation.organisation.pharmacies)
  const network = useSelector(state => state.network.contacts.network)
  const nearby = useSelector(state => state.network.contacts.nearby)
  const recent = useSelector(state => state.network.contacts.recent)

  const handleQuickSelect = newQuickSelect => {
    setQuickSelect(prevQuickSelect => {
      if (newQuickSelect === prevQuickSelect) {
        return 'manual'
      } else {
        return newQuickSelect
      }
    })
  }

  useEffect(() => {
    let selectedGroup = []

    if (quickSelect === 'nearby') {
      selectedGroup = nearby
    } else if (quickSelect === 'network') {
      selectedGroup = network
    } else if (quickSelect === 'recent') {
      selectedGroup = recent
    } else if (quickSelect === 'manual') {
      selectedGroup = [] // Reset if manual is selected
    }

    // Start with fetched services as base
    let combinedServices = [...fetchedServices]

    // Add newly selected services from quick-select
    if (quickSelect !== 'manual') {
      combinedServices = [...combinedServices, ...selectedGroup]
      setSelectedServices(selectedGroup)
    } else {
      setSelectedServices([])
    }

    // Remove duplicates
    const uniqueServices = Array.from(new Set(combinedServices.map(s => s.id))).map(id =>
      combinedServices.find(s => s.id === id)
    )

    setServices(uniqueServices)
  }, [quickSelect, fetchedServices, nearby, network, recent])

  useEffect(() => {
    const fetchServices = async () => {
      const latitude = defaultCoords.latitude
      const longitude = defaultCoords.longitude
      const { data, error: nearbyError } = await supabase.rpc('get_nearby_pharmacies', {
        lat: latitude,
        lon: longitude,
        radius
      })
      setServices(data)
      setFetchedServices(data)
      console.log(services)
    }
    fetchServices()
  }, [radius])

  const handleServicesChange = event => {
    setSelectedServices(event.target.value)
  }

  const handleDistanceChange = (event, newValue) => {
    setDistance(newValue)
  }

  const handleRadiusChange = event => {
    setRadius(distance)
  }

  const handleFormSubmit = async () => {
    const {
      subject,
      messageBody,
      generic,
      item_type,
      brand,
      quantity_type,
      quantity_number,
      state,
      purpose,
      transaction_type,
      replace_date,
      offer_price,
      exchange_for
    } = formValues

    const recipients = selectedServices.map(profile => profile.id) // Assuming profile.id is the recipient ID

    const broadcastItem = {
      generic,
      item_type,
      brand,
      quantity_type,
      quantity_number,
      state,
      purpose,
      transaction_type,
      replace_date,
      offer_price,
      exchange_for
    }

    const payload = {
      recipients,
      subject,
      content: messageBody,
      type: broadcastType, // Assuming broadcastType is available in your function
      broadcastItem
    }

    try {
      await dispatch(createBroadcast(payload)).unwrap()
      setProcess('Completed!')
    } catch (error) {
      console.error('Error creating broadcast:', error)
      setProcess('Failed')
    }
  }

  const handleBroadcastTypeChange = event => {
    setBroadcastType(event.target.value)
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative', '& .ps__rail-y': { zIndex: 5 } }}>
      <Box sx={{ height: '100%', backgroundColor: 'background.paper' }}>
        <Box sx={{ px: 5, py: 3 }}>
          {lgAbove ? null : (
            <IconButton onClick={handleLeftSidebarToggle} sx={{ mr: 1, ml: -2 }}>
              <Icon icon='mdi:menu' fontSize={20} />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', '& > *': { mt: 4, width: '100%' } }}>
            <Typography mt={4} mb={4}>
              {process}
            </Typography>
            <Typography sx={{ mb: 2, fontWeight: 500 }}>Distance</Typography>
            <Slider
              step={10}
              marks={[
                { value: 500, label: '50m' },
                { value: 1000, label: '100m' },
                { value: 2500, label: '150m' },
                { value: 2000, label: '200m' },
                { value: 2500, label: '250m' }
              ]}
              value={distance}
              valueLabelDisplay='on'
              getAriaValueText={value => `${value}km`}
              aria-labelledby='distance-slider'
              onMouseUp={handleRadiusChange}
              onChange={handleDistanceChange}
              min={500}
              max={2500}
            />
            {/* Rapid Select Buttons */}
            <Box mt={2}>
              <Checkbox checked={quickSelect === 'nearby'} onChange={() => handleQuickSelect('nearby')} />
              Nearby
              <Checkbox checked={quickSelect === 'network'} onChange={() => handleQuickSelect('network')} />
              Network
              <Checkbox checked={quickSelect === 'recent'} onChange={() => handleQuickSelect('recent')} />
              Recent
              <Checkbox checked={quickSelect === 'manual'} onChange={() => handleQuickSelect('manual')} />
              Manual
            </Box>

            <FormControl fullWidth>
              <InputLabel id='services-select-label'>Services</InputLabel>
              <Select
                multiple
                label='Services'
                value={selectedServices}
                renderValue={selected => selected.map(s => s.organisation_name).join(', ')}
                onChange={handleServicesChange}
                id='services-select'
                labelId='services-select-label'
              >
                {services.map(service => (
                  <MenuItem key={service.id} value={service}>
                    <Checkbox checked={selectedServices.some(s => s.id === service.id)} />
                    <ListItemText
                      primary={`${service.organisation_name}`}
                      secondary={`${service.distance.toFixed(2)} m away`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2}>
              <FormControl fullWidth>
                <InputLabel id='broadcast-type-select-label'>Broadcast Type</InputLabel>
                <Select
                  label='Broadcast Type'
                  value={broadcastType}
                  onChange={handleBroadcastTypeChange}
                  id='broadcast-type-select'
                  labelId='broadcast-type-select-label'
                >
                  <MenuItem value='message'>Broadcast Message</MenuItem>
                  <MenuItem value='item'>Broadcast Item Request</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box mt={3} mb={4}>
              {broadcastType === 'message' && (
                <>
                  <BroadcastMessageForm formValues={formValues} setFormValues={setFormValues} />
                </>
              )}
              {broadcastType === 'item' && (
                <>
                  <BroadCastRequestItem
                    steps={steps}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setFormValues={setFormValues}
                    formValues={formValues}
                  />
                </>
              )}
            </Box>
            <Box mt={2}>
              {activeStep === steps.length || broadcastType === 'message' ? (
                <Button variant='contained' onClick={handleFormSubmit}>
                  Submit
                </Button>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

BroadCastComposer.contentHeightFixed = true

export default BroadCastComposer
