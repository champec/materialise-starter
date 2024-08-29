import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, List, ListItem, ListItemText, Button, IconButton, Divider } from '@mui/material'
import { Icon } from '@iconify/react'
import { fetchTransitStops } from '../../../store/apps/drugdash/ddThunks'
import { closeModal, openModal } from 'src/store/apps/drugdash/ddModals'

const TransitStopsModal = ({ collectionId }) => {
  const dispatch = useDispatch()
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStops = async () => {
      try {
        const result = await dispatch(fetchTransitStops(collectionId)).unwrap()
        setStops(result)
      } catch (error) {
        console.error('Failed to fetch transit stops:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStops()
  }, [dispatch, collectionId])

  const handleViewAddress = address => {
    // Implement address viewing logic
    console.log('View address:', address)
  }

  const handleGoToMaps = address => {
    // Implement maps navigation logic
    console.log('Navigate to:', address)
  }

  const handleDeliver = stop => {
    // Implement delivery logic
    console.log('Deliver stop:', stop)
    dispatch(openModal({ modalName: 'deliveryConfirmation', props: { stop } }))
  }

  const handleFail = stop => {
    // Implement failure logic
    console.log('Failed delivery for stop:', stop)
    dispatch(openModal({ modalName: 'failureHandling', props: { stop } }))
  }

  if (loading) {
    return <Typography>Loading transit stops...</Typography>
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Transit Stops
      </Typography>
      <List>
        {stops.map((stop, index) => (
          <React.Fragment key={stop.id}>
            <ListItem>
              <ListItemText
                primary={`Stop ${index + 1}: ${stop.address}, ${stop.post_code}`}
                secondary={`${stop.bag_ids.length} bag(s) for ${stop.patient_count} patient(s)`}
              />
              <Box>
                <IconButton onClick={() => handleViewAddress(stop.address, stop.post_code)}>
                  <Icon icon='mdi:eye' />
                </IconButton>
                <IconButton onClick={() => handleGoToMaps(stop.address, stop.post_code)}>
                  <Icon icon='mdi:map-marker' />
                </IconButton>
                <IconButton onClick={() => handleDeliver(stop)}>
                  <Icon icon='mdi:check' />
                </IconButton>
                <IconButton onClick={() => handleFail(stop)}>
                  <Icon icon='mdi:close' />
                </IconButton>
              </Box>
            </ListItem>
            {index < stops.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => dispatch(closeModal())}>Close</Button>
      </Box>
    </Box>
  )
}

export default TransitStopsModal
