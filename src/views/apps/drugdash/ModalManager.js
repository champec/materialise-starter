import React from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { closeModal, closeAllModals } from 'src/store/apps/drugdash/ddModals'

import { setSelectedPatient } from '../../../store/apps/drugdash'
import PatientSearchModal from './PatientSearchModal'
import DrugSearchModal from './DrugSearchModal'
import AddEditPatientDrugModal from './AddEditPatientDrugModal'
import AddEditPatientModal from './AddEditPatientModal'
import EditBag from './EditBag'
import NewBagModal from './NewBagModal'
import NewJobModal from './NewJobModal'
import PatientDetails from './NewBagComponents/PatientDetails'
import AddEditCollectionModal from './AddCollectionModal'
import AddDriverModal from './AddDriverModal'
import TransitStopsModal from './TransitStopsModal'
import DeliveryConfirmationModal from './DeliveryConfirmationModal'
import FailureHandlingModal from './FailureHandlingModal'

// MUI Components
import { Dialog, DialogContent, Container, IconButton, DialogTitle, AppBar, Toolbar, Typography } from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'

const ModalManager = () => {
  // Access the active modal's name from the Redux store
  const openModals = useSelector(state => state.ddModals.openModals)
  const modalProps = useSelector(state => state.ddModals.modalProps)
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeModal())
  }

  const handleCloseWithSelectedPatient = () => {
    console.log('HANDLE CLOSE WITH SELECTED PT')
    dispatch(closeModal())
    dispatch(setSelectedPatient(null))
  }

  const handleCloseAllModalsWithSelectedPatient = () => {
    console.log('HANDLE CLOSE ALL MODALS WITH SELECTED PT')
    dispatch(closeModal())
    dispatch(setSelectedPatient(null))
  }

  const renderDialogContent = modalName => {
    const props = modalProps[modalName] || {}

    switch (modalName) {
      case 'patientSearch':
        return <PatientSearchModal onClose={handleClose} {...props} />
      case 'drugSearch':
        return <DrugSearchModal onClose={handleClose} {...props} />
      case 'addEditPatientDrug':
        return <AddEditPatientDrugModal onClose={handleClose} {...props} />
      case 'addEditPatient':
        return <AddEditPatientModal onClose={handleClose} {...props} />
      case 'editBag':
        return <EditBag onClose={handleClose} {...props} />
      case 'newBag':
        return <NewBagModal onClose={handleCloseWithSelectedPatient} {...props} />
      case 'patientDetails':
        return <PatientDetails onClose={handleClose} {...props} />
      case 'newJob':
        return <NewJobModal onClose={handleClose} {...props} />
      case 'addEditCollection':
        return <AddEditCollectionModal {...props} onClose={handleClose} />
      case 'addEditDriver':
        return <AddDriverModal onClose={handleClose} {...props} />
      case 'transitStops':
        return <TransitStopsModal onClose={handleClose} {...props} />
      case 'deliveryConfirmation':
        return <DeliveryConfirmationModal {...props} />
      case 'failureHandling':
        return <FailureHandlingModal {...props} />
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
              <IconButton color='inherit' onClick={handleCloseAllModalsWithSelectedPatient}>
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
