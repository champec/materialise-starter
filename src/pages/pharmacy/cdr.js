import React, { useState, useEffect } from 'react'

import CdrTable from './EntryTableMain'

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

function Cdr() {
  const [activeComponent, setActiveComponent] = useState('drugList')
  const [loading, setLoading] = useState(false)
  const [drugs, setDrugs] = useState([])
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
  const filteredDrugs = drugs.filter(drug => drug.drug_name.toLowerCase().includes(globalSearchTerm))

  // Group the filtered drugs by class
  const drugClasses = [...new Set(filteredDrugs.map(drug => drug.drug_class))]

  const supabase = supabaseOrg

  const fetchDrugs = async () => {
    console.log(organisationId)
    const { data, error } = await supabase
      .from('cdr_drug_usage')
      .select(
        `
        *,
        cdr_drugs (
          *
        )
      `
      )
      .eq('organisation_id', organisationId)

    if (error) {
      console.error('Error fetching drugs:', error)
    } else {
      console.log('Drugs fetched successfully:', data)
      setDrugs(data.map(item => item.cdr_drugs))
    }
  }

  useEffect(() => {
    if (!organisationId) return
    fetchDrugs()
  }, [organisationId])

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
                  drugs={filteredDrugs.filter(drug => drug.drug_class === drugClass)}
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

export default Cdr
