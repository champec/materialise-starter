import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import { Icon } from '@iconify/react'
import {
  fetchDrivers,
  addDriver,
  createCollection,
  updateCollection,
  fetchBags,
  updateBagStatus,
  fetchCollectionById,
  searchDrivers,
  deleteCollection,
  createTransitStops
} from '../../../store/apps/drugdash/ddThunks'
import { closeModal, openModal } from 'src/store/apps/drugdash/ddModals'
import { selectAllDrivers, selectBagsByStatus } from 'src/store/apps/drugdash'
import { setSelectedDriver, selectAllBags } from '../../../store/apps/drugdash'
import debounce from 'lodash/debounce'

const AddEditCollectionModal = ({ collectionId, onClose }) => {
  const dispatch = useDispatch()
  const drivers = useSelector(selectAllDrivers)
  const inPharmacyBags = useSelector(state => selectBagsByStatus(state, 'in_pharmacy'))
  const allBags = useSelector(selectAllBags)
  const selectedDriver = useSelector(state => state.drugDash.selectedDriver)
  const [driverSearchInput, setDriverSearchInput] = useState('')
  const [driverOptions, setDriverOptions] = useState([])
  const [selectedBags, setSelectedBags] = useState([])
  //   const [availableBags, setAvailableBags] = useState([])
  const [loading, setLoading] = useState(false)
  const [collectionStatus, setCollectionStatus] = useState('')
  const [searching, setSearching] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  console.log('COLLECTION ID', collectionId, allBags)

  useEffect(() => {
    dispatch(fetchDrivers())
    // dispatch(fetchBags({ status: 'in_pharmacy' }))

    if (collectionId) {
      dispatch(fetchCollectionById(collectionId)).then(action => {
        if (action.payload) {
          const collection = action.payload
          dispatch(setSelectedDriver(collection.driver))
          setSelectedBags(collection.bags || [])
          //   setCollectionStatus(collection.status || '')
        }
      })
    }
  }, [dispatch, collectionId])

  const handleDeleteCollection = async () => {
    setLoading(true)
    try {
      await dispatch(deleteCollection(collectionId)).unwrap()
      dispatch(closeModal())
    } catch (error) {
      console.error('Failed to delete collection:', error)
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  //   useEffect(() => {
  //     setAvailableBags(inPharmacyBags.filter(bag => !selectedBags.some(selectedBag => selectedBag.id === bag.id)))
  //   }, [inPharmacyBags, selectedBags])

  const availableBags = useMemo(() => {
    const allBagsFiltered = allBags.filter(
      bag =>
        (bag.status === 'in_pharmacy' || (collectionId && bag.collection_id === collectionId)) &&
        !selectedBags.some(selectedBag => selectedBag.id === bag.id)
    )
    console.log('collectionid', collectionId, 'allBags', allBags, allBagsFiltered)
    return allBagsFiltered
  }, [allBags, selectedBags, collectionId])

  console.log('AVAILABLE BAGS', availableBags)

  const debouncedSearchDrivers = useCallback(
    debounce(async searchTerm => {
      if (searchTerm) {
        setSearching(true)
        try {
          const result = await dispatch(searchDrivers(searchTerm)).unwrap()
          setDriverOptions(result)
        } catch (error) {
          console.error('Error searching drivers:', error)
        } finally {
          setSearching(false)
        }
      } else {
        setDriverOptions([])
      }
    }, 300),
    [dispatch]
  )

  const handleDriverSearch = (event, newValue, reason) => {
    setDriverSearchInput(newValue)
    debouncedSearchDrivers(newValue)
  }

  const handleDriverSelect = newValue => {
    dispatch(setSelectedDriver(newValue))
  }

  const handleAddNewDriver = () => {
    dispatch(openModal('addEditDriver'))
  }

  const handleAddBagToCollection = bag => {
    setSelectedBags(prevSelectedBags => [...prevSelectedBags, bag])
  }

  const handleRemoveBagFromCollection = bag => {
    console.log('Removing bag:', bag)
    setSelectedBags(prevSelectedBags => {
      const newSelectedBags = prevSelectedBags.filter(b => b.id !== bag.id)
      console.log('New selectedBags:', newSelectedBags)
      return newSelectedBags
    })

    // Use setTimeout to log state after the update
    setTimeout(() => {
      console.log('After removal - selectedBags:', selectedBags)
      console.log('After removal - availableBags:', availableBags)
    }, 0)
  }

  const handleSaveCollection = async () => {
    if (selectedDriver) {
      setLoading(true)
      try {
        const collectionData = {
          driver_id: selectedDriver.id,
          bags: selectedBags.map(bag => bag.id)
        }

        let newCollectionId

        if (collectionId) {
          // Updating existing collection
          await dispatch(updateCollection({ id: collectionId, ...collectionData })).unwrap()
          newCollectionId = collectionId
        } else {
          // Creating new collection
          const result = await dispatch(createCollection(collectionData)).unwrap()
          newCollectionId = result.id
        }

        // Update bag statuses
        await Promise.all(
          selectedBags.map(bag =>
            dispatch(
              updateBagStatus({
                bagId: bag.id,
                newStatus: 'in_group',
                collection_id: newCollectionId
              })
            )
          )
        )

        dispatch(closeModal())
      } catch (error) {
        console.error('Failed to save collection:', error)
        // Here you might want to show an error message to the user
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOpenBagModal = bag => {
    dispatch(openModal('newBag', { bagId: bag.id }))
  }

  const handleSendTransit = async () => {
    if (collectionId) {
      try {
        await dispatch(createTransitStops(collectionId)).unwrap()
        dispatch(closeModal())
        dispatch(openModal('transitStops', { collectionId }))
      } catch (error) {
        console.error('Failed to create transit stops:', error)
        // Handle error (e.g., show error message)
      }
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        {collectionId ? 'Edit Collection' : 'Create New Collection'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant='subtitle1' gutterBottom>
              Available Bags
            </Typography>
            <List>
              {availableBags.map(bag => (
                <ListItem key={bag.id} button onClick={() => handleAddBagToCollection(bag)}>
                  <ListItemText primary={`${bag.patient.first_name} ${bag.patient.last_name}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {collectionId && (
              <Button color='error' onClick={() => setDeleteDialogOpen(true)}>
                Delete Collection
              </Button>
            )}
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={drivers}
                getOptionLabel={driver => `${driver.first_name} ${driver.last_name}`}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Search Driver'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Button
                            variant='contained'
                            size='small'
                            onClick={handleAddNewDriver}
                            sx={{ minWidth: 'auto', px: 2 }}
                          >
                            Add
                          </Button>
                          {params.InputProps.endAdornment}
                        </InputAdornment>
                      )
                    }}
                  />
                )}
                value={selectedDriver}
                inputValue={driverSearchInput}
                onInputChange={handleDriverSearch}
                onChange={(event, newValue) => handleDriverSelect(newValue)}
                freeSolo
              />
            </Box>
            {selectedDriver && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle1'>Selected Driver:</Typography>
                <Typography>{`${selectedDriver.first_name} ${selectedDriver.last_name}`}</Typography>
                <Typography>{`Phone: ${selectedDriver.phone_number}`}</Typography>
              </Box>
            )}
            {/* {collectionId && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle1'>Collection Status:</Typography>
                <Chip label={collectionStatus || 'Pending'} color='primary' />
              </Box>
            )} */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Typography variant='subtitle1' gutterBottom>
                Selected Bags
              </Typography>
              <List>
                {selectedBags.map(bag => (
                  <ListItem
                    key={bag.id}
                    secondaryAction={
                      <IconButton edge='end' aria-label='remove' onClick={() => handleRemoveBagFromCollection(bag)}>
                        <Icon icon='mdi:close' />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${bag.patient.first_name} ${bag.patient.last_name}`}
                      secondary={`Status: ${bag.status}`}
                      onClick={() => handleOpenBagModal(bag)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => dispatch(closeModal())}>Cancel</Button>

              {collectionId && (
                <Button variant='contained' color='secondary' onClick={handleSendTransit} disabled={loading}>
                  Send Transit
                </Button>
              )}

              <Button
                variant='contained'
                onClick={handleSaveCollection}
                disabled={!selectedDriver || selectedBags.length === 0 || loading}
              >
                {loading ? 'Saving...' : collectionId ? 'Update Collection' : 'Save Collection'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this collection? This action cannot be undone. All bags in this collection
            will be moved back to "In Pharmacy" status.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCollection} color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AddEditCollectionModal
