import React, { useState, useEffect } from 'react'
import TableColumns from './CDTable'
import { supabaseOrg } from 'src/configs/supabase'

import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import EntrySidebar from './EntrySideBar'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPatients, fetchPrescribers, fetchSuppliers, fetchEntries } from 'src/store/apps/cdr'
import ChangeNotifier from 'src/@core/components/ChangeNotifier'

function CdrTable({ selectedDrug }) {
  const [open, setOpen] = useState(false)
  // const [patients, setPatients] = useState(['loading'])
  // const [prescribers, setPrescribers] = useState(['loading'])
  // const [suppliers, setSuppliers] = useState(['loading'])
  const [errorLog, setErrorLog] = useState(null)
  // const [entries, setEntries] = useState(null)
  const handleSideBar = () => setOpen(prev => !prev)
  const [refetchTrigger, setRefetchTrigger] = useState(false)
  const [type, setType] = useState('handingOut') // 'receiving' or 'handingOut'
  const orgId = useOrgAuth()?.organisation?.id
  const supabase = supabaseOrg

  const dispatch = useDispatch()

  const { patients, prescribers, suppliers, entries } = useSelector(state => state.cdr)

  useEffect(() => {
    dispatch(fetchPatients(orgId))
    dispatch(fetchPrescribers(orgId))
    dispatch(fetchSuppliers(orgId))
    dispatch(fetchEntries({ drugId: selectedDrug.drug_id, orgId }))
  }, [dispatch, selectedDrug.id])

  // useEffect(() => {
  //   const fetchTables = async () =>  {
  //     console.log('fetching tables')
  //     try {
  //       const { data: patientData, error: patientError } = await supabase
  //         .from('cdr_patients')
  //         .select('*')
  //         .eq('organisation_id', organisationId)

  //       if (patientError) throw patientError

  //       const { data: prescriberData, error: prescriberError } = await supabase
  //         .from('cdr_prescribers')
  //         .select('*')
  //         .eq('organisation_id', organisationId)

  //       if (prescriberError) throw prescriberError

  //       const { data: supplierData, error: supplierError } = await supabase
  //         .from('cdr_suppliers')
  //         .select('*')
  //         .eq('organisation_id', organisationId)

  //       if (supplierError) throw supplierError

  //       const { data: entriesData, error: entriesError } = await supabase
  //         .from('cdr_entries')
  //         .select('*')
  //         .eq('organisation_id', organisationId)
  //         .eq('drug_id', selectedDrug.id)
  //         .order('date')

  //       if (entriesError) throw entriesError

  //       const { data: errorLogData, error: errorLogError } = await supabase.from('cdr_error_log').select('*')

  //       if (errorLogError) throw errorLogError

  //       console.log({ entriesData })
  //       setPatients(patientData || [])
  //       setPrescribers(prescriberData || [])
  //       setSuppliers(supplierData || [])
  //       setErrorLog(errorLogData || [])
  //       setEntries(entriesData || [])
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //       setErrorLog(error)
  //     }
  //   }

  //   fetchTables()
  // }, [supabase, organisationId, refetchTrigger, selectedDrug.id])

  const handleNewItemMain = async (values, table) => {
    console.log('STARTING handle NEW! item MAIN!', values, table)
    // Insert new item into the specified table
    const { error } = await supabase.from(table).insert([values])
    console.log(error)
    if (!error) setRefetchTrigger(prev => !prev)
    return error
  }

  const refetchData = () => {
    setRefetchTrigger(prev => !prev) // Update refetchTrigger to trigger useEffect
  }

  const handleTypeChangeAndOpen = type => {
    setType(type)
    setOpen(true)
  }

  return (
    <Box>
      <Box>
        <CardHeader
          title={`${selectedDrug?.drug_name} ${selectedDrug?.drug_strength}${selectedDrug?.units} CD Register`}
        />
        {/* <Button variant='contained' color='primary' onClick={() => setOpen(prev => !prev)}>
          In
        </Button>
        <Button variant='contained' color='primary' onClick={() => setOpen(prev => !prev)}>
          Out
        </Button> */}
      </Box>
      <TableColumns selectedDrug={selectedDrug} errorLog={errorLog} entries={entries} />
      <EntrySidebar
        open={open}
        toggle={handleSideBar}
        patients={patients}
        prescribers={prescribers}
        suppliers={suppliers}
        handleNewItemMain={handleNewItemMain}
        selectedDrug={selectedDrug}
        refetchData={refetchData}
        type={type}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={() => handleTypeChangeAndOpen('receiving')}
          style={{ marginRight: '20px' }}
        >
          In
        </Button>
        <Button variant='outlined' color='primary' onClick={() => handleTypeChangeAndOpen('handingOut')}>
          Out
        </Button>
      </Box>
    </Box>
  )
}

export default CdrTable
