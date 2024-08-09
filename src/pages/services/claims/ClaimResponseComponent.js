import React from 'react'
import { Box, Typography, Paper, Chip } from '@mui/material'
import { format } from 'date-fns'

const ClaimResponse = ({ response }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant='h6' gutterBottom>
        Claim Response
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography>
          <strong>Claim ID:</strong> {response.id}
        </Typography>
        <Typography>
          <strong>Status:</strong>{' '}
          <Chip label={response.status} color={response.status === 'Accepted' ? 'success' : 'error'} size='small' />
        </Typography>
        <Typography>
          <strong>Submitted:</strong> {format(new Date(response.submissionDate), 'PPP')}
        </Typography>
        <Typography>
          <strong>Processed:</strong> {format(new Date(response.processedDate), 'PPP')}
        </Typography>
        {response.errors && response.errors.length > 0 && (
          <Box>
            <Typography>
              <strong>Errors:</strong>
            </Typography>
            <ul>
              {response.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ClaimResponse
