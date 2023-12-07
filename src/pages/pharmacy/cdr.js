import React, { useState, useEffect } from 'react'

import CdrTable from './EntryTableMain'
import { fetchDrugs } from 'src/store/apps/cdr'
import { fetchDrugsFromDb } from '../../@core/utils/mypharmacyutils/supabase'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import CardHeader from '@mui/material/CardHeader'
import DrugClassSection from './DrugClassSection'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'

import { CircularProgress, Typography } from '@mui/material'
import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import Card from '@mui/material/Card'

import { styled } from '@mui/system'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import withReducer from 'src/@core/HOC/withReducer'
import { cdrSlice } from 'src/store/apps/cdr'

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:not(:last-of-type)': {
    borderBottom: 0
  },
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 'auto'
  }
}))

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  marginBottom: -1,
  minHeight: theme.spacing(6),
  '&.Mui-expanded': {
    minHeight: theme.spacing(6)
  }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2)
}))

function Cdr({ dbDrugs }) {
  const [activeComponent, setActiveComponent] = useState('drugList')
  const [loading, setLoading] = useState(false)
  const [registers, setRegisters] = useState(dbDrugs || [])
  const organisationId = useOrgAuth()?.organisation?.id
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [expandAll, setExpandAll] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)

  const handleAccordionChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null)
  }

  const handleGlobalSearchChange = event => {
    setGlobalSearchTerm(event.target.value.toLowerCase())
  }

  // Apply the global search filter here
  const filteredRegisters = registers.filter(register =>
    register.cdr_drugs.drug_name.toLowerCase().includes(globalSearchTerm)
  )

  // Group the filtered registers by class
  const drugClasses = [...new Set(filteredRegisters.map(register => register.cdr_drugs.drug_class))]

  const handleDrugClick = drug => {
    setSelectedDrug(drug)
    setActiveComponent('drugTable')
  }

  const handleBackClick = () => {
    setSelectedDrug(null)
    setActiveComponent('drugList')
  }
  if (loading) {
    return <CircularProgress />
  }
  return (
    <Card>
      {/* DrugClassSections for each drug class */}
      {activeComponent === 'drugList' && (
        <>
          <CardHeader title='Controlled Drugs Register' />
          <Box display='flex' justifyContent='space-between' alignItems='center' padding={2}>
            <Typography variant='h6'>Search All registers</Typography>
            <Button onClick={() => setExpandAll(prev => !prev)}>{expandAll ? 'Collapse All' : 'Expand All'}</Button>
            <TextField
              id='outlined-basic'
              label='Search'
              variant='outlined'
              onChange={handleGlobalSearchChange}
              autoComplete='off'
              type='search'
            />
          </Box>
          {/* <Divider /> */}

          {drugClasses.map((drugClass, index) => (
            <Accordion
              expanded={expandAll || expanded === `panel${index + 1}`}
              onChange={handleAccordionChange(`panel${index + 1}`)}
              key={drugClass}
            >
              <AccordionSummary
                expandIcon={<Icon icon={expanded === `panel${index + 1}` ? 'mdi:minus' : 'mdi:plus'} />}
                style={{ display: expandAll ? 'none' : 'flex' }}
              >
                <Typography>{drugClass}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DrugClassSection
                  title={drugClass}
                  register={filteredRegisters.filter(register => register.cdr_drugs.drug_class === drugClass)}
                  handleDrugClick={handleDrugClick}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
      {activeComponent === 'drugTable' && (
        <>
          <Button onClick={handleBackClick}>Go back</Button>
          {/* Here is where you'd put your DrugTable component */}
          <CdrTable selectedDrug={selectedDrug} />
        </>
      )}
    </Card>
  )
}

export async function getServerSideProps() {
  // Fetch initial drugs data

  const dbDrugs = await fetchDrugsFromDb()

  return {
    props: {
      dbDrugs
    }
  }
}

// export default Cdr
export default withReducer('cdr', cdrSlice.reducer)(Cdr)
