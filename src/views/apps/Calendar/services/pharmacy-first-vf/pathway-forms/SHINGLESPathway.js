import React, { useState } from 'react'
import { TextField, Checkbox, FormControlLabel, Button, LinearProgress, Typography, Divider } from '@mui/material'

const initialState = {
  patientAge: null,
  pregnancyStatus: null,
  seriousComplications: {
    meningitis: false,
    encephalitis: false,
    myelitis: false,
    facialNerveParalysis: false
  },
  ophthalmicShingles: {
    hutchinsonsSign: false,
    visualSymptoms: false,
    redEye: false
  },
  immunosuppression: {
    severeCase: false,
    immunosuppressedPatient: false
  },
  typicalProgression: {
    skinSensationAndPain: false,
    rashAppearance: false,
    feverOrHeadache: false,
    blisters: false,
    dermatomalDistribution: false
  },
  shinglesDiagnosis: {
    within72Hours: null,
    criteriaMet: false,
    criteria: {
      immunosuppressed: false,
      nonTruncalInvolvement: false,
      moderateOrSeverePain: false,
      moderateOrSevereRash: false
    },
    treatmentOptions: {
      aciclovir: false,
      valaciclovir: false
    }
  },
  alternativeDiagnosis: false,
  referralNeeded: false,
  selfCareAdvice: false
}

