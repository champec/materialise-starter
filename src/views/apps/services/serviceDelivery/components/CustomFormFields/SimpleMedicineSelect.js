import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  FormHelperText,
  Button,
  CircularProgress,
  Autocomplete,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import debounce from 'lodash/debounce'
import { Icon } from '@iconify/react'

const MedicinesSupplied = ({ id, value, onChange, error, predefinedOptions = [] }) => {
  const [medications, setMedications] = useState(value?.medications || {})
  const [genericDrug, setGenericDrug] = useState(null)
  const [genericDrugs, setGenericDrugs] = useState([])
  const [genericDrugOptions, setGenericDrugOptions] = useState([])
  const [packOptions, setPackOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDrugCode, setSelectedDrugCode] = useState('')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  useEffect(() => {
    if (value) {
      if (value.medications) {
        setMedications(value.medications)
        // Set the selected drug code to the first medication if any exist
        const medicationCodes = Object.keys(value.medications)
        if (medicationCodes.length > 0) {
          setSelectedDrugCode(medicationCodes[0])
        }
      }
    }
  }, [])

  const handleDrugChange = (code, param, newValue) => {
    setMedications(prevMeds => ({
      ...prevMeds,
      [code]: {
        ...prevMeds[code],
        [param]: newValue
      }
    }))
  }

  const updateParent = () => {
    const filteredMedications = Object.entries(medications).reduce((acc, [key, value]) => {
      if (key !== 'temp' || (value.drugDescription && value.pack && value.quantitySupplied && value.drugDose)) {
        acc[key] = value
      }
      return acc
    }, {})

    onChange({
      medications: filteredMedications
    })
  }

  useEffect(() => {
    updateParent()
  }, [medications])

  const debouncedSearch = debounce(async searchTerm => {
    if (!supabase) return

    setLoading(true)

    try {
      const { data, error } = await supabase.rpc('search_generic_drugs', { search_term: searchTerm })

      if (error) {
        console.error(error)
        setGenericDrugOptions([])
      } else {
        setGenericDrugOptions(data)
      }
    } catch (error) {
      console.error('Error in debouncedSearch:', error)
      setGenericDrugOptions([])
    } finally {
      setLoading(false)
    }
  }, 200)

  const handleGenericDrugSearch = searchTerm => {
    if (searchTerm) {
      debouncedSearch(searchTerm)
    } else {
      setGenericDrugOptions([])
    }
  }
  const handleGenericDrugSelect = (selectedDrug, drugCode) => {
    if (!selectedDrug) {
      // If selectedDrug is null, clear the drug information
      setMedications(prev => {
        const newMedications = { ...prev }
        delete newMedications[drugCode]
        return newMedications
      })
      setSelectedDrugCode('')
      setPackOptions(prev => ({ ...prev, [drugCode]: [] }))
      return
    }

    setMedications(prev => {
      const newMedications = { ...prev }
      if (selectedDrugCode === 'temp') {
        delete newMedications.temp
      }
      newMedications[selectedDrug.vpid] = {
        drugCode: selectedDrug.vpid,
        drugDescription: selectedDrug.nm,
        pack: '',
        quantitySupplied: selectedDrug?.quantitySupplied ? selectedDrug.quantitySupplied : '',
        drugDose: selectedDrug?.drugDose ? selectedDrug.drugDose : ''
      }
      return newMedications
    })
    setSelectedDrugCode(selectedDrug.vpid)

    // Fetch pack options if needed
    if (selectedDrug.vpid) {
      fetchPackOptions(selectedDrug.vpid)
    }
  }

  const fetchPackOptions = async vpid => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_pack_options', { p_vpid: vpid })
      if (error) {
        console.error('Error fetching pack options:', error)
        setPackOptions(prev => ({
          ...prev,
          [vpid]: []
        }))
      } else {
        setPackOptions(prev => ({
          ...prev,
          [vpid]: data || []
        }))
      }
    } catch (error) {
      console.error('Unexpected error in fetchPackOptions:', error)
      setPackOptions(prev => ({
        ...prev,
        [vpid]: []
      }))
    } finally {
      setLoading(false)
    }
  }

  const handlePackSelect = (selectedPack, drugCode) => {
    handleDrugChange(drugCode, 'pack', selectedPack ? selectedPack.nm : '')
    if (!selectedPack) {
      // Refetch pack options when the pack is cleared
      fetchPackOptions(drugCode)
    }
  }

  const removeDrug = codeToRemove => {
    setMedications(prev => {
      const { [codeToRemove]: removed, ...rest } = prev
      return rest
    })
    if (selectedDrugCode === codeToRemove) {
      const remainingDrugCodes = Object.keys(medications).filter(code => code !== codeToRemove)
      setSelectedDrugCode(remainingDrugCodes[0] || '')
    }
    // onChange(medications)
  }

  const handlePredefinedOptionSelect = (option, code) => {
    // Update genericDrugs state
    const updatedGenericDrugs = [...genericDrugs]
    updatedGenericDrugs[code] = { nm: option.drugDescription, vpid: option.vpid }
    setGenericDrugs(updatedGenericDrugs)

    handleGenericDrugSelect(
      {
        nm: option.drugDescription,
        vpid: option.vpid,
        quantitySupplied: option.quantitySupplied,
        drugDose: option.drugDose
      },
      code
    )
  }

  const addMedication = () => {
    setMedications(prev => ({
      ...prev,
      temp: {
        drugCode: '',
        drugDescription: '',
        pack: '',
        quantitySupplied: '',
        drugDose: ''
      }
    }))
    setSelectedDrugCode('temp')
  }

  const getDrugStatus = drug => {
    if (!drug.drugDescription || !drug.pack || !drug.quantitySupplied || !drug.drugDose) {
      return 'incomplete'
    }
    // Add more conditions here if needed
    return 'complete'
  }

  const getStatusColor = status => {
    switch (status) {
      case 'error':
        return 'red'
      case 'complete':
        return 'green'
      case 'incomplete':
        return 'orange'
      default:
        return 'transparent'
    }
  }

  const removeMedication = codeToRemove => {
    setMedications(prev => {
      const { [codeToRemove]: removed, ...rest } = prev
      return rest
    })
    if (selectedDrugCode === codeToRemove) {
      const remainingDrugCodes = Object.keys(medications).filter(code => code !== codeToRemove)
      setSelectedDrugCode(remainingDrugCodes[0] || '')
    }
    // onChange(medications)
  }

  const renderSelectedDrugForm = () => {
    const selectedMedication = medications[selectedDrugCode]
    if (!selectedMedication) return null

    const selectedGenericDrug = selectedMedication.drugCode
    // const selectedGenericDrug = genericDrugs[selectedDrugIndex]
    // const selectedPackOptions = packOptions[selectedDrugIndex] || []

    console.log('PREDEFINED OPTIONS', predefinedOptions)
    return (
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography variant='subtitle1'>Selected Medication</Typography>
        {selectedDrugCode && (
          <IconButton
            onClick={() => removeMedication(selectedMedication.drugCode)}
            color='error'
            sx={{ float: 'right' }}
          >
            <Icon icon='weui:delete-on-outlined' />
          </IconButton>
        )}
        {predefinedOptions.length > 0 && (
          <Box mb={2}>
            <Typography variant='subtitle2'>Predefined Options:</Typography>
            {predefinedOptions.map(option => (
              <Button
                key={option.drugDescription}
                variant='outlined'
                onClick={() => handlePredefinedOptionSelect(option, selectedDrugCode)}
              >
                {option.drugDescription}
              </Button>
            ))}
          </Box>
        )}
        <Autocomplete
          options={genericDrugOptions}
          filterOptions={x => x}
          getOptionLabel={option => option.nm}
          renderInput={params => (
            <TextField
              {...params}
              label='Drug Description'
              fullWidth
              margin='normal'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          value={selectedMedication.drugDescription ? { nm: selectedMedication.drugDescription } : null}
          onChange={(event, newValue) => handleGenericDrugSelect(newValue, selectedMedication.drugCode)}
          onInputChange={(event, newInputValue) => handleGenericDrugSearch(newInputValue)}
          loading={loading}
          loadingText='Loading...'
          noOptionsText={loading ? 'Loading...' : 'No drugs found'}
        />
        <Autocomplete
          options={packOptions[selectedMedication.drugCode] || []}
          getOptionLabel={option => `${option.nm} - ${option.subp || 'No size specified'}`}
          renderInput={params => (
            <TextField
              {...params}
              label='Choose Pack'
              fullWidth
              margin='normal'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          value={selectedMedication.pack ? { nm: selectedMedication.pack } : null}
          onChange={(event, newValue) => handlePackSelect(newValue, selectedMedication.drugCode)}
          disabled={!selectedGenericDrug}
          loading={loading}
          loadingText='Loading packs...'
          noOptionsText='No packs found'
        />
        <TextField
          label='Quantity Supplied'
          value={selectedMedication.quantitySupplied}
          onChange={e => handleDrugChange(selectedMedication.drugCode, 'quantitySupplied', e.target.value)}
          fullWidth
          margin='normal'
        />
        <TextField
          label='Drug Dose'
          value={selectedMedication.drugDose}
          onChange={e => handleDrugChange(selectedMedication.drugCode, 'drugDose', e.target.value)}
          fullWidth
          margin='normal'
        />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Medicines Supplied
      </Typography>

      <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
        {/* Horizontal scroll and add new buttons */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2 }}>
            {Object.entries(medications).map(([drugCode, drug]) => (
              <Card
                key={drugCode}
                onClick={() => setSelectedDrugCode(drugCode)}
                sx={{
                  minWidth: 200,
                  mr: 2,
                  cursor: 'pointer',
                  border: `2px solid ${drugCode === selectedDrugCode ? '#1976d2' : 'transparent'}`,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: getStatusColor(getDrugStatus(drug))
                  }
                }}
              >
                <CardContent>
                  <Typography variant='subtitle2' noWrap>
                    {drug.drugDescription || drug.drugCode || 'New Medication'}
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={e => {
                      e.stopPropagation()
                      removeDrug(drug.drugCode)
                    }}
                  >
                    <Icon icon='weui:delete-on-outlined' />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
            <Button variant='outlined' startIcon={<Icon icon='gala:add' />} onClick={addMedication}>
              Add New Drug
            </Button>
          </Box>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>

        {renderSelectedDrugForm()}
        <Snackbar open={showDuplicateWarning} autoHideDuration={6000} onClose={() => setShowDuplicateWarning(false)}>
          <Alert onClose={() => setShowDuplicateWarning(false)} severity='warning'>
            This drug code already exists. Please use a unique code.
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  )
}

export default MedicinesSupplied
