import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  CircularProgress,
  Autocomplete,
  IconButton,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import debounce from 'lodash/debounce'
import { Icon } from '@iconify/react'

const medicationSupplyTypes = [
  { value: 'OTC', label: 'Over the counter medication' },
  { value: 'PGD', label: 'Patient Group Direction' },
  { value: 'RX', label: 'Independent Prescriber' },
  { value: 'ES', label: 'Emergency Supply' }
]

const patientExemptCodes = [
  { value: 'A', label: 'A - 60 years of age or over or is under 16 years of age' },
  { value: 'B', label: 'B - 16, 17 or 18 and in full time education' },
  { value: 'C', label: 'C - Has a maternity exemption certificate' },
  { value: 'D', label: 'D - Has a medical exemption certificate' },
  { value: 'E', label: 'E - Has a prescription prepayment certificate' },
  { value: 'F', label: 'F - Has a war pension exemption certificate' },
  { value: 'G', label: 'G - HC2 certificate' },
  { value: 'H', label: 'H - Income Support' },
  { value: 'I', label: "I - Income-based Jobseeker's Allowance" },
  { value: 'J', label: 'J - Income-related Employment and Support Allowance' },
  { value: 'K', label: 'K - Pension Credit Guarantee Credit' },
  { value: 'L', label: 'L - Tax Credit Exemption Certificate' },
  { value: 'M', label: 'M - Universal Credit' },
  { value: 'N', label: 'N - Named on a valid HC3 certificate' },
  { value: 'X', label: 'X - Applies to patients who are pregnant' }
]

const supplyRequestReasons = [
  { value: 'PRESCRIPTION_NOT_ORDERED', label: 'Patient had not ordered their prescription' },
  { value: 'PRESCRIPTION_ORDERED_NOT_READY', label: 'Patient had ordered their prescription but it was not ready' },
  { value: 'PRESCRIPTION_FORM_LOST', label: 'Patient had lost prescription form' },
  { value: 'LOST_OR_MISPLACED_MEDICINES', label: 'Patient had lost or misplaced the medicine(s) or appliance(s)' },
  { value: 'UNABLE_TO_COLLECT_MEDICINES', label: 'Patient was not able to collect the medicine(s) or appliance(s)' },
  { value: 'AWAY_FROM_HOME', label: 'Patient is away from home' },
  { value: 'OTHER', label: 'Other (please specify)' }
]

const prescriptionInterceptedOptions = [
  { value: 'Yes', label: 'Prescription(s) intercepted' },
  { value: 'No', label: 'Prescription(s) not intercepted' }
]

const MedicinesSupplied = ({ id, value, onChange, error, predefinedOptions = [] }) => {
  const [medications, setMedications] = useState({})
  const [commonFields, setCommonFields] = useState({
    medicationSupplyType: medicationSupplyTypes[0].value,
    provisionDate: '',
    patientExemptCode: patientExemptCodes[0].value,
    supplyRequestReason: '',
    prescriptionIntercepted: ''
  })
  const [genericDrug, setGenericDrug] = useState(null)
  const [genericDrugs, setGenericDrugs] = useState([])
  const [genericDrugOptions, setGenericDrugOptions] = useState([])
  const [packOptions, setPackOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDrugCode, setSelectedDrugCode] = useState('')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  const handleDrugChange = (code, param, newValue) => {
    setMedications(prevMeds => ({
      ...prevMeds,
      [code]: {
        ...prevMeds[code],
        [param]: newValue
      }
    }))
  }

  const handleCommonFieldChange = (field, value) => {
    setCommonFields(prev => ({ ...prev, [field]: value }))
  }

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
  const handleGenericDrugSelect = selectedDrug => {
    if (!selectedDrug) return

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

  const handlePackSelect = (selectedPack, index) => {
    handleDrugChange(index, 'pack', selectedPack ? selectedPack.nm : '')
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
    onChange(medications)
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
    onChange(medications)
  }

  const renderSelectedDrugForm = () => {
    const selectedMedication = medications[selectedDrugCode]
    if (!selectedMedication) return null

    const selectedGenericDrug = selectedMedication.drugCode
    // const selectedGenericDrug = genericDrugs[selectedDrugIndex]
    // const selectedPackOptions = packOptions[selectedDrugIndex] || []

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
          filterOptions={(options, state) => {
            const inputValue = state.inputValue.toLowerCase()
            return options.filter(option => {
              const optionText = `${option.nm} - ${option.subp || 'No size specified'}`.toLowerCase()
              return optionText.includes(inputValue)
            })
          }}
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
          value={packOptions[selectedMedication.drugCode]?.find(pack => pack.nm === selectedMedication.pack) || null}
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
        <Typography variant='subtitle1'>Common Prescription Details</Typography>
        <FormControl fullWidth margin='normal'>
          <InputLabel>Medication Supply Type</InputLabel>
          <Select
            value={commonFields.medicationSupplyType}
            onChange={e => handleCommonFieldChange('medicationSupplyType', e.target.value)}
          >
            {medicationSupplyTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label='Provision Date'
          type='date'
          value={commonFields.provisionDate}
          onChange={e => handleCommonFieldChange('provisionDate', e.target.value)}
          fullWidth
          margin='normal'
          InputLabelProps={{ shrink: true }}
        />
        {commonFields.medicationSupplyType !== 'OTC' && (
          <FormControl fullWidth margin='normal'>
            <InputLabel>Patient Exempt Code</InputLabel>
            <Select
              value={commonFields.patientExemptCode}
              onChange={e => handleCommonFieldChange('patientExemptCode', e.target.value)}
            >
              {patientExemptCodes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {commonFields.medicationSupplyType === 'ES' && (
          <>
            <FormControl fullWidth margin='normal'>
              <InputLabel>Supply Request Reason</InputLabel>
              <Select
                value={commonFields.supplyRequestReason}
                onChange={e => handleCommonFieldChange('supplyRequestReason', e.target.value)}
              >
                {supplyRequestReasons.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {commonFields.supplyRequestReason === 'OTHER' && (
              <TextField
                label='Please specify'
                value={commonFields.supplyRequestReasonOther || ''}
                onChange={e => handleCommonFieldChange('supplyRequestReasonOther', e.target.value)}
                fullWidth
                margin='normal'
              />
            )}
            <FormControl fullWidth margin='normal'>
              <InputLabel>Prescription Intercepted</InputLabel>
              <Select
                value={commonFields.prescriptionIntercepted}
                onChange={e => handleCommonFieldChange('prescriptionIntercepted', e.target.value)}
              >
                {prescriptionInterceptedOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

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
          {/* <Button
            variant='contained'
            color='primary'
            startIcon={<Icon icon='gala:add' />}
            onClick={addMedication}
            sx={{ mt: 2 }}
          >
            Add Medication
          </Button> */}
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
