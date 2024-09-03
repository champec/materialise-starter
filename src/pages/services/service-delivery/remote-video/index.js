import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography, Drawer, Button, IconButton, Snackbar, Alert } from '@mui/material'
import { Icon } from '@iconify/react'
import { useCallFrame } from '@daily-co/daily-react'
import AdvancedFormEngine from '../../../../views/apps/services/serviceDelivery/components/AdvancedFormEngine'

const VideoCallPage = ({
  appointment,
  serviceDelivery,
  formDefinition,
  onSubmit,
  onSaveProgress,
  formData,
  setFormData,
  isLocked,
  setIsLocked,
  errors,
  setErrors,
  history,
  setHistory,
  currentNodeId,
  setCurrentNodeId
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const callRef = useRef(null)

  const callFrame = useCallFrame({
    parentElRef: callRef,
    options: {
      url: appointment.remote_details?.url,
      token: appointment.remote_details?.hcp_token,
      showLeaveButton: true,
      // iframeStyle: {
      //   position: 'fixed',
      //   top: 0,
      //   left: 0,
      //   width: '100%',
      //   height: '80%'
      // },
      theme: {
        colors: {
          accent: '#1AA1FB',
          background: '#282A42',
          mainAreaBg: '#282A42',
          backgroundAccent: '#282A42',
          baseText: '#FFFFFF'
        }
      }
    }
  })

  useEffect(() => {
    if (appointment.remote_details?.url && callFrame) {
      callFrame.join()
    }

    return () => {
      if (callFrame) {
        callFrame.destroy()
      }
    }
  }, [appointment, callFrame])

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const handleFormSubmit = formData => {
    onSubmit(formData)
    setIsDrawerOpen(false)
  }

  const handleSaveProgress = formData => {
    onSaveProgress(formData)
    showSnackbar('Progress saved successfully', 'success')
  }

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }} ref={callRef}>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <Button variant='contained' onClick={toggleDrawer}>
          {isDrawerOpen ? 'Close Form' : 'Open Form'}
        </Button>
      </Box>

      <Drawer
        anchor='right'
        open={isDrawerOpen}
        hideBackdrop
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '40%',
            maxWidth: '600px',
            padding: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>Service Delivery Form</Typography>
          <IconButton onClick={toggleDrawer}>
            <Icon icon='gg:close-r' />
          </IconButton>
        </Box>
        <AdvancedFormEngine
          formDefinition={formDefinition}
          initialData={serviceDelivery.details || {}}
          onSubmit={handleFormSubmit}
          onSaveProgress={handleSaveProgress}
          formData={formData}
          setFormData={setFormData}
          currentNodeId={currentNodeId}
          setCurrentNodeId={setCurrentNodeId}
          history={history}
          setHistory={setHistory}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          errors={errors}
          setErrors={setErrors}
          sharedData={serviceDelivery.shared_data}
        />
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default VideoCallPage
