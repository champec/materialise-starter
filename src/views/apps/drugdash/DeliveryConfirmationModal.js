import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  ListItem,
  ListItemText
} from '@mui/material'
import SignatureCanvas from 'react-signature-canvas'
import { updateBags } from '../../../store/apps/drugdash/ddThunks'
import { closeModal } from 'src/store/apps/drugdash/ddModals'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const DeliveryConfirmationModal = ({ stop }) => {
  const dispatch = useDispatch()
  const [bags, setBags] = useState([])
  const [loading, setLoading] = useState(true)
  const [signature, setSignature] = useState(null)

  const handleBagToggle = bagId => {
    setBags(prevBags => prevBags.map(bag => (bag.id === bagId ? { ...bag, selected: !bag.selected } : bag)))
  }

  useEffect(() => {
    const fetchBags = async () => {
      try {
        const { data, error } = await supabase
          .from('dd_bags')
          .select('*, patient:dd_patients(*)')
          .in('id', stop.bag_ids)

        if (error) throw error

        setBags(data.map(bag => ({ ...bag, selected: true })))
      } catch (error) {
        console.error('Failed to fetch bag details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBags()
  }, [stop])

  const handleConfirm = async () => {
    if (!signature) {
      alert('Please provide a signature')
      return
    }

    const signatureData = signature.toDataURL()
    const updatedBags = bags
      .filter(bag => bag.selected)
      .map(bag => ({
        id: bag.id,
        status: 'delivered',
        signature: signatureData,
        details: {
          ...bag.details,
          status_details: {
            state: 'delivered',
            date: new Date().toISOString(),
            try_number: (bag.details?.status_details?.try_number || 0) + 1
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

  if (loading) {
    return <CircularProgress />
  }
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Confirm Delivery
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
        <Typography variant='subtitle1'>Signature</Typography>
        <Box sx={{ border: 'solid' }}>
          <SignatureCanvas
            penColor='black'
            canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
            onEnd={() => setSignature(signature)}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => dispatch(closeModal())} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleConfirm}>
          Confirm Delivery
        </Button>
      </Box>
    </Box>
  )
}

export default DeliveryConfirmationModal