function ShinglesPathwayForm() {
  const [state, setState] = useState(initialState) // initialState defined earlier

  const handleChange = event => {
    // Update state based on input changes
    // You'll need to handle nested state updates accordingly
  }

  const handleSubmit = event => {
    event.preventDefault()
    // Handle form submission
  }

  const calculateCompletion = () => {
    // Logic to calculate form completion percentage
  }

  return (
    <form onSubmit={handleSubmit}>
      <LinearProgress variant='determinate' value={calculateCompletion()} />

      {/* Patient Basic Information */}
      <Typography variant='h6'>Includes Adults over 18 - Excludes pregnant individuals </Typography>
      <Divider />
      <FormControlLabel
        control={<Checkbox onChange={handleChange} checked={state.patientAge} />}
        label='Meets age requirement'
        value={state.patientAge}
      />
      <FormControlLabel
        control={<Checkbox checked={state.pregnancyStatus} onChange={handleChange} />}
        label='Pregnant'
      />

      {/* Serious Complications Check */}
      <Typography variant='h6'>Serious Complications</Typography>
      <Divider />
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.seriousComplications.meningitis}
              onChange={event =>
                setState({
                  ...state,
                  seriousComplications: {
                    ...state.seriousComplications,
                    meningitis: event.target.checked
                  }
                })
              }
            />
          }
          label='Meningitis (neck stiffness, photophobia, mottled skin)'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.seriousComplications.encephalitis}
              onChange={event =>
                setState({
                  ...state,
                  seriousComplications: {
                    ...state.seriousComplications,
                    encephalitis: event.target.checked
                  }
                })
              }
            />
          }
          label='Encephalitis (disorientation, changes in behaviour)'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.seriousComplications.myelitis}
              onChange={event =>
                setState({
                  ...state,
                  seriousComplications: {
                    ...state.seriousComplications,
                    myelitis: event.target.checked
                  }
                })
              }
            />
          }
          label='Myelitis (muscle weakness, loss of bladder or bowel control)'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.seriousComplications.facialNerveParalysis}
              onChange={event =>
                setState({
                  ...state,
                  seriousComplications: {
                    ...state.seriousComplications,
                    facialNerveParalysis: event.target.checked
                  }
                })
              }
            />
          }
          label='Facial nerve paralysis (typically unilateral) (Ramsay Hunt)'
        />
      </div>

      {/* Shingles in the Ophthalmic Distribution */}
      <Typography variant='h6'>Shingles in the Ophthalmic Distribution</Typography>
      <Divider />
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.ophthalmicShingles.hutchinsonsSign}
              onChange={event =>
                setState({
                  ...state,
                  ophthalmicShingles: {
                    ...state.ophthalmicShingles,
                    hutchinsonsSign: event.target.checked
                  }
                })
              }
            />
          }
          label="Hutchinson's sign — a rash on the tip, side, or root of the nose"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.ophthalmicShingles.visualSymptoms}
              onChange={event =>
                setState({
                  ...state,
                  ophthalmicShingles: {
                    ...state.ophthalmicShingles,
                    visualSymptoms: event.target.checked
                  }
                })
              }
            />
          }
          label='Visual symptoms'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.ophthalmicShingles.redEye}
              onChange={event =>
                setState({
                  ...state,
                  ophthalmicShingles: {
                    ...state.ophthalmicShingles,
                    redEye: event.target.checked
                  }
                })
              }
            />
          }
          label='Unexplained red eye'
        />
      </div>

      {/* Immunosuppression Status */}
      <Typography variant='h6'>Immunosuppression Status</Typography>
      <Divider />
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.immunosuppression.severeCase}
              onChange={event =>
                setState({
                  ...state,
                  immunosuppression: {
                    ...state.immunosuppression,
                    severeCase: event.target.checked
                  }
                })
              }
            />
          }
          label='Shingles in severely immunosuppressed patient'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.immunosuppression.immunosuppressedPatient}
              onChange={event =>
                setState({
                  ...state,
                  immunosuppression: {
                    ...state.immunosuppression,
                    immunosuppressedPatient: event.target.checked
                  }
                })
              }
            />
          }
          label='Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell'
        />
      </div>

      {/* Typical Progression of Shingles */}
      <Typography variant='h6'>Typical Progression of Shingles</Typography>
      <Divider />
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.typicalProgression.skinSensationAndPain}
              onChange={event =>
                setState({
                  ...state,
                  typicalProgression: {
                    ...state.typicalProgression,
                    skinSensationAndPain: event.target.checked
                  }
                })
              }
            />
          }
          label='First signs of shingles are an abnormal skin sensation and pain in the affected area which can be described as burning, stabbing, throbbing, itching, tingling and can be intermittent or constant.'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.typicalProgression.rashAppearance}
              onChange={event =>
                setState({
                  ...state,
                  typicalProgression: {
                    ...state.typicalProgression,
                    rashAppearance: event.target.checked
                  }
                })
              }
            />
          }
          label='The rash usually appears within 2-3 days after the onset of pain, and a fever and or a headache may develop.'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.typicalProgression.blisters}
              onChange={event =>
                setState({
                  ...state,
                  typicalProgression: {
                    ...state.typicalProgression,
                    blisters: event.target.checked
                  }
                })
              }
            />
          }
          label='Shingles rash appears as a group of red spots on a pink-red background which quickly turn into small fluid-filled blisters.'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.typicalProgression.dermatomalDistribution}
              onChange={event =>
                setState({
                  ...state,
                  typicalProgression: {
                    ...state.typicalProgression,
                    dermatomalDistribution: event.target.checked
                  }
                })
              }
            />
          }
          label='Shingles rash usually covers a well-defined area of skin on one side of the body only (right or left) and will not cross to the other side of the body, in a dermatomal distribution.'
        />
        {/* Add more checkboxes if needed for other symptoms */}
      </div>

      {/* Shingles Diagnosis */}
      <Typography variant='h6'>Shingles Diagnosis</Typography>
      <Divider />
      {state.typicalProgression.skinSensationAndPain && state.typicalProgression.rashAppearance && (
        <div>
          <p>Shingles more likely - Does the patient have shingles within 72 hours of rash onset?</p>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.shinglesDiagnosis.within72Hours}
                onChange={event =>
                  setState({
                    ...state,
                    shinglesDiagnosis: {
                      ...state.shinglesDiagnosis,
                      within72Hours: event.target.checked
                    }
                  })
                }
              />
            }
            label='Yes'
          />

          {/* Criteria Check if shingles diagnosis within 72 hours is confirmed */}
          {state.shinglesDiagnosis.within72Hours && (
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.criteria.immunosuppressed}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          criteria: {
                            ...state.shinglesDiagnosis.criteria,
                            immunosuppressed: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Immunosuppressed'
              />
              {/* Add more checkboxes for other criteria like non-truncal involvement, moderate/severe pain, etc. */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.criteria.nonTruncalInvolvement}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          criteria: {
                            ...state.shinglesDiagnosis.criteria,
                            nonTruncalInvolvement: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Non-truncal involvement (shingles affecting the neck, limbs, or perineum)'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.criteria.moderateOrSeverePain}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          criteria: {
                            ...state.shinglesDiagnosis.criteria,
                            moderateOrSeverePain: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Moderate or severe pain'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.criteria.moderateOrSevereRash}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          criteria: {
                            ...state.shinglesDiagnosis.criteria,
                            moderateOrSevereRash: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Moderate or severe rash (defined as confluent lesions)'
              />
            </div>
          )}

          {/* Offer treatment options based on the criteria met */}
          {Object.values(state.shinglesDiagnosis.criteria).some(value => value) && (
            <div>
              <p>Offer treatment options based on criteria met</p>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.treatmentOptions.aciclovir}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          treatmentOptions: {
                            ...state.shinglesDiagnosis.treatmentOptions,
                            aciclovir: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Offer Aciclovir'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.shinglesDiagnosis.treatmentOptions.valaciclovir}
                    onChange={event =>
                      setState({
                        ...state,
                        shinglesDiagnosis: {
                          ...state.shinglesDiagnosis,
                          treatmentOptions: {
                            ...state.shinglesDiagnosis.treatmentOptions,
                            valaciclovir: event.target.checked
                          }
                        }
                      })
                    }
                  />
                }
                label='Offer Valaciclovir'
              />
            </div>
          )}
        </div>
      )}

      {/* If the typical progression symptoms are not met, suggest alternative diagnosis */}
      {!(state.typicalProgression.skinSensationAndPain && state.typicalProgression.rashAppearance) && (
        <div>
          <p>Shingles less likely, consider alternative diagnosis</p>
        </div>
      )}

      {/* Treatment Options */}
      {/* Logic to display this section based on previous inputs */}

      {/* Alternative Diagnosis */}
      {/* Logic to display this section based on previous inputs */}

      {/* Referral and Self-Care Advice */}
      <Typography variant='h6'>Referral and Self-Care Advice</Typography>
      <Divider />
      <div>
        <p>Referral and Self-Care Advice:</p>

        {/* Advice for all patients regardless of diagnosis */}
        <div>
          <p>For all patients:</p>
          <p>
            If symptoms worsen rapidly or significantly at any time, or do not improve after completion of a 7-day
            treatment course, refer to General Practice or another provider as appropriate.
          </p>
          <p>
            Share self-care and safety-netting advice using the British Association of Dermatologists Shingles leaflet.
          </p>
          <p>
            For pain management, recommend a trial of paracetamol, a NSAID such as ibuprofen, or co-codamol over the
            counter. If this is not effective, refer the patient to general practice.
          </p>
          <p>
            Signpost eligible individuals to information and advice about receiving the shingles vaccine after they have
            recovered from this episode of shingles.
          </p>
        </div>

        {/* Additional advice for immunosuppressed patients */}
        <Typography variant='h6'>Additional advice for immunosuppressed patients</Typography>
        <div>
          <p>For immunosuppressed patients:</p>
          <p>
            Offer treatment if appropriate and call the patient’s GP or send an urgent email for action if out of hours
            to notify the supply of antiviral and request review by GP.
          </p>
          <p>
            Advise the patient, if your symptoms worsen rapidly or if you become systemically unwell or the rash becomes
            severe or widespread - attend A&E or call 999.
          </p>
        </div>

        {/* Logic for additional specific advice based on other inputs */}
      </div>

      <Button type='submit'>Submit</Button>
    </form>
  )
}

export default ShinglesPathwayForm
