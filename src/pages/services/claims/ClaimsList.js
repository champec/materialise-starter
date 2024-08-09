import React from 'react'
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'

const ClaimsList = ({ claims, onClaimSelect }) => {
  return (
    <List>
      {claims.map(claim => (
        <ListItem key={claim.id} button onClick={() => onClaimSelect(claim)}>
          <ListItemText
            primary={`Claim ID: ${claim.id}`}
            secondary={`Service: ${claim.service_id} | Status: ${claim.status}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge='end' aria-label='view'>
              <Icon icon='mdi:eye' />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}

export default ClaimsList
