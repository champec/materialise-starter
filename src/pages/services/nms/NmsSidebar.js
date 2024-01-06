import React, { useState } from 'react'
import { Box, Tabs, Tab, Typography, TextField, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material'
import CustomSoloCreatable from './CustomSoloCreatable'
// Define initial state structure
const initialState = {
  intervention: {
    during_survey: {
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      question_6: '',
      question_7: '',
      question_8: ''
    },
    post_survey: {
      matters_identified: [],
      outcomes_provided: {
        advise_provided: [],
        information_provided: [],
        agreed_actions: [],
        actions_by_pharmacist: []
      },
      lifestyle_advise: []
    }
  },
  follow_up: {
    during_survey: {
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      question_6: '',
      question_7: '',
      question_8: ''
    },
    post_survey: {
      matters_identified: [],
      outcomes_provided: {
        advise_provided: [],
        information_provided: [],
        agreed_actions: [],
        actions_by_pharmacist: []
      },
      lifestyle_advise: []
    }
  },
  cancelled: { state: false, date: new Date(), reason: '', stage: '' },
  referral: { state: false, date: new Date(), reason: '', stage: '' },
  failed_contact: { dateTime: null, number_of_attempts: null, reason: null },
  notes: '',
  completed: {
    intervention: {
      dateTime: null,
      status: null
    },
    follow_up: {
      dateTime: null,
      status: null
    },
    overall_status: false
  }
}

const actionsTakenByPharmacist = [
  'Referral (record details below)',
  'Yellow card report submitted to MHRA',
  'Reminder chart / MAR chart provided',
  'Other (record detail in ‘Other notes’)'
]

const agreedPatientActions = [
  'Carry on using medicine as prescribed',
  'Submit Yellow Card report to MHRA',
  'Use medicine as agreed during the intervention',
  'Other (record detail in ‘Other notes’)'
]

const informationProvided = [
  'Interactions with other medicines',
  'Correct dose of the medicine',
  'Timing of the dose',
  'Why am I using the medicine / what is it for?',
  'Effects of the medicine on the body / how it works',
  'Interpretation of side effect information',
  'How to use the medicine',
  'Why should I take the medicine?'
]

const adviceProvided = [
  'Reminder strategies to support use of medicine',
  'How to manage or minimise side effects',
  'Change to timing of doses to support adherence',
  'CONFIDENTIAL'
]

const combinedOutcomes = [
  ...actionsTakenByPharmacist.map(value => ({ category: 'Actions Taken By Pharmacist', value })),
  ...agreedPatientActions.map(value => ({ category: 'Agreed Patient Actions', value })),
  ...informationProvided.map(value => ({ category: 'Information Provided', value })),
  ...adviceProvided.map(value => ({ category: 'Advice Provided', value }))
]

// Intervention Questions
const interventionQuestions = [
  'Have you had the chance to start taking your new medicine yet?',
  'How are you getting on with it?',
  'Are you having any problems with your new medicine, or concerns about taking it?',
  'Do you think it is working? (Prompt: is this different from what you were expecting?)',
  'Do you think you are getting any side effects or unexpected effects?',
  'People often miss taking doses of their medicines, for a wide range of reasons. Have you missed any doses of your new medicine, or changed when you take it? (Prompt: when did you last miss a dose?)',
  'Do you have anything else you would like to know about your new medicine or is there anything you would like me to go over again?'
]

// Follow-up Questions
const followUpQuestions = [
  'How have you been getting on with your new medicine since we last spoke? (Prompt: are you still taking it?)',
  'Last time we spoke, you mentioned a few issues you’d been having with your new medicine. Shall we go through each of these and see how you’re getting on?',
  'A) The first issue you mentioned was [refer to specific issue] – is that correct? B) Did you try [the advice / solution recommended at the previous contact] to help with this issue?',
  'Did you try anything else?',
  'Did this help? (Prompt: how did it help?)',
  'Is this still a problem or concern? Repeat Questions 3-6 for each issue that the patient discussed at the Intervention stage',
  'Have there been any other problems / concerns with your new medicine since we last spoke?',
  'People often miss taking doses of their medicines, for a wide range of reasons. Since we last spoke, have you missed any doses of your new medicine, or changed when you take it? (Prompt: when did you last miss a dose?)'
]

const referralReasons = [
  'Drug interaction(s)',
  'Potential side effect(s) / ADR preventing use of medicine',
  'Patient reports: Not using medicine any more',
  'Difficulty using the medicine – issue with device',
  'Lack of efficacy',
  'Unresolved concern about the use of the medicine',
  'Never having started using medicine',
  'Difficulty using the medicine – issue with formulation',
  'Problem with dosage regimen',
  'Other issue (detail below)'
]

const cancellationReasons = [
  'Intervention not undertaken due to: Prescriber has stopped the new medicine',
  'Patient has withdrawn consent to receive the service',
  'Patient has withdrawn consent for information sharing',
  'Patient could not be contacted',
  'Other (record detail in ‘Other notes’ below)'
]

const lifeStyleAdvise = [
  'Smoking cessation',
  'Alcohol consumption',
  'Physical activity',
  'Healthy eating',
  'Weight management',
  'Mental wellbeing',
  'Sexual health'
]

const mattersIdentified = [
  'Using the medicine as prescribed',
  'Not using the medicine as prescribed',
  'Not having started using the medicine',
  'Not using the medicine in line with the directions of the prescriber',
  'Prescriber has stopped the new medicine',
  'Missing a dose in the past 7 days',
  'Need for more information about the medicine',
  'Negative feelings about the medicine',
  'Concern about remembering to take the medicine',
  'Other (record detail in ‘Other notes’ overleaf)',
  'Side effects',
  'Uncertainty on whether the medicine is working',
  'Difficulty using the medicine due to its pharmaceutical form/formulation'
]

const NmsForm = ({ state, setState, onSubmit }) => {
  // const [state, setState] = useState(initialState)
  const [stageTabValue, setStageTabValue] = useState(0) // for Intervention and Follow-up
  const [partTabValue, setPartTabValue] = useState(0) // for During and Post Survey

  // Handle changes in stage tabs
  const handleStageTabChange = (event, newValue) => {
    setStageTabValue(newValue)
  }

  // Handle changes in part tabs (During/Post Survey)
  const handlePartTabChange = (event, newValue) => {
    setPartTabValue(newValue)
  }

  // Handle changes in text fields for During Survey Questions
  const handleDuringSurveyChange = (stage, question) => event => {
    setState(prevState => ({
      ...prevState,
      [stage]: {
        ...prevState[stage],
        during_survey: {
          ...prevState[stage].during_survey,
          [question]: event.target.value
        }
      }
    }))
  }

  const handleMattersIdentifiedChange = (stage, newValue) => {
    setState(prevState => ({
      ...prevState,
      [stage]: {
        ...prevState[stage],
        post_survey: {
          ...prevState[stage].post_survey,
          matters_identified: newValue
        }
      }
    }))
  }

  const toggleReferralStatus = () => {
    setState(prevState => ({
      ...prevState,
      referral: {
        ...prevState.referral,
        state: !prevState.referral.state // toggle the current state
      }
    }))
  }

  const handleRefferalReasonChange = (stage, newValue) => {
    setState(prevState => ({
      ...prevState,
      referral: {
        ...prevState.referral,
        reason: newValue
      }
    }))
  }

  const handleCancellationReasonChange = (stage, newValue) => {
    setState(prevState => ({
      ...prevState,
      cancelled: {
        ...prevState.cancelled,
        reason: newValue
      }
    }))
  }

  const toggleCancellationStatus = () => {
    setState(prevState => ({
      ...prevState,
      cancelled: {
        ...prevState.cancelled,
        state: !prevState.cancelled.state // toggle the current state
      }
    }))
  }

  const handleOutcomesProvidedChange = (stage, newValue) => {
    // Create a new structure for outcomes_provided based on the categories in newValue
    const newOutcomesProvided = {
      advise_provided: [],
      information_provided: [],
      agreed_actions: [],
      actions_by_pharmacist: []
    }

    // Categorize each item in newValue and add it to the appropriate array in newOutcomesProvided
    newValue.forEach(item => {
      switch (item.category) {
        case 'Advice Provided':
          newOutcomesProvided.advise_provided.push(item.value)
          break
        case 'Information Provided':
          newOutcomesProvided.information_provided.push(item.value)
          break
        case 'Agreed Patient Actions':
          newOutcomesProvided.agreed_actions.push(item.value)
          break
        case 'Actions Taken By Pharmacist':
          newOutcomesProvided.actions_by_pharmacist.push(item.value)
          break
        // Add cases for other categories if necessary
      }
    })

    // Update the state with the new categorized values
    setState(prevState => ({
      ...prevState,
      [stage]: {
        ...prevState[stage],
        post_survey: {
          ...prevState[stage].post_survey,
          outcomes_provided: newOutcomesProvided
        }
      }
    }))
  }

  const handleLifestyleAdviseChange = (stage, newValue) => {
    setState(prevState => ({
      ...prevState,
      [stage]: {
        ...prevState[stage],
        post_survey: {
          ...prevState[stage].post_survey,
          lifestyle_advise: newValue
        }
      }
    }))
  }

  const renderAdditionalComponents = stage => {
    return (
      <Box p={2}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={state.referral.state} onChange={toggleReferralStatus} />}
            label='Referral'
          />
          {state.referral.state && ( // Show this only if referral is true
            <CustomSoloCreatable
              data={referralReasons.map(reason => ({ category: 'Referral', value: reason }))}
              label='Referral Reasons'
              // style={{ width: 300 }}
              onChange={newValue => handleRefferalReasonChange(stage, newValue)}
              renderOption={(props, option) => (
                <li {...props}>{option.value}</li> // Render the value of the option
              )}
              getOptionLabel={option => option.value || ''} // Make sure to use the value for display
              value={state[stage].post_survey.referral_reasons} // Update with your state structure
            />
          )}
          <FormControlLabel
            control={<Checkbox checked={state.cancelled.state} onChange={toggleCancellationStatus} />}
            label='Cancellation'
          />
          {state.cancelled.state && ( // Show this only if cancellation is true
            <CustomSoloCreatable
              data={cancellationReasons.map(reason => ({ category: 'Cancellation', value: reason }))}
              label='Cancellation Reasons'
              // style={{ width: 300 }}
              onChange={newValue => handleCancellationReasonChange(stage, newValue)}
              renderOption={(props, option) => (
                <li {...props}>{option.value}</li> // Render the value of the option
              )}
              getOptionLabel={option => option.value || ''} // Make sure to use the value for display
              value={state[stage].post_survey.cancellation_reasons} // Update with your state structure
            />
          )}
        </FormGroup>
      </Box>
    )
  }

  // Render the During Survey Section with questions
  const renderDuringSurveySection = (stage, questions) => (
    <Box p={2}>
      <Typography variant='h6'>{`${stage.charAt(0).toUpperCase() + stage.slice(1)} - During Call`}</Typography>
      {questions.map((question, index) => (
        <>
          <Typography variant='body1'>{question}</Typography>
          <TextField
            key={`${stage}-during_survey-question-${index + 1}`}
            label={`Question ${index + 1}`}
            variant='outlined'
            fullWidth
            margin='normal'
            multiline
            rows={2}
            placeholder={question}
            value={state[stage].during_survey[`question_${index + 1}`]}
            onChange={handleDuringSurveyChange(stage, `question_${index + 1}`)}
          />
        </>
      ))}
    </Box>
  )

  // Render the Post Survey Section with dynamic parts
  const renderPostSurveySection = stage => (
    <Box p={2}>
      {/* Wrap each CustomSoloCreatable with Box for padding and full width */}
      <Box mb={2}>
        <Typography variant='h6' mb={2}>{`${stage} - Post Call`}</Typography>
        {/* Margin bottom for spacing between components */}
        <CustomSoloCreatable
          data={lifeStyleAdvise} // predefined options
          label='Lifestyle Advice'
          fullWidth // Set full width
          onChange={newValue => handleLifestyleAdviseChange(stage, newValue)}
          value={state[stage].post_survey.lifestyle_advise}
        />
      </Box>
      <Box mb={2}>
        <CustomSoloCreatable
          data={mattersIdentified} // predefined options
          label='Matters Identified'
          fullWidth // Set full width
          onChange={newValue => handleMattersIdentifiedChange(stage, newValue)}
          value={state[stage].post_survey.matters_identified}
        />
      </Box>
      <Box mb={2}>
        <CustomSoloCreatable
          data={combinedOutcomes} // predefined options
          label='Outcomes Provided'
          fullWidth // Set full width
          onChange={newValue => handleOutcomesProvidedChange(stage, newValue)}
          value={[
            ...state[stage].post_survey.outcomes_provided.actions_by_pharmacist.map(item => ({
              category: 'Actions Taken By Pharmacist',
              value: item
            })),
            ...state[stage].post_survey.outcomes_provided.agreed_actions.map(item => ({
              category: 'Agreed Patient Actions',
              value: item
            })),
            ...state[stage].post_survey.outcomes_provided.information_provided.map(item => ({
              category: 'Information Provided',
              value: item
            })),
            ...state[stage].post_survey.outcomes_provided.advise_provided.map(item => ({
              category: 'Advice Provided',
              value: item
            }))
          ]}
          getOptionLabel={option => option.value || ''} // Make sure to use the value for display
          groupBy={option => option.category}
          renderOption={(props, option) => (
            <li {...props}>{option.value}</li> // Render the value of the option
          )}
        />
      </Box>
      {/* Typography and Additional Components can also be spaced with Box if needed */}
      {renderAdditionalComponents(stage)}
    </Box>
  )

  return (
    <Box>
      {/* Tabs for Intervention and Follow-up */}
      <Tabs value={stageTabValue} onChange={handleStageTabChange} centered>
        <Tab label='Intervention' />
        <Tab label='Follow-up' />
      </Tabs>

      {/* Tabs for During Survey and Post Survey */}
      <Tabs value={partTabValue} onChange={handlePartTabChange} centered>
        <Tab label='During Call' />
        <Tab label='Post Call' />
      </Tabs>

      {/* Conditional rendering based on selected tabs */}
      {stageTabValue === 0 && // Intervention Stage
        (partTabValue === 0
          ? renderDuringSurveySection('intervention', interventionQuestions)
          : renderPostSurveySection('intervention'))}
      {stageTabValue === 1 && // Follow-up Stage
        (partTabValue === 0
          ? renderDuringSurveySection('follow_up', followUpQuestions)
          : renderPostSurveySection('follow_up'))}

      {/* ...Additional components for managing different parts of the state... */}
      <Button variant='contained' color='primary' onClick={onSubmit}>
        Submit
      </Button>
    </Box>
  )
}

export default NmsForm
