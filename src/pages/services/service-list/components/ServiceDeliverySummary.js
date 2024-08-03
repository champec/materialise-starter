import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import Icon from '@iconify/react'
import { getFormDefinitionForService } from '../../../../views/apps/services/serviceDelivery/components/utils/getFormDefinitionForService'

const renderQuestionAnswer = (field, value) => {
  const renderValue = () => {
    switch (field.type) {
      case 'text':
        return <Typography variant='body1'>{value}</Typography>
      case 'select':
      case 'radio':
        return <Chip label={value} />
      case 'checkbox':
        return (
          <Box>
            {Object.entries(value).map(([option, isChecked]) => (
              <Chip
                key={option}
                label={option}
                color={isChecked ? 'primary' : 'default'}
                variant={isChecked ? 'filled' : 'outlined'}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )
      case 'custom':
        if (field.component === 'SymptomChecklist') {
          return (
            <List dense>
              {Object.entries(value).map(([symptom, isPresent]) => (
                <ListItem key={symptom}>
                  <ListItemText primary={symptom} secondary={isPresent ? 'Present' : 'Not present'} />
                </ListItem>
              ))}
            </List>
          )
        }
        return <Typography variant='body1'>Custom component data: {JSON.stringify(value)}</Typography>
      default:
        return <Typography variant='body1'>{JSON.stringify(value)}</Typography>
    }
  }

  return (
    <Box key={field.question} mb={3}>
      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
        {field.question}
      </Typography>
      {renderValue()}
    </Box>
  )
}

const ServiceDeliverySummary = ({ deliveryId, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [deliveryData, setDeliveryData] = useState(null)
  const [formDefinition, setFormDefinition] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDeliveryData()
  }, [deliveryId])

  const fetchDeliveryData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ps_service_delivery')
        .select(
          `
          *,
          ps_service_stages(*),
          ps_appointments(
            *,
            patient_object,
            ps_services(*)
          )
        `
        )
        .eq('id', deliveryId)
        .single()

      if (error) throw error

      setDeliveryData(data)

      // Get form definition using the utility function
      const formDef = getFormDefinitionForService(data.ps_appointments.ps_services.id)
      setFormDefinition(formDef)
    } catch (err) {
      console.error('Error fetching delivery data:', err)
      setError('Failed to fetch delivery data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = () => {
    // Implement email functionality here
    console.log('Email functionality to be implemented')
  }

  if (loading) return <CircularProgress />
  if (error) return <Typography color='error'>{error}</Typography>

  const { ps_appointments: appointment, ps_service_stages: stage } = deliveryData

  return (
    <Dialog open={true} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        Service Delivery Summary
        <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Button
            //   startIcon={<Icon icon='lets-icons:print' />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            //   startIcon={<Icon icon='clarity:email-line' />}
            onClick={handleEmail}
          >
            Email
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Patient Information
          </Typography>
          <Typography>Name: {appointment.patient_object.full_name}</Typography>
          <Typography>Date of Birth: {appointment.patient_object.date_of_birth}</Typography>
          <Typography>Service: {appointment.ps_services.name}</Typography>
          <Typography>Appointment Date: {new Date(appointment.scheduled_time).toLocaleString()}</Typography>
          <Typography>Stage: {stage.name}</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            Delivery Summary
          </Typography>
          {formDefinition &&
            deliveryData.details &&
            Object.entries(formDefinition.nodes).map(([nodeId, node]) => {
              if (!node.hidden && deliveryData.details[nodeId] !== undefined) {
                return renderQuestionAnswer(node.field, deliveryData.details[nodeId])
              }
              return null
            })}
          {/* Render any additional details that are not in the form definition */}
          {deliveryData.details &&
            Object.entries(deliveryData.details).map(([key, value]) => {
              if (!formDefinition.nodes[key]) {
                return (
                  <Box key={key} mb={3}>
                    <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                      {key}
                    </Typography>
                    <Typography variant='body1'>{JSON.stringify(value)}</Typography>
                  </Box>
                )
              }
              return null
            })}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ServiceDeliverySummary
