import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import ListItem from '@mui/material/ListItem'
import Paper from '@mui/material/Paper'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/material'
import Grid from '@mui/material/Grid'
import CardStatsVertical from './RegisterCard'

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5' // or any color you want
    }
  }
})

function DrugClassSection({ title, register, handleDrugClick }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const handleLocalSearchChange = event => {
    setLocalSearchTerm(event.target.value.toLowerCase())
  }

  const filteredRegisters = register.filter(register =>
    register.cdr_drugs.drug_name.toLowerCase().includes(localSearchTerm)
  )

  return (
    <Box>
      <Paper elevation={3}>
        <Box display='flex' justifyContent='space-between' alignItems='center' padding={2}>
          <Typography variant='h6'>{title}</Typography>
          <TextField
            variant='outlined'
            label='Search within class'
            onChange={handleLocalSearchChange}
            autoComplete='off'
          />
        </Box>
      </Paper>

      <Grid container spacing={1}>
        {filteredRegisters.map(drug => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={drug.id}>
            <ListItem onClick={() => handleDrugClick(drug)}>
              <CardStatsVertical drug={drug.cdr_drugs} handleDrugClick={handleDrugClick} />
            </ListItem>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default DrugClassSection
