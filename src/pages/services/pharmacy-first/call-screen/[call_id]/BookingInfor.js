import React from 'react'
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableRow } from '@mui/material'

function BookingInfor({ booking }) {
  if (!booking) return <div>No booking information available</div>

  const { patient_object: patient, presenting_complaint, clinical_pathway, duration, start_date } = booking

  return (
    <Card sx={{ maxWidth: 600, m: 'auto', mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Appointment Details
        </Typography>

        <Table size='small'>
          <TableBody>
            {patient && (
              <TableRow>
                <TableCell>
                  <strong>Patient Name:</strong>
                </TableCell>
                <TableCell>{patient.full_name}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <strong>Presenting Complaint:</strong>
              </TableCell>
              <TableCell>{presenting_complaint}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Clinical Pathway:</strong>
              </TableCell>
              <TableCell>{clinical_pathway}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Duration:</strong>
              </TableCell>
              <TableCell>{duration} minutes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Date:</strong>
              </TableCell>
              <TableCell>{new Date(start_date).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default BookingInfor
