import React, { useState, useEffect } from 'react'
import { supabaseOrg } from 'src/configs/supabase'
import { getNHSServiceData } from 'src/API'
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
import { useOrgAuth } from 'src/hooks/useOrgAuth'

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
  const [radius, setRadius] = useState(1500)
  const [distance, setDistance] = useState(1500)
  const [broadcastType, setBroadcastType] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formValues, setFormValues] = useState({
    transactionType: 'replace',
    subject: '',
    messageBody: '',
    itemname: '',
    itemType: 'drug',
    brand: '',
    quantityType: 'packs',
    quantityNumber: '',
    state: 'full',
    purpose: '',
    replaceDate: null,
    offerPrice: 0,
    exchangeFor: ''
  })
  const steps = ['Step 1: Basic Information', 'Step 2: Additional Information', 'Step 3: Confirmation']
  const [process, setProcess] = useState('')
  const orgId = useOrgAuth().organisation.id

  useEffect(() => {
    const fetchServices = async () => {
      const coordinates = { lat: 52.4969353, lng: -2.0258233, radius: 0 } // replace with actual coordinates
      const data = await getNHSServiceData(coordinates, radius)
      setServices(data)
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
    // Assuming `selectedServices` is an array of selected pharmacies
    const profiles = await Promise.all(
      selectedServices.map(async pharmacy => {
        setProcess(`Searching profile for ${pharmacy.organisation_name}`)
        const profile = await findOrCreateProfile(pharmacy.ods_code, pharmacy.organisation_name, 'admin')
        return profile
      })
    )
    setProcess(`Creating broadcast for ${profiles.length} pharmacies`)
    console.log(profiles)
    const currentDate = new Date()
    // Now you have an array of profiles for each selected pharmacy
    // You can use this array to create the broadcast and recipients

    const {
      subject,
      messageBody,
      itemname,
      itemtype,
      brand,
      quantityType,
      quantityNumber,
      state,
      purpose,
      transactionType,
      replaceDate,
      offerPrice,
      exchangeFor
    } = formValues
    console.log({ orgId })
    setProcess(`Creating broadcast for ${profiles.length} pharmacies`)
    const { data: broadcast, error } = await supabaseOrg
      .from('broadcasts')
      .insert({
        senderid: orgId, // assuming you have the user's id available here
        type: broadcastType,
        header: subject, // assuming you have the subject state available here
        messagebody: messageBody,
        itemname: broadcastType === 'item' ? itemname : null, // replace itemName with the actual value from the form
        itemtype: broadcastType === 'item' ? itemtype : null, // replace itemType with the actual value from the form
        brand: broadcastType === 'item' ? brand : null, // replace brand with the actual value from the form
        quantitytype: broadcastType === 'item' ? quantityType : null, // replace quantityType with the actual value from the form
        quantitynumber: broadcastType === 'item' && quantityNumber ? quantityNumber : null, // replace quantityNumber with the actual value from the form
        state: broadcastType === 'item' ? state : null, // replace state with the actual value from the form
        date: currentDate, // replace date with the actual value from the form
        purpose: broadcastType === 'item' ? purpose : null, // replace purpose with the actual value from the form
        transactiontype: broadcastType === 'item' ? transactionType : null, // replace transactionType with the actual value from the form
        replacedate: broadcastType === 'item' && replaceDate ? replaceDate : null, // replace replaceDate with the actual value from the form
        offerprice: broadcastType === 'item' ? offerPrice : null, // replace offerPrice with the actual value from the form
        exchangefor: broadcastType === 'item' ? exchangeFor : null // replace exchangeFor with the actual value from the form
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating broadcast:', error)
      return
    }
    setProcess(`Creating recipients for ${profiles.length} pharmacies`)

    const recipients = profiles.map(profile => ({
      broadcastid: broadcast.id,
      recipientid: profile.id
    }))

    const { error: recipientsError } = await supabaseOrg.from('broadcast_recipients').insert(recipients)

    if (recipientsError) {
      console.error('Error creating recipients:', recipientsError)
    }
    setProcess('Completed!')
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
