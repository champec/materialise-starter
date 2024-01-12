import React, { useState, useEffect } from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Checkbox, Button } from '@mui/material'

const UTIForm = ({ state, setState, onServiceUpdate }) => {
  const [formState, setFormState] = useState({
    riskOfDeterioration: '',
    signsOfPyelonephritis: { kidneyPain: false, myalgia: false, chillsOrFever: false, nauseaOrVomiting: false },
    otherFactors: {
      vaginalDischarge: false,
      urethritis: false,
      sexualHistory: false,
      pregnancy: false,
      menopause: false,
      immunosuppressed: false
    },
    keyDiagnosticSigns: { dysuria: false, nocturia: false, cloudyUrine: false },
    otherUrinarySymptoms: { urgency: false, frequency: false, haematuria: false, suprapubicPain: false },
    treatmentDecision: '',
    symptomSeverity: '',
    rapidWorsening: false
  })

  // if state is not an empty object, set the form state to the state passed in
  useEffect(() => {
    if (Object.keys(state.pathwayform).length !== 0) {
      setFormState(state.pathwayform)
    }
  }, [])

  useEffect(() => {
    setState({ ...state, pathwayform: formState })
  }, [formState])

  const handleInputChange = (event, group) => {
    const { name, value, checked } = event.target
    if (group) {
      setFormState(prevState => ({
        ...prevState,
        [group]: { ...prevState[group], [name]: checked }
      }))
    } else {
      setFormState({ ...formState, [name]: value })
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    // console.log('UTI FORM STATE', formState)

    // Submit logic here and formstate to state
    // setState({ ...state, pathwayform: formState })
    onServiceUpdate({ ...state, pathwayform: formState })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl component='fieldset'>
        <FormLabel component='legend'>Urinary Signs and Symptoms</FormLabel>
        <RadioGroup
          name='riskOfDeterioration'
          value={formState.riskOfDeterioration}
          onChange={e => handleInputChange(e)}
        >
          <FormControlLabel value='yes' control={<Radio />} label='Yes - Consider calculating NEWS2 Score' />
          <FormControlLabel value='no' control={<Radio />} label='No - Check for signs/symptoms of PYELONEPHRITIS' />
        </RadioGroup>

        {formState.riskOfDeterioration === 'no' && (
          <>
            <FormLabel component='legend'>Check for any new signs/symptoms of PYELONEPHRITIS:</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.signsOfPyelonephritis.kidneyPain}
                  onChange={e => handleInputChange(e, 'signsOfPyelonephritis')}
                  name='kidneyPain'
                />
              }
              label='Kidney pain/tenderness in back under ribs'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.signsOfPyelonephritis.myalgia}
                  onChange={e => handleInputChange(e, 'signsOfPyelonephritis')}
                  name='myalgia'
                />
              }
              label='New/different myalgia, flu like illness'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.signsOfPyelonephritis.chillsOrFever}
                  onChange={e => handleInputChange(e, 'signsOfPyelonephritis')}
                  name='chillsOrFever'
                />
              }
              label='Shaking chills (rigors) or temperature 37.9°C or above'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.signsOfPyelonephritis.nauseaOrVomiting}
                  onChange={e => handleInputChange(e, 'signsOfPyelonephritis')}
                  name='nauseaOrVomiting'
                />
              }
              label='Nausea/vomiting'
            />

            {/* Other Factors */}
            <FormLabel component='legend'>Does the patient have ANY of the following:</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherFactors.vaginalDischarge}
                  onChange={e => handleInputChange(e, 'otherFactors')}
                  name='vaginalDischarge'
                />
              }
              label='Vaginal discharge: 80% do not have UTI (treat over the counter if signs and symptoms of thrush)'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherFactors.urethritis}
                  onChange={e => handleInputChange(e, 'otherFactors')}
                  name='urethritis'
                />
              }
              label='Urethritis: inflammation post sexual intercourse, irritants'
            />
            {/* Additional checkboxes for sexual history, pregnancy, menopause, immunosuppressed */}

            {/* Key Diagnostic Signs */}
            <FormLabel component='legend'>Key Diagnostic Signs/Symptoms:</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.keyDiagnosticSigns.dysuria}
                  onChange={e => handleInputChange(e, 'keyDiagnosticSigns')}
                  name='dysuria'
                />
              }
              label='Dysuria (burning pain when passing urine)'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.keyDiagnosticSigns.nocturia}
                  onChange={e => handleInputChange(e, 'keyDiagnosticSigns')}
                  name='nocturia'
                />
              }
              label='New nocturia (needing to pass urine in the night)'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.keyDiagnosticSigns.cloudyUrine}
                  onChange={e => handleInputChange(e, 'keyDiagnosticSigns')}
                  name='cloudyUrine'
                />
              }
              label='Urine cloudy to the naked eye'
            />

            {/* Other Urinary Symptoms */}
            <FormLabel component='legend'>Other Urinary Symptoms:</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherUrinarySymptoms.urgency}
                  onChange={e => handleInputChange(e, 'otherUrinarySymptoms')}
                  name='urgency'
                />
              }
              label='Urgency'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherUrinarySymptoms.frequency}
                  onChange={e => handleInputChange(e, 'otherUrinarySymptoms')}
                  name='frequency'
                />
              }
              label='Frequency'
            />
            {/* Additional checkboxes for haematuria, suprapubic pain */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherUrinarySymptoms.haematuria}
                  onChange={e => handleInputChange(e, 'otherUrinarySymptoms')}
                  name='haematuria'
                />
              }
              label='Visible haematuria'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.otherUrinarySymptoms.suprapubicPain}
                  onChange={e => handleInputChange(e, 'otherUrinarySymptoms')}
                  name='suprapubicPain'
                />
              }
              label='Suprapubic pain/tenderness'
            />

            {/* Treatment Decision */}
            <FormLabel component='legend'>Treatment Decision:</FormLabel>
            <RadioGroup
              name='treatmentDecision'
              value={formState.treatmentDecision}
              onChange={e => handleInputChange(e)}
            >
              <FormControlLabel value='noSymptom' control={<Radio />} label='No Symptom' />
              <FormControlLabel value='oneSymptom' control={<Radio />} label='1 Symptom' />
              <FormControlLabel value='twoOrThreeSymptoms' control={<Radio />} label='2 or 3 symptoms' />
            </RadioGroup>

            {/* Symptom Severity */}
            {formState.treatmentDecision === 'twoOrThreeSymptoms' && (
              <div>
                <FormLabel component='legend'>Symptom Severity:</FormLabel>
                <RadioGroup
                  name='symptomSeverity'
                  value={formState.symptomSeverity}
                  onChange={e => handleInputChange(e)}
                >
                  <FormControlLabel
                    value='mild'
                    control={<Radio />}
                    label='Mild - Consider pain relief and self-care'
                  />
                  <FormControlLabel
                    value='moderateToSevere'
                    control={<Radio />}
                    label='Moderate to Severe - Offer nitrofurantoin for 3 days'
                  />
                </RadioGroup>
              </div>
            )}

            {/* Rapid Worsening */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.rapidWorsening}
                  onChange={e => handleInputChange(e)}
                  name='rapidWorsening'
                />
              }
              label='If symptoms worsen rapidly or significantly at any time, or do not improve in 48 hours of taking antibiotics - Onward referral'
            />
          </>
        )}

        <Button type='submit' variant='contained' color='primary'>
          Submit
        </Button>
      </FormControl>
    </form>
  )
}

export default UTIForm
