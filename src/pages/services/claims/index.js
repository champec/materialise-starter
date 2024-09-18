import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'

// Dummy data to simulate claims
const dummyClaims = [
  {
    id: '1',
    service: 'CPCS',
    submissionDate: '2023-09-15',
    status: 'Submitted',
    amount: 14.0,
    details: {
      patientNHSNumber: '1234567890',
      referralDate: '2023-09-14',
      consultationOutcome: 'ADVICE_ONLY'
    }
  },
  {
    id: '2',
    service: 'NMS',
    submissionDate: '2023-09-16',
    status: 'Paid',
    amount: 28.0,
    details: {
      patientNHSNumber: '0987654321',
      interventionDate: '2023-09-15',
      medicationSupplied: 'Aspirin 75mg tablets'
    }
  }
  // Add more dummy claims as needed
]

const DummyMYSComponent = () => {
  const [claims, setClaims] = useState(dummyClaims)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    // Simulate fetching claims from an API
    // In a real scenario, you would make an API call here
    setClaims(dummyClaims)
  }, [])

  const handleViewDetails = claim => {
    setSelectedClaim(claim)
    setIsDialogOpen(true)
    setEditMode(false)
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleSave = () => {
    // Simulate saving the edited claim
    // In a real scenario, you would make an API call here
    setClaims(claims.map(c => (c.id === selectedClaim.id ? selectedClaim : c)))
    setEditMode(false)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setSelectedClaim(null)
    setEditMode(false)
  }

  const handleInputChange = event => {
    const { name, value } = event.target
    setSelectedClaim(prevClaim => ({
      ...prevClaim,
      details: {
        ...prevClaim.details,
        [name]: value
      }
    }))
  }

  return (
    <div>
      <h1>Manage Your Service (MYS) Dashboard</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount (£)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map(claim => (
              <TableRow key={claim.id}>
                <TableCell>{claim.id}</TableCell>
                <TableCell>{claim.service}</TableCell>
                <TableCell>{claim.submissionDate}</TableCell>
                <TableCell>{claim.status}</TableCell>
                <TableCell>{claim.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDetails(claim)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle>{editMode ? 'Edit Claim' : 'Claim Details'}</DialogTitle>
        <DialogContent>
          {selectedClaim && (
            <div>
              <p>
                <strong>Service:</strong> {selectedClaim.service}
              </p>
              <p>
                <strong>Submission Date:</strong> {selectedClaim.submissionDate}
              </p>
              <p>
                <strong>Status:</strong> {selectedClaim.status}
              </p>
              <p>
                <strong>Amount:</strong> £{selectedClaim.amount.toFixed(2)}
              </p>
              <h3>Claim Details:</h3>
              {editMode ? (
                <div>
                  <TextField
                    name='patientNHSNumber'
                    label='Patient NHS Number'
                    value={selectedClaim.details.patientNHSNumber}
                    onChange={handleInputChange}
                    fullWidth
                    margin='normal'
                  />
                  {selectedClaim.service === 'CPCS' && (
                    <>
                      <TextField
                        name='referralDate'
                        label='Referral Date'
                        type='date'
                        value={selectedClaim.details.referralDate}
                        onChange={handleInputChange}
                        fullWidth
                        margin='normal'
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormControl fullWidth margin='normal'>
                        <InputLabel>Consultation Outcome</InputLabel>
                        <Select
                          name='consultationOutcome'
                          value={selectedClaim.details.consultationOutcome}
                          onChange={handleInputChange}
                        >
                          <MenuItem value='ADVICE_ONLY'>Advice Only</MenuItem>
                          <MenuItem value='SUPPLY_MEDICINE'>Medicine Supplied</MenuItem>
                          <MenuItem value='REFERRAL'>Referral</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {selectedClaim.service === 'NMS' && (
                    <>
                      <TextField
                        name='interventionDate'
                        label='Intervention Date'
                        type='date'
                        value={selectedClaim.details.interventionDate}
                        onChange={handleInputChange}
                        fullWidth
                        margin='normal'
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        name='medicationSupplied'
                        label='Medication Supplied'
                        value={selectedClaim.details.medicationSupplied}
                        onChange={handleInputChange}
                        fullWidth
                        margin='normal'
                      />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Patient NHS Number:</strong> {selectedClaim.details.patientNHSNumber}
                  </p>
                  {selectedClaim.service === 'CPCS' && (
                    <>
                      <p>
                        <strong>Referral Date:</strong> {selectedClaim.details.referralDate}
                      </p>
                      <p>
                        <strong>Consultation Outcome:</strong> {selectedClaim.details.consultationOutcome}
                      </p>
                    </>
                  )}
                  {selectedClaim.service === 'NMS' && (
                    <>
                      <p>
                        <strong>Intervention Date:</strong> {selectedClaim.details.interventionDate}
                      </p>
                      <p>
                        <strong>Medication Supplied:</strong> {selectedClaim.details.medicationSupplied}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit}>Edit</Button>
              <Button onClick={handleClose}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DummyMYSComponent
