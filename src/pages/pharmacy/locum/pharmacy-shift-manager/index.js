import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import withReducer from 'src/@core/HOC/withReducer'
import pharmacyShiftSlice from '../../../../store/apps/locum/pharmacy/locumPharmacySlice'
import * as thunks from '../../../../store/apps/locum/pharmacy/pharmacyShiftThunks'
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Icon } from '@iconify/react'
import CreateShiftModal from './CreateShiftModal'

function PharmacyShiftManagement() {
  const dispatch = useDispatch()
  const { shifts, status, error } = useSelector(state => state.pharmacyShift)
  const [newShift, setNewShift] = useState({
    date: '',
    start_time: '',
    end_time: '',
    rate: ''
  })
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    dispatch(thunks.fetchPharmacyShifts())
  }, [dispatch])

  const handleInputChange = e => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value })
  }

  const handleCreateShift = e => {
    e.preventDefault()
    dispatch(thunks.createShift(newShift))
    setNewShift({ date: '', start_time: '', end_time: '', rate: '' })
    setModalOpen(false)
  }

  const handleUpdateShift = (id, updateData) => {
    dispatch(thunks.updateShift({ id, ...updateData }))
  }

  const handleCancelShift = id => {
    dispatch(thunks.updateShift({ id, status: 'CANCELLED', actor: 'pharmacy' }))
  }

  const columns = [
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'time',
      headerName: 'Time',
      width: 180,
      valueGetter: params => `${params.row.start_time} - ${params.row.end_time}`
    },
    { field: 'rate', headerName: 'Rate (£/hr)', width: 130, valueGetter: params => `£${params.row.rate}` },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: params => (
        <Chip
          label={params.value}
          color={params.value === 'VACANT' ? 'primary' : params.value === 'BOOKED' ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: params =>
        params.row.status === 'VACANT' ? (
          <Box>
            <IconButton onClick={() => handleUpdateShift(params.row.id, { rate: prompt('Enter new rate:') })}>
              <Icon icon='mdi:pencil' />
            </IconButton>
            <IconButton onClick={() => handleCancelShift(params.row.id)}>
              <Icon icon='mdi:cancel' />
            </IconButton>
          </Box>
        ) : null
    },
    {
      field: 'pharmacist',
      headerName: 'Booked By',
      width: 200,
      valueGetter: params => (params.row.status === 'BOOKED' ? params.row.pharmacist_id : 'N/A')
    }
  ]

  if (status === 'loading') return <Typography>Loading...</Typography>
  if (error) return <Typography color='error'>Error: {error}</Typography>

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Pharmacy Shift Management
      </Typography>

      <Button
        variant='contained'
        startIcon={<Icon icon='mdi:plus' />}
        onClick={() => setModalOpen(true)}
        sx={{ mb: 3 }}
      >
        Create New Shift
      </Button>

      <DataGrid
        rows={shifts}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
      />

      <CreateShiftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        newShift={newShift}
        onInputChange={handleInputChange}
        onSubmit={handleCreateShift}
      />
    </Box>
  )
}

export default withReducer({ pharmacyShift: pharmacyShiftSlice })(PharmacyShiftManagement)
