import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography
} from '@mui/material'

const GPSearchDialog = ({
  open,
  onClose,
  gpSearchTerm,
  setGpSearchTerm,
  handleGPSearch,
  handleGPSelect,
  gpSearchResults,
  isLoading,
  error
}) => {
  console.log('GP RESULTS', gpSearchResults)
  return (
    <Box>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          value={gpSearchTerm}
          onChange={e => setGpSearchTerm(e.target.value)}
          placeholder='Search by name, address, or ODS code'
        />
        <Button onClick={handleGPSearch} variant='contained' sx={{ ml: 1 }}>
          Search
        </Button>
      </Box>
      {isLoading && <CircularProgress />}
      {error && <Typography color='error'>{error}</Typography>}
      <List>
        {gpSearchResults.map(gp => (
          <ListItem key={gp.ODSCode} onClick={() => handleGPSelect(gp)}>
            <ListItemText primary={gp.OrganisationName} secondary={`${gp.Address1}, ${gp.City}, ${gp.Postcode}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default GPSearchDialog
