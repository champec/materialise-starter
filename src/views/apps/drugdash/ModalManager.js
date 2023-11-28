import React from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { closeModal, closeAllModals } from 'src/store/apps/drugdash/ddModals'
import { setSelectedPatient } from 'src/store/apps/drugdash/ddPatients'

import PatientSearchModal from './PatientSearchModal'
import DrugSearchModal from './DrugSearchModal'
import AddEditPatientDrugModal from './AddEditPatientDrugModal'
import AddEditPatientModal from './AddEditPatientModal'
import EditBag from './EditBag'
import NewBagModal from './NewBagModal'
import NewJobModal from './NewJobModal'
import PatientDetails from './NewBagComponents/PatientDetails'

// MUI Components
import { Dialog, DialogContent, Container, IconButton, DialogTitle, AppBar, Toolbar, Typography } from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'

const ModalManager = () => {
  // Access the active modal's name from the Redux store
  const openModals = useSelector(state => state.ddModals.openModals)
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setSelectedPatient(null))
  }

  const renderDialogContent = modalName => {
    switch (modalName) {
      case 'patientSearch':
        return <PatientSearchModal onClose={handleClose} />
      case 'drugSearch':
        return <DrugSearchModal onClose={handleClose} />
      case 'addEditPatientDrug':
        return <AddEditPatientDrugModal onClose={handleClose} />
      case 'addEditPatient':
        return <AddEditPatientModal onClose={handleClose} />
      case 'editBag':
        return <EditBag onClose={handleClose} />
      case 'newBag':
        return <NewBagModal onClose={handleClose} />
      case 'patientDetails':
        return <PatientDetails onClose={handleClose} />
      case 'newJob':
        return <NewJobModal onClose={handleClose} />
      default:
        return null
    }
  }

  return (
    <>
      {openModals.map((modalName, index) => (
        <Dialog
          open={true}
          key={index}
          onClose={handleClose}
          fullWidth
          maxWidth='md'
          PaperProps={{
            style: {
              display: 'flex',
              flexDirection: 'column',
              minHeight: '70vh'
            }
          }}
          BackdropProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <AppBar position='static'>
            <Toolbar>
              {openModals.length > 1 && (
                <IconButton edge='start' color='inherit' onClick={() => dispatch(closeModal())}>
                  <IconifyIcon icon='mdi:arrow-left' />
                </IconButton>
              )}
              <Typography variant='h6' component='div' style={{ flexGrow: 1 }}>
                Modal Title (can be dynamic based on modalName)
              </Typography>
              <IconButton
                color='inherit'
                onClick={() => {
                  dispatch(closeAllModals())
                  dispatch(setSelectedPatient(null))
                }}
              >
                <IconifyIcon icon='mdi:close' />
              </IconButton>
            </Toolbar>
          </AppBar>
          <DialogContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderDialogContent(modalName)}
          </DialogContent>
        </Dialog>
      ))}
    </>
  )
}

export default ModalManager
