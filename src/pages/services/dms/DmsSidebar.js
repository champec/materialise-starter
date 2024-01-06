import React, { useState } from 'react'
import { Box, Tabs, Tab, Typography, Button } from '@mui/material'
import { FormGroup, FormControlLabel, Checkbox, TextField } from '@mui/material'
import CustomSoloCreatable from '../nms/CustomSoloCreatable'

const initialState = {
  stage_1: {
    referral_meet_dataset_requirements: null,
    missing_data_set_reasons: [],
    issuesIdentified: null,
    issuesIdentifiedReasons: [],
    issuesDiscussedWith: [],
    prescriptionCheckCompleted: null,
    prescreptionIntercepted: null,
    followUpNoteAdded: null,
    additionalNotes: ''
  },
  stage_2: {
    undertaken: null,
    notUndertakenReasons: [],
    dateFirstPrescriptionReceived: '',
    checkOfFirstPrescription: null,
    undertakenBy: null,
    issuesIdentified: [],
    issuesNotes: '',
    discussedWith: [],
    discussedNotes: ''
  },
  stage_3: {
    undertaken: null,
    notUndertakenReasons: [],
    dateOfConsultation: '',
    undertakenBy: null,
    methodOfConsultation: [],
    consultationOutcomes: '',
    consultationNotes: '',
    referralTo: [],
    otherCPCFService: []
  }
  // ...stages 2 and 3...
}

const missingDatasetRequirements = [
  'Patient’s demographic details (including their hospital medical record number)',
  'The meds being used by patient at discharge (including prescribed, OTC & specialist)',
  'Any changes to meds (incl. med started or stopped, or dosage changes) and documented reason for the change',
  'Contact details for the referring clinician or hospital department',
  'Hospital’s Organisation Data Service (ODS) code'
]

const issuesIdentified = ['Discrepancy with medication identified', 'Specific request included in the referral']

const discussedWith = ['GP', 'Hospital', 'PCN clinical pharmacist/practice pharmacist', 'Other']

const DmsForm = () => {
  const [state, setState] = useState(initialState)
  const [stageTabValue, setStageTabValue] = useState(0) // for Stage 1, 2, and 3

  // Handle changes in stage tabs
  const handleStageTabChange = (event, newValue) => {
    setStageTabValue(newValue)
  }

  // Add specific form render functions or components for each stage
  // Placeholder function for rendering stage content
  const renderStageContent = stageNumber => (
    <Box p={2}>
      <Typography variant='h6'>{`Content for Stage ${stageNumber}`}</Typography>
      {/* ...Add your form fields or other content here... */}
    </Box>
  )

  const handleStateChange = (stage, field) => newValue => {
    // Update the state here
    setState(prevState => ({
      ...prevState,
      [stage]: {
        ...prevState[stage],
        [field]: newValue
      }
    }))
  }

  return (
    <Box>
      {/* Tabs for Stage 1, 2, and 3 */}
      <Tabs value={stageTabValue} onChange={handleStageTabChange} centered>
        <Tab label='Stage 1' />
        <Tab label='Stage 2' />
        <Tab label='Stage 3' />
      </Tabs>

      {/* Conditional rendering based on selected stage tab */}
      {stageTabValue === 0 && <StageOneForm stageData={state.stage_1} handleStateChange={handleStateChange} />}
      {stageTabValue === 1 && <StageTwoForm state={state.stage_2} handleStateChange={handleStateChange} />}
      {stageTabValue === 2 && <StageThreeForm state={state.stage_3} handleStateChange={handleStateChange} />}

      {/* ...Additional components for managing different parts of the state... */}
      <Button onClick={() => console.log(state)}>Submit</Button>
    </Box>
  )
}

export default DmsForm

