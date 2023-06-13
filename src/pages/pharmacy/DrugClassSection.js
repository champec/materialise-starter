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

function DrugClassSection({ title, drugs, handleDrugClick }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const handleLocalSearchChange = event => {
    setLocalSearchTerm(event.target.value.toLowerCase())
  }

  const filteredDrugs = drugs.filter(drug => drug.drug_name.toLowerCase().includes(localSearchTerm))

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

      <Box>
        {filteredDrugs.map(drug => (
          <ListItem key={drug.id} onClick={() => handleDrugClick(drug)}>
            {/* <Card>
              <h2>{drug?.drug_name}</h2>
              <h3>{drug?.drug_form}</h3>
              <p>
                {drug?.drug_strength} {drug?.units}
              </p>
            </Card> */}
            <CardStatsVertical drug={drug} handleDrugClick={handleDrugClick} />
          </ListItem>
        ))}
      </Box>
    </Box>
  )
}

export default DrugClassSection
