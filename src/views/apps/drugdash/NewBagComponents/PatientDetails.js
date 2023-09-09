import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchDrugs, fetchPatientDrugs } from 'src/store/apps/drugdash/ddDrugs'
import { Autocomplete, TextField, List, ListItem, Typography, CircularProgress, Box, Paper } from '@mui/material'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/system'
import debounce from 'lodash/debounce'

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '100%'
})

function PatientDetails() {
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const searchedDrugs = useSelector(state => state.ddDrugs.searchedDrugs)
  const regularMedications = useSelector(state => state.ddDrugs.regularMedications)
  const acuteMedications = useSelector(state => state.ddDrugs.acuteMedications)
  const patient = useSelector(state => state.ddPatients.selectedPatient)
  const patientId = patient?.id
  const status = useSelector(state => state.ddDrugs.status)
  const error = useSelector(state => state.ddDrugs.error)

  const hasNoMedication = !regularMedications.length && !acuteMedications.length && status === 'succeeded'

  React.useEffect(() => {
    dispatch(fetchPatientDrugs(patientId))
  }, [dispatch, patientId])

  const handleSearch = debounce(term => {
    setIsSearching(true)
    dispatch(searchDrugs(term)).finally(() => {
      setIsSearching(false)
    })
  }, 500)

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm)
    }
  }, [searchTerm, dispatch])

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant='h4'>Patient Details</Typography>

      {/* Autocomplete for drug search */}
      <Autocomplete
        freeSolo
        options={searchedDrugs.map(drug => drug.name + ' ' + drug.manufacturer)}
        onInputChange={(event, newInputValue) => {
          setSearchTerm(newInputValue)
        }}
        loading={isSearching}
        loadingText={<CircularProgress size={20} />}
        renderInput={params => <TextField {...params} label='Search for drugs...' variant='outlined' />}
        sx={{ marginTop: 3, width: '100%' }}
        PaperComponent={({ children }) => (
          <Paper elevation={1}>
            <PerfectScrollbar>{children}</PerfectScrollbar>
          </Paper>
        )}
      />

      {/* Check if patient has no medication */}
      {hasNoMedication && (
        <Typography sx={{ marginTop: 2 }}>
          {patient.first_name} doesn't have medication on file. Search and add new medication.
        </Typography>
      )}

      {/* Loading/Error states */}
      {status === 'loading' && <CircularProgress sx={{ marginTop: 2 }} />}
      {status === 'failed' && (
        <Typography color='error' sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      {/* Display Patient's Regular Medications */}
      {regularMedications.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant='h6'>Regular Medications</Typography>
          <List>
            {regularMedications.map(drug => (
              <ListItem key={drug.id}>{drug.name}</ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Display Patient's Acute Medications */}
      {acuteMedications.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant='h6'>Acute Medications</Typography>
          <List>
            {acuteMedications.map(drug => (
              <ListItem key={drug.id}>{drug.name}</ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}

export default PatientDetails
