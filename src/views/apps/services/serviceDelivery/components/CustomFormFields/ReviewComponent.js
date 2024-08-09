import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material'

const Review = ({ formData, formDefinition }) => {
  const renderReviewItems = () => {
    return Object.entries(formData).map(([key, value]) => {
      const node = formDefinition.nodes[key]
      const question = node?.field?.question || key

      // Handle non-string values (e.g., objects, arrays)
      let displayValue
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2)
      } else {
        displayValue = value
      }

      return (
        <ListItem key={key} disableGutters>
          <ListItemText primary={question} secondary={displayValue} />
        </ListItem>
      )
    })
  }

  return (
    <Paper elevation={3} style={{ maxHeight: 400, overflow: 'auto', padding: '16px' }}>
      <Typography variant='h6' gutterBottom>
        Review Your Answers
      </Typography>
      <List>{renderReviewItems()}</List>
    </Paper>
  )
}

export default Review
