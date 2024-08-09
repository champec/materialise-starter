import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Tabs, Tab, Button } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams, GridToolbar } from '@mui/x-data-grid'
import { Icon } from '@iconify/react'

import ClaimsList from './ClaimsList'
import ClaimDetails from './ClaimsDetails'
import ClaimSubmissionModal from './ClaimSubmissionModal'
import ClaimDetailsModal from './ClaimDetailsModal'
import { fetchClaims, sendClaim, amendClaim } from '../../../store/apps/claims/claimsSlice'
import withReducer from 'src/@core/HOC/withReducer'
import claimsSlice from '../../../store/apps/claims/claimsSlice'
import format from 'date-fns/format'

const ClaimsManagement = () => {
  const dispatch = useDispatch()
  const claims = useSelector(state => state.claims.claims)
  const loading = useSelector(state => state.claims.loading)
  const error = useSelector(state => state.claims.error)

  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchClaims())
  }, [dispatch])

  const columns = [
    { field: 'id', headerName: 'Claim ID', width: 200 },
    { field: 'service_id', headerName: 'Service', width: 150 },
    {
      field: 'completed_at',
      headerName: 'Completion Date',
      width: 180,
      valueGetter: params => format(new Date(params.row.completed_at), 'PPP')
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      valueGetter: params => (params.row.submitted ? 'Submitted' : 'Pending')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: params => (
        <Box>
          <Button onClick={() => handleViewDetails(params.row)}>
            {params.row.submitted ? 'View Claim' : 'View Service'}
          </Button>
          {!params.row.submitted && <Button onClick={() => handleSubmitClaim(params.row.id)}>Submit</Button>}
          {params.row.submitted && <Button onClick={() => handleAmendClaim(params.row.id)}>Amend</Button>}
        </Box>
      )
    }
  ]

  const handleViewDetails = claim => {
    setSelectedClaim(claim)
    setIsDetailsModalOpen(true)
  }

  const handleSubmitClaim = claimId => {
    dispatch(sendClaim(claimId))
  }

  const handleAmendClaim = claimId => {
    // Open amendment form or modal
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedClaim(null)
  }

  const handleOpenSubmissionModal = () => {
    setIsSubmissionModalOpen(true)
  }

  const handleCloseSubmissionModal = () => {
    setIsSubmissionModalOpen(false)
  }

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Typography variant='h4' gutterBottom>
        Claims Management
      </Typography>
      <Button variant='contained' color='primary' onClick={handleOpenSubmissionModal} sx={{ mb: 2 }}>
        Batch Submit Claims
      </Button>
      <DataGrid
        rows={claims}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        components={{ Toolbar: GridToolbar }}
        loading={loading}
        error={error}
      />
      {selectedClaim && (
        <ClaimDetailsModal open={isDetailsModalOpen} onClose={handleCloseDetailsModal} claim={selectedClaim} />
      )}
      <ClaimSubmissionModal
        open={isSubmissionModalOpen}
        onClose={handleCloseSubmissionModal}
        claims={claims.filter(claim => !claim.submitted)}
        onSubmit={handleSubmitClaim}
      />
    </Box>
  )
}
export default withReducer({
  claims: claimsSlice
})(ClaimsManagement)
