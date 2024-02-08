export const shinglesDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Shingles',
  icon: 'medical-icon:i-internal-medicine',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Shingles (herpes zoster) infection in adults aged 18 years and over.`,
  useful_links: [
    {
      text: 'NICE Clinical Knowledge Summary',
      link: 'https://cks.nice.org.uk/topics/shingles/diagnosis/diagnosis/'
    },
    {
      text: 'Supply of Aciclovir',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-2a.-Shingles-aciclovir-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of valaciclovir',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-2b.-Shingles-valaciclovir-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

shinglesDecisionTree.nodes = {
  root: {
    /* Same as the initial object defined above */
    ...shinglesDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    icon: 'oui:list-add',
    content: 'Please confirm the patient meets the criteria for inclusion to the Shingles pathway:',
    criteria: [
      { text: 'The patient is aged 18 years or older.', required: true },
      { text: 'Informed consent ', required: true },
      {
        text: 'The patient has not received antiviral treatment for shingles in the last 6 months.',
        required: true
      },
      {
        text: 'The patient is not immunosuppressed or has no history of severe immunosuppression.',
        required: true
      },
      {
        text: 'The patient is not pregnant or breastfeeding.',
        required: true
      },
      {
        text: 'You will: Diagnose shingles using the appropriate NICE guidance.',
        required: true
      }
    ],
    allOption: {
      text: 'All of the above', // This option, when selected, will select all other options and vice versa
      action: 'tickAll' // Indicates the action to be taken when this option is selected
    },
    noneOption: {
      text: 'None of the above', // This option, when selected, will deselect all other options and vice versa
      action: 'untickAll' // Indicates the action to be taken when this option is selected
    },
    passResponse:'Yes',
    minRequired: 3, // Specifies the minimum number of checkboxes (excluding the 'None' option) that need to be ticked to proceed
    nextNodeIdIfPassed: 'risk_assessment',
    nextNodeIdIfFailed: 'exclusion_criteria_met',
    previousNodeId: 'root' // Assuming the root node is the direct predecessor
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Shingles pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_options',
    previousNodeId: 'criteria_confirmation'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'symptoms',
    componentType: 'criteriaChecklist',
    content:
      'Consider the risk of deterioration or serious illness. Check for serious complications such as Meningitis, Encephalitis, Myelitis, Facial nerve paralysis, or Shingles in specific conditions. Select "None" if no serious complications are suspected.',
    symptoms: [
      { text: 'Meningitis (neck stiffness, photophobia, mottled skin)', required: false },
      { text: 'Encephalitis (disorientation, changes in behaviour)', required: false },
      { text: 'Myelitis (muscle weakness, loss of bladder or bowel control)', required: false },
      { text: 'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)', required: false },
      {
        text: "Shingles in the ophthalmic distribution (Hutchinson's sign, visual symptoms, unexplained red eye)",
        required: false
      },
      { text: 'Shingles in severely immunosuppressed patient', required: false },
      {
        text: 'Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell',
        required: false
      }
    ],
    noneOption: {
      text: 'None of the above', // This option, when selected, will deselect all other options and vice versa
      action: 'untickAll' // Indicates the action to be taken when this option is selected
    },
    passResponse:'No',
    minRequired: 0, // Minimum number of criteria that must be selected for the node to be considered passed
    nextNodeIdIfNo: 'clinical_features_check',
    nextNodeIdIfYes: 'emergency_referral',
    previousNodeId: 'criteria_confirmation'
  },
  emergency_referral: {
    id: 'emergency_referral',
    type: 'stop',
    content:
      'Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_options',
    previousNodeId: 'risk_assessment'
  },
  clinical_features_check: {
    id: 'clinical_features_check',
    type: 'countBased',
    componentType: 'criteriaChecklist',
    title: 'Clinical Features Check',
    content:
      'Does the patient follow the typical progression of Shingles clinical features? Refer to NHS.UK for images of Shingles.',
    questions: [
      { text: 'Abnormal skin sensation and pain in the affected area', required: true },
      { text: 'Rash appears within 2-3 days after the onset of pain', required: true },
      { text: 'Fever and/or headache may develop', required: false },
      { text: 'Rash turns into small fluid-filled blisters', required: true },
      { text: 'Blisters burst, others fill with blood or pus, then crusts and scabs form', required: false },
      { text: 'Rash covers a well-defined area of skin on one side of the body only', required: true }
    ],
    answers: [
      { text: 'Yes, typical features of Shingles', action: 'treatment_criteria_check' },
      { text: 'No, Shingles less likely', action: 'alternative_diagnosis' }
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    countOption:'Yes',
    countText: 'Typical features',
    nextNodeMap: {
      0: 'alternative_diagnosis',
      1: 'treatment_criteria_check',
      2: 'treatment_criteria_check',
      3: 'treatment_criteria_check',
      4: 'treatment_criteria_check',
      5: 'treatment_criteria_check',
      6: 'treatment_criteria_check'
    },
    nextNodeIdIfYes: 'treatment_criteria_check',
    nextNodeIdIfNo: 'alternative_diagnosis',
    previousNodeId: 'risk_assessment'
  },
  alternative_diagnosis: {
    id: 'alternative_diagnosis',
    type: 'stop',
    content: 'Shingles less likely. Consider alternative diagnosis and proceed appropriately.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_options',
    previousNodeId: 'clinical_features_check'
  },
  treatment_criteria_check: {
    id: 'treatment_criteria_check',
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient meet any of the following criteria for Shingles treatment?',
    criteria: [
      // Criteria for within 72 hours of rash onset
      { text: 'Immunosuppressed', required: false },
      { text: 'Non-truncal involvement', required: false },
      { text: 'Moderate or severe pain', required: false },
      { text: 'Moderate or severe rash', required: false },
      { text: 'All patients aged over 50 years', required: false },
      // Additional criteria for up to one week after rash onset
      { text: 'Continued vesicle formation', required: false },
      { text: 'Severe pain', required: false },
      { text: 'High risk of severe shingles', required: false },
      { text: 'All patients aged 70 years and over', required: false }
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    nextNodeIdIfPassed: 'treatment_options',
    nextNodeIdIfFailed: 'self_care_advice',
    previousNodeId: 'clinical_features_check'
  },
  comments: {
    id: 'comments',
    type: 'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  treatment_options: {
    id: 'treatment_options',
    type: 'treatment',
    content: 'Offer antiviral treatment plus self-care. Consider aciclovir or valaciclovir based on specific criteria.',
    treatments: [
      { id: 'aciclovir', name: 'Aciclovir', info: 'For eligible patients plus self-care.' },
      {
        id: 'valaciclovir',
        name: 'Valaciclovir',
        info: 'For immunosuppressed patients or those with adherence risk plus self-care.'
      }
    ],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral',
    previousNodeId: 'treatment_criteria_check'
  },
  self_care_advice: {
    id: 'self_care_advice',
    type: 'advice',
    content:
      'Share self-care and safety-netting advice. Recommend pain management and inform about the shingles vaccine.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_options',
    previousNodeId: 'treatment_criteria_check'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'If symptoms worsen or do not improve, consider onward referral. For immunosuppressed patients, notify the GP.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_options',
    previousNodeId: 'treatment_options'
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content: 'Summarize the consultation, treatments prescribed, and safety-netting information shared.',
    previousNodeId: 'self_care_advice' // This should be dynamic based on the actual flow
    // No nextNodeId needed as this is a terminal node.
  }
  // Additional nodes as needed
}
