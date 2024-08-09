import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material'
import { format } from 'date-fns'

const ClaimHistory = ({ claim }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant='h6' gutterBottom>
        Claim History
      </Typography>
      <List>
        {claim.history.map((event, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary={event.action}
                secondary={
                  <React.Fragment>
                    <Typography component='span' variant='body2' color='text.primary'>
                      {format(new Date(event.date), 'PPP p')}
                    </Typography>
                    {event.details && (
                      <Typography component='p' variant='body2'>
                        {event.details}
                      </Typography>
                    )}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < claim.history.length - 1 && <Divider variant='inset' component='li' />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}

export default ClaimHistory
