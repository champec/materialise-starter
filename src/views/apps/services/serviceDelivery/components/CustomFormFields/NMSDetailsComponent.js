import React from 'react'
import { Box, Typography } from '@mui/material'

const NMSDetailsComponent = ({ medications, children }) => {
  return (
    <Box>
      {medications && (
        <Box mb={3}>
          <Typography variant='h6'>Selected Medications</Typography>
          {Object.entries(medications).map(([code, medication]) => (
            <Box key={code} mb={1}>
              <Typography>
                {medication.drugDescription} - {medication.quantitySupplied} {medication.pack}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Dose: {medication.drugDose}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      {children}
    </Box>
  )
}

export default NMSDetailsComponent
