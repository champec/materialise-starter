import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchDrugs, fetchPatientDrugs } from 'src/store/apps/drugdash/ddDrugs'
import {
  Autocomplete,
  TextField,
  List,
  ListItem,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Grid,
  Checkbox,
  IconButton,
  Button
} from '@mui/material'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/system'
import debounce from 'lodash/debounce'
import {
  setSelectedDrugDetail,
  addSelectedDrugs,
  removeSelectedDrugs,
  selectAllDrugs,
  deselectAllDrugs
} from 'src/store/apps/drugdash/ddDrugs'
import { openModal, closeAllModals } from 'src/store/apps/drugdash/ddModals'
import { addBag, fetchBags } from 'src/store/apps/drugdash/ddBags'

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '100%'
})

function PatientDetails() {
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [flattenedDrugsState, setFlattenedDrugsState] = useState([])
  const [isFlattening, setIsFlattening] = useState(false)
  const [selectedRegularMeds, setSelectedRegularMeds] = useState({})
  const [selectedAcuteMeds, setSelectedAcuteMeds] = useState({})
  const [isReady, setIsReady] = useState(false)

  const searchedDrugs = useSelector(state => state.ddDrugs.searchedDrugs)
  const regularMedications = useSelector(state => state.ddDrugs.regularMedications)
  const acuteMedications = useSelector(state => state.ddDrugs.acuteMedications)
  const patient = useSelector(state => state.ddPatients.selectedPatient)
  const patientId = patient?.id
  const status = useSelector(state => state.ddDrugs.status)
  const error = useSelector(state => state.ddDrugs.error)
  const selectedDrug = useSelector(state => state.ddDrugs.selectedDrugDetail)
  const selectedDrugs = useSelector(state => state.ddDrugs.selectedDrugs)

  const isAllRegularMedsSelected = regularMedications.every(drug => selectedDrugs.find(d => d.id === drug.id))
  const isAllAcuteMedsSelected = acuteMedications.every(drug => selectedDrugs.find(d => d.id === drug.id))

  const toggleAllRegularMeds = () => {
    isAllRegularMedsSelected
      ? dispatch(deselectAllDrugs(regularMedications))
      : dispatch(selectAllDrugs(regularMedications))
  }

  const toggleAllAcuteMeds = () => {
    isAllAcuteMedsSelected ? dispatch(deselectAllDrugs(acuteMedications)) : dispatch(selectAllDrugs(acuteMedications))
  }

  const handleMedCheck = drug => {
    if (selectedDrugs.find(d => d.id === drug.id)) {
      dispatch(removeSelectedDrugs(drug))
    } else {
      dispatch(addSelectedDrugs(drug))
    }
  }

  const hasNoMedication = !regularMedications.length && !acuteMedications.length && status === 'succeeded'
  console.log({ regularMedications, acuteMedications })
  useEffect(() => {
    setIsFlattening(true)
    const flattened = searchedDrugs.flatMap(drug =>
      drug.bnf_form_packs.map(pack => ({
        drugId: drug.id,
        packId: pack.id,
        name: drug.name,
        manufacturer: drug.manufacturer,
        packSize: pack.size
      }))
    )
    setFlattenedDrugsState(flattened)
    setIsFlattening(false)
  }, [searchedDrugs])

  React.useEffect(() => {
    dispatch(fetchPatientDrugs(patientId))
  }, [dispatch, patientId])

  const handleSearch = debounce(term => {
    setIsSearching(true)
    dispatch(searchDrugs(term)).finally(() => {
      setIsSearching(false)
    })
  }, 500)

  const handleDrugOptionClick = drug => {
    dispatch(setSelectedDrugDetail(drug))
    dispatch(openModal('addEditPatientDrug'))
  }

  const handleIsReadyChange = event => {
    setIsReady(event.target.checked)
  }

  const handleCloseBag = async () => {
    // Handle close bag logic here
    const bag = {
      location_status: 'inPharmacy', // inPharmacy, inTransit, inPatientHome,
      operational_status: isReady ? 'ready' : 'pending', // failed, delivered, pending, ready
      type: 'rx_bag' // rx_bag, delivery_box, shop_order, pharmacy_exchange
    }
    await dispatch(addBag(bag))
    dispatch(fetchBags())
    dispatch(closeAllModals())
  }

  const handleAddToDelivery = () => {
    // Handle add to delivery logic here
  }

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm)
    }
  }, [searchTerm, dispatch])

  return (
    <Box sx={{ padding: 3, height: '100%', flex: 1, flexDirection: 'column', display: 'flex' }}>
      <Box>
        <Typography variant='h4'>Patient Details</Typography>

        {/* Autocomplete for drug search */}
        <Autocomplete
          freeSolo
          options={flattenedDrugsState}
          getOptionLabel={option => option.name + ' - ' + option.manufacturer + ' (' + option.packSize + ')'}
          onBlur={() => {
            setSearchTerm('')
          }}
          onChange={(event, newValue) => {
            if (newValue) {
              handleDrugOptionClick(newValue)
            }
          }}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue)
          }}
          loading={isSearching || isFlattening}
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
        {hasNoMedication && patient && (
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
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', marginBottom: 2 }}>
        {(regularMedications.length > 0 || acuteMedications.length > 0) && (
          <Grid container spacing={3}>
            {/* Regular Medications */}
            <Grid item xs={6}>
              <Paper elevation={1}>
                <Box p={2}>
                  <Typography variant='h6'>Regular Medications</Typography>
                </Box>
                <List>
                  <ListItem>
                    <Checkbox
                      checked={isAllRegularMedsSelected}
                      onChange={toggleAllRegularMeds}
                      indeterminate={selectedRegularMeds.length > 0 && !isAllRegularMedsSelected}
                    />
                    Select/Deselect All
                  </ListItem>
                  {regularMedications.map(drug => (
                    <ListItem key={drug.id}>
                      <Checkbox
                        checked={!!selectedDrugs.find(d => d.id === drug.id)}
                        onChange={() => handleMedCheck(drug)}
                      />
                      {drug.bnf_medicinal_forms?.name}
                      <IconButton
                        onClick={() => {
                          /* Handle Edit */
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Acute Medications */}
            <Grid item xs={6}>
              <Paper elevation={1}>
                <Box p={2}>
                  <Typography variant='h6'>Acute Medications</Typography>
                </Box>
                <List>
                  <ListItem>
                    <Checkbox
                      checked={isAllAcuteMedsSelected}
                      onChange={toggleAllAcuteMeds}
                      indeterminate={selectedAcuteMeds.length > 0 && !isAllAcuteMedsSelected}
                    />
                    Select/Deselect All
                  </ListItem>
                  {acuteMedications.map(drug => (
                    <ListItem key={drug.id}>
                      <Checkbox
                        checked={!!selectedDrugs.find(d => d.id === drug.id)}
                        onChange={() => handleMedCheck(drug)}
                      />
                      {drug.bnf_medicinal_forms?.name}
                      <IconButton
                        onClick={() => {
                          /* Handle Edit */
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Checkbox checked={isReady} onChange={handleIsReadyChange} color='primary' />
        <Typography variant='body1' sx={{ marginRight: 2 }}>
          Is Ready?
        </Typography>
        <Button variant='contained' color='secondary' onClick={handleCloseBag} sx={{ marginRight: 1 }}>
          Close Bag
        </Button>
        <Button variant='contained' color='primary' onClick={handleAddToDelivery} disabled={isReady}>
          Add to Delivery
        </Button>
      </Box>
    </Box>
  )
}

export default PatientDetails
