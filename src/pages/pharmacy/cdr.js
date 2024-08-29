import React, { useState, useEffect, Suspense } from 'react'

import CdrTable from './EntryTableMain'
import { fetchDrugs } from 'src/store/apps/cdr'
import { fetchDrugsFromDb } from '../../@core/utils/mypharmacyutils/supabase'

import Grid from '@mui/material/Grid'

import Icon from 'src/@core/components/icon'

import DrugClassSection from './DrugClassSection'

import Divider from '@mui/material/Divider'

import {
  Card,
  CardHeader,
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Modal,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle
} from '@mui/material'

import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

import { styled } from '@mui/system'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import withReducer from 'src/@core/HOC/withReducer'
import { cdrSlice } from 'src/store/apps/cdr'
import ImageCaptureModal from './ImageCaptureModal'
import ImageProcessingResults from './ImageProcessingResult'

//modla
import NewRegisterModal from './NewRegisterModal'

//rtk
import { fetchExistingRegisters } from 'src/store/apps/cdr'
import { useSelector, useDispatch } from 'react-redux'

import systemMessage from '../../@core/utils/cdr/systemMessage'
import ControlledDrugImageProcessor from './ControlledDrugsImageProcessorComponent'

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:not(:last-of-type)': {
    borderBottom: 0
  },
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 'auto'
  }
}))

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  marginBottom: -1,
  minHeight: theme.spacing(6),
  '&.Mui-expanded': {
    minHeight: theme.spacing(6)
  }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2)
}))

function Cdr() {
  const dispatch = useDispatch()
  const { existingRegisters, existingRegistersStatus, existingRegistersError } = useSelector(state => state.cdr)

  const [activeComponent, setActiveComponent] = useState('drugList')
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [expandAll, setExpandAll] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [isNewRegisterModalOpen, setIsNewRegisterModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isImageProcessorOpen, setIsImageProcessorOpen] = useState(false)

  const organisationId = useOrgAuth()?.organisation?.id

  useEffect(() => {
    if (organisationId) {
      dispatch(fetchExistingRegisters(organisationId))
    }
  }, [dispatch, organisationId])

  const handleAccordionChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null)
  }

  const handleGlobalSearchChange = event => {
    setGlobalSearchTerm(event.target.value.toLowerCase())
  }

  const handleNewRegisterSubmit = formData => {
    console.log('New register data:', formData)
    dispatch(fetchExistingRegisters(organisationId))
  }

  const handleDrugClick = drug => {
    setSelectedDrug(drug)
    setActiveComponent('drugTable')
  }

  const handleBackClick = () => {
    setSelectedDrug(null)
    setActiveComponent('drugList')
  }

  const handleConfirmEntry = entry => {
    // Logic to add confirmed entry to the register
    console.log('Confirmed entry:', entry)
    // Update your state or make an API call to save the entry
    setIsConfirmModalOpen(false)
  }

  const processImage = async image => {
    console.log({ image, systemMessage, existingRegisters, organisationId })
    try {
      const response = await supabaseOrg.functions.invoke('processCDRImage', {
        body: {
          image,
          systemMessage,
          pharmacyRegisters: existingRegisters,
          organisationId
        }
      })

      if (response.error) {
        throw new Error(response.error.message || 'An error occurred while processing the image')
      }

      return response.data
    } catch (error) {
      console.error('Error processing image:', error)
      return [{ type: 'error', reason: error.message }]
    }
  }

  // Filter registers based on global search
  const filteredRegisters = existingRegisters.filter(
    register =>
      register.drug_brand.toLowerCase().includes(globalSearchTerm) ||
      register.drug_class.toLowerCase().includes(globalSearchTerm)
  )

  // Group registers by drug class and sort by strength
  const groupedRegisters = filteredRegisters.reduce((acc, register) => {
    if (!acc[register.drug_class]) {
      acc[register.drug_class] = []
    }
    acc[register.drug_class].push(register)
    return acc
  }, {})

  // Sort registers within each class by strength
  Object.keys(groupedRegisters).forEach(className => {
    groupedRegisters[className].sort((a, b) => {
      const strengthA = parseFloat(a.drug_strength)
      const strengthB = parseFloat(b.drug_strength)
      return strengthA - strengthB
    })
  })

  if (existingRegistersStatus === 'loading') {
    return <CircularProgress />
  }

  if (existingRegistersStatus === 'failed') {
    return <Typography color='error'>{existingRegistersError}</Typography>
  }

  return (
    <Card>
      {activeComponent === 'drugList' && (
        <>
          <CardHeader title='Controlled Drugs Register' />
          <Box display='flex' justifyContent='space-between' alignItems='center' padding={2}>
            <Typography variant='h6'>Search All registers</Typography>
            <Button onClick={() => setExpandAll(prev => !prev)}>{expandAll ? 'Collapse All' : 'Expand All'}</Button>
            <Button onClick={() => setIsNewRegisterModalOpen(true)}>Create New Register</Button>
            <Button onClick={() => setIsImageProcessorOpen(true)}>Capture Image</Button>
            <TextField
              id='outlined-basic'
              label='Search'
              variant='outlined'
              onChange={handleGlobalSearchChange}
              autoComplete='off'
              type='search'
            />
          </Box>

          {Object.entries(groupedRegisters).map(([drugClass, registers], index) => (
            <Accordion
              expanded={expandAll || expanded === `panel${index + 1}`}
              onChange={handleAccordionChange(`panel${index + 1}`)}
              key={drugClass}
            >
              <AccordionSummary
                expandIcon={<Icon icon={expanded === `panel${index + 1}` ? 'mdi:minus' : 'mdi:plus'} />}
                style={{ display: expandAll ? 'none' : 'flex' }}
              >
                <Typography>{drugClass}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DrugClassSection title={drugClass} register={registers} handleDrugClick={handleDrugClick} />
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
      {activeComponent === 'drugTable' && (
        <>
          <Button onClick={handleBackClick}>Go back</Button>
          <CdrTable selectedDrug={selectedDrug} />
        </>
      )}
      <NewRegisterModal
        open={isNewRegisterModalOpen}
        handleClose={() => setIsNewRegisterModalOpen(false)}
        handleSubmit={handleNewRegisterSubmit}
      />
      <ControlledDrugImageProcessor
        open={isImageProcessorOpen}
        handleClose={() => setIsImageProcessorOpen(false)}
        processImage={processImage}
        registers={existingRegisters}
        onConfirm={handleConfirmEntry}
      />
    </Card>
  )
}

export default withReducer('cdr', cdrSlice.reducer)(Cdr)
