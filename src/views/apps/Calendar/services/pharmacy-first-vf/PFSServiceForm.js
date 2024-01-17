import React, { useState, useEffect } from 'react'
import UTIForm from './pathway-forms/UTIPathway'
import ShinglesPathwayForm from './pathway-forms/SHINGLESPathway'
import ImpetigoPathwayForm from './pathway-forms/IMPETIGOPathway'

const getPathwayForm = (clinicalPathway, state, setState, onServiceUpdate) => {
  switch (clinicalPathway) {
    case 'UTI':
      return <UTIForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    case 'Shingles':
      return <ShinglesPathwayForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    case 'Impetigo':
      return <ImpetigoPathwayForm state={state} setState={setState} onServiceUpdate={onServiceUpdate} />
    default:
      return <div>Default Form</div>
  }
}

function PFSServiceForm({ onServiceUpdate, state, setState, onSubmit }) {
  console.log('PFS STATE', state)
  const [loading, setLoading] = useState(false)
  const clinicalPathway = state?.clinical_pathway
  if (loading) {
    return <div>Loading...</div>
  }
  return <div>{getPathwayForm(clinicalPathway, state, setState, onServiceUpdate)}</div>
}

export default PFSServiceForm
