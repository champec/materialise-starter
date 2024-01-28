import React, { useState, useEffect } from 'react'
import UTIForm from './pathway-forms/UTIPathway'
import ShinglesPathwayForm from './pathway-forms/SHINGLESPathway'
import ImpetigoPathwayForm from './pathway-forms/IMPETIGOPathway'
import OMPathway from './pathway-forms/OMPathway'
import { Box } from '@mui/material'
import PathwayForm from './pathway-forms/PathwayForm'
import { DecisionTrees } from './pathway-forms/DecisionTrees'

const getPathwayForm = (clinicalPathway, state, setState, onServiceUpdate) => {
  switch (clinicalPathway) {
    case 'UTI':
      return <UTIForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    case 'Shingles':
      return <ShinglesPathwayForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    case 'Impetigo':
      return <ImpetigoPathwayForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    case 'Earache':
      return <OMPathway state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    default:
      return <div>Default Form</div>
  }
}

function PFSServiceForm({ onServiceUpdate, state, setState, onSubmit }) {
  console.log('PFS STATE', state)
  const [loading, setLoading] = useState(false)
  const [ServiceTree, setServiceTree] = useState(null)
  const clinicalPathway = state?.clinical_pathway

  useEffect(() => {
    if (clinicalPathway) {
      const tree = DecisionTrees[clinicalPathway]
      console.log('TREE', tree)
      setServiceTree(tree)
    }
  }, [clinicalPathway])

  console.log('PFSSERVICE FORM', ServiceTree)
  if (loading || !ServiceTree) {
    return <div>Loading...</div>
  }
  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      {/* {getPathwayForm(clinicalPathway, state, setState, onServiceUpdate)} */}
      <PathwayForm
        state={state}
        setState={setState}
        onServiceUpdate={onServiceUpdate}
        onSubmit={onSubmit}
        loading={loading}
        setLoading={setLoading}
        ServiceTree={ServiceTree}
      />
    </Box>
  )
}

export default PFSServiceForm
