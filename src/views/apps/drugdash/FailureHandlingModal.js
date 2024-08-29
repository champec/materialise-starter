import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material'
import { updateBags } from '../../../store/apps/drugdash/ddThunks'
import { closeModal } from 'src/store/apps/drugdash/ddModals'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const FailureHandlingModal = ({ stop }) => {
  const dispatch = useDispatch()
  const [bags, setBags] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')

  const handleBagToggle = bagId => {
    setBags(prevBags => prevBags.map(bag => (bag.id === bagId ? { ...bag, selected: !bag.selected } : bag)))
  }

  useEffect(() => {
    const fetchBags = async () => {
      try {
        const { data, error } = await supabase
          .from('dd_bags')
          .select('*, patient:dd_patients(*)')
          .neq('status', 'delivered')
          .in('id', stop.bag_ids)

        if (error) throw error

        setBags(data.map(bag => ({ ...bag, selected: false })))
      } catch (error) {
        console.error('Failed to fetch bag details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBags()
  }, [stop])

  const handleConfirm = async () => {
    if (!reason) {
      alert('Please provide a reason for failure')
      return
    }

    const updatedBags = bags
      .filter(bag => bag.selected)
      .map(bag => ({
        id: bag.id,
        status: 'in_pharmacy',
        details: {
          status_details: {
            state: 'failed',
            reason: reason,
            date: new Date().toISOString(),
            try_number: 1 // You might want to increment this based on previous attempts
          }
        }
      }))

    try {
      await dispatch(updateBags(updatedBags)).unwrap()
      dispatch(closeModal())
    } catch (error) {
      console.error('Failed to update bags:', error)
      alert('Failed to update bags. Please try again.')
    }
  }

  if (loading) return <CircularProgress />
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Record Delivery Failure
      </Typography>
      {bags.map(bag => (
        <ListItem key={bag.id}>
          <FormControlLabel
            control={<Checkbox checked={bag.selected} onChange={() => handleBagToggle(bag.id)} />}
            label={
              <ListItemText
                primary={`${bag.patient.first_name} ${bag.patient.last_name}`}
                secondary={`Bag ID: ${bag.id}`}
              />
            }
          />
        </ListItem>
      ))}
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label='Reason for Failure'
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => dispatch(closeModal())} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleConfirm} color='secondary'>
          Confirm Failure
        </Button>
      </Box>
    </Box>
  )
}

export default FailureHandlingModal
