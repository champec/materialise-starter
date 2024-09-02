import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { getFormDefinitionForService } from 'src/views/apps/services/serviceDelivery/components/utils/getFormDefinitionForService'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}))

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

const PrintServiceDelivery = () => {
  const [deliveryData, setDeliveryData] = useState(null)
  const [formDefinition, setFormDefinition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()

  useEffect(() => {
    const fetchDeliveryData = async () => {
      if (id) {
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
            .eq('id', id)
            .single()

          if (error) throw error

          setDeliveryData(data)

          const formDef = getFormDefinitionForService(data.ps_service_stages)
          setFormDefinition(formDef)
        } catch (err) {
          console.error('Error fetching delivery data:', err)
          setError('Failed to fetch delivery data')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchDeliveryData()
  }, [id])

  useEffect(() => {
    if (deliveryData && !loading) {
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }, [deliveryData, loading])

  if (loading) return <CircularProgress />
  if (error) return <Typography color='error'>{error}</Typography>

  const { ps_appointments: appointment, ps_service_stages: stage } = deliveryData

  return (
    <Box sx={{ p: 12, pb: 6 }}>
      <Typography variant='h4' gutterBottom>
        Service Delivery Summary
      </Typography>

      <StyledPaper>
        <Typography variant='h6' gutterBottom>
          Patient Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>Name: {appointment.patient_object?.full_name || 'not provided'}</Typography>
            <Typography>Date of Birth: {appointment.patient_object?.date_of_birth || 'not provided'}</Typography>
            <Typography>NHS Number: {appointment.patient_object?.nhs_number || 'not provided'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Service: {appointment.ps_services.name}</Typography>
            <Typography>Appointment Date: {new Date(appointment.scheduled_time).toLocaleString()}</Typography>
            <Typography>Stage: {stage.name}</Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper>
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
      </StyledPaper>

      <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

      <Typography variant='body2'>
        This document is confidential and intended for healthcare professionals only.
      </Typography>
    </Box>
  )
}

PrintServiceDelivery.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default PrintServiceDelivery