const StageThreeForm = ({ state, handleStateChange }) => {
  return (
    <Box p={2}>
      <Typography variant='h6'>Stage 3 – Patient consultation</Typography>

      {/* Undertaken/Not undertaken section */}
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.undertaken === true}
              onChange={e => handleStateChange('undertaken', e.target.checked ? true : null)}
            />
          }
          label='Undertaken'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.undertaken === false}
              onChange={e => handleStateChange('undertaken', e.target.checked ? false : null)}
            />
          }
          label='Not undertaken'
        />
      </FormGroup>

      {/* If not undertaken, specify reasons */}
      {state.undertaken === false && (
        <CustomSoloCreatable
          data={[
            'Patient deceased',
            'Patient withdrew consent to participate in the service',
            'Patient readmitted to hospital',
            'Patient has chosen to use another pharmacy',
            'Patient or carer not contactable despite reasonable attempts',
            'Other'
          ]}
          label='Reasons for not undertaking'
          values={state.notUndertakenReasons}
          //... other props ...
        />
      )}

      {/* Date of consultation */}
      <TextField
        label='Date of consultation'
        type='date'
        InputLabelProps={{
          shrink: true
        }}
        value={state.dateOfConsultation}
        onChange={e => handleStateChange('dateOfConsultation', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />

      {/* Undertaken by */}
      <CustomSoloCreatable
        data={['Pharmacist', 'Pharmacy Technician']}
        label='Undertaken by'
        values={state.undertakenBy}
        //... other props ...
      />

      {/* Method of consultation */}
      <CustomSoloCreatable
        data={['Telephone consultation', 'In pharmacy consultation', 'Video consultation', 'Home visit']}
        label='Method of consultation'
        values={state.methodOfConsultation}
        //... other props ...
      />

      {/* Consultation outcomes */}
      <TextField
        label='Consultation outcomes'
        multiline
        rows={4}
        value={state.consultationOutcomes}
        onChange={e => handleStateChange('consultationOutcomes', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />

      {/* Consultation notes */}
      <TextField
        label='Consultation notes'
        multiline
        rows={4}
        value={state.consultationNotes}
        onChange={e => handleStateChange('consultationNotes', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />

      {/* Referral to */}
      <CustomSoloCreatable
        data={['GP', 'PCN clinical pharmacist/practice pharmacist', 'Hospital', 'Other']}
        label='Referral to'
        values={state.referralTo}
        //... other props ...
      />

      {/* Other CPCF service provided */}
      <CustomSoloCreatable
        data={['Disposal of unwanted medicines', 'New Medicine Service', 'Healthy lifestyle advice', 'Other']}
        label='Other CPCF service provided'
        values={state.otherCPCFService}
        //... other props ...
      />
    </Box>
  )
}

const StageTwoForm = ({ state, handleStateChange }) => {
  console.log(state, 'STATE')
  return (
    <Box p={2}>
      <Typography variant='h6'>Stage 2 – following receipt of first prescription post-discharge</Typography>

      {/* Undertaken/Not undertaken section */}
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.undertaken === true}
              onChange={e => handleStateChange('undertaken', e.target.checked ? true : null)}
            />
          }
          label='Undertaken'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.undertaken === false}
              onChange={e => handleStateChange('undertaken', e.target.checked ? false : null)}
            />
          }
          label='Not undertaken'
        />
      </FormGroup>

      {/* If not undertaken, specify reasons */}
      {state.undertaken === false && (
        <CustomSoloCreatable
          data={[
            'Patient deceased',
            'Patient withdrew consent to participate in the service',
            'Patient readmitted to hospital',
            'Provided by another community pharmacy',
            'Other'
          ]}
          label='Reasons for not undertaking'
          values={state.notUndertakenReasons}
          //... other props ...
        />
      )}

      {/* Date of first prescription received */}
      <TextField
        label='Date first prescription received'
        type='date'
        InputLabelProps={{
          shrink: true
        }}
        value={state.dateFirstPrescriptionReceived}
        onChange={e => handleStateChange('dateFirstPrescriptionReceived', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />

      {/* Check of first prescription */}
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkOfFirstPrescription}
            onChange={e => handleStateChange('checkOfFirstPrescription', e.target.checked)}
          />
        }
        label='Check of first prescription undertaken'
      />

      {/* Undertaken by */}
      <CustomSoloCreatable
        data={['Pharmacist', 'Pharmacy Technician']}
        label='Undertaken by'
        values={state.undertakenBy}
        //... other props ...
      />

      {/* Issues identified on first prescription */}
      <CustomSoloCreatable
        data={[
          'None – medicines reconciliation completed by the pharmacy',
          'Medicine stopped in hospital still on first prescription',
          //... Add other options ...
          'Other'
        ]}
        label='Issues identified on first prescription'
        values={state.issuesIdentified}
        //... other props ...
      />

      {/* Notes for issues identified */}
      <TextField
        label='Notes for issues identified'
        multiline
        rows={4}
        value={state.issuesNotes}
        onChange={e => handleStateChange('issuesNotes', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />

      {/* Where issues were identified, they were discussed with */}
      <CustomSoloCreatable
        data={['GP', 'PCN clinical pharmacist/practice pharmacist', 'Hospital', 'Other']}
        label='Issues discussed with'
        values={state.discussedWith}
        //... other props ...
      />

      {/* Notes for discussions */}
      <TextField
        label='Notes for discussions'
        multiline
        rows={4}
        value={state.discussedNotes}
        onChange={e => handleStateChange('discussedNotes', e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />
    </Box>
  )
}

const StageOneForm = ({ stageData, onStateChange, field, handleStateChange }) => {
  return (
    <Box p={2}>
      {/* Question 1 */}
      <Typography variant='h6'>1. Did the referral meet the minimum essential dataset requirements?</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.referral_meet_dataset_requirements === true}
              onChange={() => handleStateChange('stage_1', 'referral_meet_dataset_requirements')(true)}
            />
          }
          label='Yes'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.referral_meet_dataset_requirements === false}
              onChange={() => handleStateChange('stage_1', 'referral_meet_dataset_requirements')(false)}
            />
          }
          label='No'
        />
      </FormGroup>

      {/* Conditional Question based on Question 1 */}
      {stageData.referral_meet_dataset_requirements === false && (
        <CustomSoloCreatable
          data={missingDatasetRequirements}
          label='Reasons for missing data'
          values={stageData.missing_data_set_reasons}
          getOptionLabel={option => option || ''}
          // ...other props...
        />
      )}

      {/* Question 3 */}
      <Typography variant='h6'>3. Issues or clinical actions identified:</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.issuesIdentified === true}
              onChange={() => handleStateChange('stage_1', 'issuesIdentified')(true)}
            />
          }
          label='Yes'
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.issuesIdentified === false}
              onChange={() => handleStateChange('stage_1', 'issuesIdentified')(false)}
            />
          }
          label='No'
        />
      </FormGroup>

      {/* Conditional Question based on Question 3 */}
      {stageData.issuesIdentified === true && (
        <>
          <CustomSoloCreatable
            data={issuesIdentified}
            value={stageData.issuesIdentifiedReasons}
            style={{ mb: 2 }}
            label='Issues Identified Reasons'
            onChange={e => handleStateChange('stage_1', 'issuesIdentifiedReasons')(e)}
          />

          <CustomSoloCreatable
            data={discussedWith}
            value={stageData.issuesDiscussedWith}
            label='Issues discussed with'
            getOptionLabel={option => option || ''}
            onChange={e => handleStateChange('stage_1', 'issuesDiscussedWith')(e)}
          />
        </>
      )}

      {/* Question 4 */}
      <Typography variant='h6'>
        3. Check of any previously ordered prescriptions not yet supplied to the patient completed
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.prescriptionCheckCompleted === true}
              onChange={() => handleStateChange('stage_1', 'prescriptionCheckCompleted')(true)}
            />
          }
          label='Yes'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.prescriptionCheckCompleted === false}
              onChange={() => handleStateChange('stage_1', 'prescriptionCheckCompleted')(false)}
            />
          }
          label='No'
        />
      </FormGroup>

      {/* Question 5 */}
      <Typography variant='h6'>
        4. Prescriptions in supply system intercepted to prevent patient receiving inappropriate supply?
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.prescreptionIntercepted === true}
              onChange={() => handleStateChange('stage_1', 'prescreptionIntercepted')(true)}
            />
          }
          label='Yes'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.prescreptionIntercepted === false}
              onChange={() => handleStateChange('stage_1', 'prescreptionIntercepted')(false)}
            />
          }
          label='No Such Prescriptions'
        />
      </FormGroup>

      {/* Question 6 */}
      <Typography variant='h6'>
        5. Follow up note added to patient’s PMR to alert staff to provide subsequent parts of the service?
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.followUpNoteAdded === true}
              onChange={() => handleStateChange('stage_1', 'followUpNoteAdded')(true)}
            />
          }
          label='Yes'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={stageData.followUpNoteAdded === false}
              onChange={() => handleStateChange('stage_1', 'followUpNoteAdded')(false)}
            />
          }
          label='No'
        />
      </FormGroup>

      {/* Additional Notes */}
      <TextField
        label='Additional Notes'
        multiline
        rows={4}
        value={stageData.additionalNotes}
        onChange={e => handleStateChange('stage_1', 'additionalNotes')(e.target.value)}
        variant='outlined'
        fullWidth
        margin='normal'
      />
    </Box>
  )
}
