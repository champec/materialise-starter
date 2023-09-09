import React from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { closeModal } from 'src/store/apps/drugdash/ddModals'
import { setSelectedPatient } from 'src/store/apps/drugdash/ddPatients'

import PatientSearchModal from './PatientSearchModal'
import DrugSearchModal from './DrugSearchModal'
import AddEditPatientDrugModal from './AddEditPatientDrugModal'
import AddEditPatientModal from './AddEditPatientModal'
import EditBag from './EditBag'
import NewBagModal from './NewBagModal'
import NewJobModal from './NewJobModal'

// MUI Components
import { Dialog, DialogContent, Container, IconButton } from '@mui/material'
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
              minHeight: '70vh' // Setting minimum height to 70% of viewport height
            }
          }}
          BackdropProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <IconButton
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              color: '#666'
            }}
          >
            <IconifyIcon icon='mdi:close' />
            {/* <CloseIcon /> */}
          </IconButton>
          <Container>
            <DialogContent>{renderDialogContent(modalName)}</DialogContent>
          </Container>
        </Dialog>
      ))}
    </>
  )
}

export default ModalManager
