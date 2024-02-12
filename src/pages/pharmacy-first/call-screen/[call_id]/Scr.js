import React from 'react'
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material'

function SCRComponent() {
  // Dummy data for demo purposes
  const patientInfo = {
    name: 'John Doe',
    address: '1234 Main St, Anytown, AT 12345',
    dob: '1980-01-01',
    nhsNumber: '1234567890',
    currentMedication: ['Medication A', 'Medication B'],
    allergies: ['Peanuts'],
    significantMedicalHistory: 'History details here',
    communicationNeeds: 'None'
  }

  return (
    <Card sx={{ width: 'auto', m: 'auto', mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          NHS Summary Care Record
        </Typography>
        <iframe
          src="https://digital.nhs.uk/services/summary-care-record-application"
          style={{ width: '100%', height: '600px', border: 'none' }}
          title="NHS Website"
        ></iframe>
      </CardContent>
    </Card>
  );

  // return (
  //   <Card sx={{ maxWidth: 600, m: 'auto', mt: 4, boxShadow: 3 }}>
  //     <CardContent>
  //       <Typography variant='h5' gutterBottom>
  //         Patient Summary Care Record (Demo)
  //       </Typography>

  //       <Table size='small'>
  //         <TableBody>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Name:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.name}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Address:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.address}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Date of Birth:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.dob}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>NHS Number:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.nhsNumber}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Current Medication:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.currentMedication.join(', ')}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Allergies:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.allergies.join(', ')}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Significant Medical History:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.significantMedicalHistory}</TableCell>
  //           </TableRow>
  //           <TableRow>
  //             <TableCell>
  //               <strong>Communication Needs:</strong>
  //             </TableCell>
  //             <TableCell>{patientInfo.communicationNeeds}</TableCell>
  //           </TableRow>
  //         </TableBody>
  //       </Table>
  //     </CardContent>
  //   </Card>
  // )

}

export default SCRComponent
