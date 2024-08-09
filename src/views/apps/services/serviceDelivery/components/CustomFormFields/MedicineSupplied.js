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
  Autocomplete
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import debounce from 'lodash/debounce'

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
  const [medicationDetails, setMedicationDetails] = useState(
    value || {
      drugCode: '',
      drugDescription: '',
      pack: '',
      quantitySupplied: '',
      drugDose: '',
      medicationSupplyType: medicationSupplyTypes[0].value,
      provisionDate: '',
      patientExemptCode: patientExemptCodes[0].value,
      supplyRequestReason: '',
      prescriptionIntercepted: ''
    }
  )
  const [genericDrug, setGenericDrug] = useState(null)
  const [genericDrugOptions, setGenericDrugOptions] = useState([])
  const [packOptions, setPackOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('generic drug', genericDrug)
    if (genericDrug && genericDrug.vpid) {
      fetchPackOptions(genericDrug.vpid)
    }
  }, [genericDrug])

  useEffect(() => {
    console.log('generic options just updated', genericDrugOptions)
  }, [genericDrugOptions])

  const handleChange = (param, newValue) => {
    const updatedDetails = { ...medicationDetails, [param]: newValue }
    setMedicationDetails(updatedDetails)
    onChange(updatedDetails)
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
    setGenericDrug(selectedDrug)
    handleChange('drugDescription', selectedDrug ? selectedDrug.nm : '')
    handleChange('pack', '') // Reset pack when a new drug is selected
  }

  const fetchPackOptions = async vpid => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.rpc('get_pack_options', { p_vpid: vpid })
    console.log('GET PACK IN', { data, error })
    if (error) {
      console.error(error)
      setPackOptions([])
      setLoading(false)
    } else {
      setPackOptions(data)
      setLoading(false)
    }
  }

  const handlePackSelect = selectedPack => {
    handleChange('pack', selectedPack ? selectedPack.nm : '')
  }

  const renderPredefinedOptions = () => {
    if (!predefinedOptions) return null
    return predefinedOptions.map(option => (
      <Button key={option.drugDescription} variant='outlined' onClick={() => handlePredefinedOptionSelect(option)}>
        {option.drugDescription}
      </Button>
    ))
  }

  const handlePredefinedOptionSelect = option => {
    handleGenericDrugSelect({ nm: option.drugDescription, vpid: option.vpid })
    // setGenericDrug({
    //     vpid:option.drugCode,
    //     nm:option.nm,
    // })
    setMedicationDetails({
      ...medicationDetails,
      drugCode: option.drugCode,
      drugDescription: option.drugDescription,
      quantitySupplied: option.quantitySupplied,
      drugDose: option.drugDose,
      medicationSupplyType: option.medicationSupplyType,
      provisionDate: option.provisionDate,
      patientExemptCode: option.patientExemptCode
    })
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Medicines Supplied
      </Typography>
      {predefinedOptions.length > 0 && (
        <Box mb={2}>
          <Typography variant='subtitle1'>Predefined Options:</Typography>
          {renderPredefinedOptions()}
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
        value={genericDrug}
        onChange={(event, newValue) => handleGenericDrugSelect(newValue)}
        onInputChange={(event, newInputValue) => handleGenericDrugSearch(newInputValue)}
        loading={loading}
        loadingText='Loading...'
        noOptionsText={loading ? 'Loading...' : 'No drugs found 2'}
      />
      {/* {packOptions.length > 0 && (
        <FormControl fullWidth margin='normal' disabled={!genericDrug}>
          <InputLabel>Choose Pack</InputLabel>
          <Select value={medicationDetails.pack || ''} onChange={e => handleChange('pack', e.target.value)}>
            {packOptions.map(pack => (
              <MenuItem key={pack.id} value={pack.nm}>
                {pack.nm} - {pack.subp || 'No size specified'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )} */}
      <Autocomplete
        options={packOptions}
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
        value={packOptions.find(pack => pack.nm === medicationDetails.pack) || null}
        onChange={(event, newValue) => handlePackSelect(newValue)}
        disabled={!genericDrug}
        loading={loading}
        loadingText='Loading packs...'
        noOptionsText='No packs found'
      />
      <TextField
        label='Quantity Supplied'
        value={medicationDetails.quantitySupplied}
        onChange={e => handleChange('quantitySupplied', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Quantity Supplied'
        value={medicationDetails.quantitySupplied}
        onChange={e => handleChange('quantitySupplied', e.target.value)}
        fullWidth
        margin='normal'
      />
      <FormControl fullWidth margin='normal'>
        <InputLabel>Medication Supply Type</InputLabel>
        <Select
          value={medicationDetails.medicationSupplyType || medicationSupplyTypes[0].value}
          onChange={e => handleChange('medicationSupplyType', e.target.value)}
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
        value={medicationDetails.provisionDate}
        onChange={e => handleChange('provisionDate', e.target.value)}
        fullWidth
        margin='normal'
        InputLabelProps={{ shrink: true }}
      />
      {medicationDetails.medicationSupplyType === 'ES' && (
        <>
          <FormControl fullWidth margin='normal'>
            <InputLabel>Supply Request Reason</InputLabel>
            <Select
              value={medicationDetails.supplyRequestReason}
              onChange={e => handleChange('supplyRequestReason', e.target.value)}
            >
              {supplyRequestReasons.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {medicationDetails.supplyRequestReason === 'OTHER' && (
            <TextField
              label='Please specify'
              value={medicationDetails.supplyRequestReasonOther || ''}
              onChange={e => handleChange('supplyRequestReasonOther', e.target.value)}
              fullWidth
              margin='normal'
            />
          )}
          <FormControl fullWidth margin='normal'>
            <InputLabel>Prescription Intercepted</InputLabel>
            <Select
              value={medicationDetails.prescriptionIntercepted}
              onChange={e => handleChange('prescriptionIntercepted', e.target.value)}
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
      {medicationDetails.medicationSupplyType !== 'OTC' && (
        <FormControl fullWidth margin='normal'>
          <InputLabel>Patient Exempt Code</InputLabel>
          <Select
            value={medicationDetails.patientExemptCode || ''}
            onChange={e => handleChange('patientExemptCode', e.target.value)}
          >
            {patientExemptCodes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default MedicinesSupplied
