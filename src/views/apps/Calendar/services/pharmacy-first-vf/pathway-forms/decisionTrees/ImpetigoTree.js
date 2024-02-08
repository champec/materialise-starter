export const impetigoDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Impetigo',
  icon: 'mdi:rash',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Localised non-bullous impetigo in children over 1 year and adults
  who are systemically well and not at high risk of complications.  `,
  useful_links: [
    {
      text: 'NICE Clinical Knowledge Summary',
      link: 'https://cks.nice.org.uk/topics/impetigo/diagnosis/diagnosis/'
    },
    {
      text: 'Supply of Hydrogen Peroxide',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-3a.-Impetigo-hydrogen-peroxide-cream-protocol-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Fusidic Acid',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-3b.-Impetigo-fusidic-acid-cream-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Flucloxacillin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-3c.-Impetigo-flucloxacillin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Clarithromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-3d.-Impetigo-clarithromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Erythromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-3e.-Impetigo-erythromycin-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

impetigoDecisionTree.nodes = {
  root: {
    ...impetigoDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    componentType: 'criteriaChecklist',
    content: 'Please confirm the following criteria for the Impetigo pathway:',
    criteria: [
      { text: 'The patient has non-bullous impetigo.', required: true },
      { text: 'The patient is aged 1 year and over.', required: true },
      { text: 'The patient does not have bullous impetigo.', required: true },
      { text: 'The patient does not have recurrent impetigo.', required: true },
      { text: 'The patient is not a pregnant individual under 16 years.', required: true }
    ],
    allOption: {
      text: 'All of the above',
      action: 'tickAll'
    },
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    passResponse:'Yes',
    minRequired: 5,
    nextNodeIdIfPassed: 'risk_assessment',
    nextNodeIdIfFailed: 'exclusion_criteria_met',
    previousNodeId: 'root'
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Impetigo pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'criteria_confirmation'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'symptoms',
    title: 'Risk Assessment',
    context:
      'Consider the risk of deterioration. Check for serious complications such as Meningitis, Encephalitis, Myelitis, Facial nerve paralysis, or Shingles in specific conditions. Select "No" if no serious complications are suspected.',
    componentType: 'criteriaChecklist',
    symptoms: [
      // 'Meningitis (neck stiffness, photophobia, mottled skin)',
      // 'Encephalitis (disorientation, changes in behaviour)',
      // 'Myelitis (muscle weakness, loss of bladder or bowel control)',
      // 'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)',
      // "Shingles in the ophthalmic distribution (Hutchinson's sign, visual symptoms, unexplained red eye)",
      // 'Shingles in severely immunosuppressed patient',
      // 'Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell'
      { text: 'Meningitis (neck stiffness, photophobia, mottled skin)', required: false, response: null },
      { text: 'Encephalitis (disorientation, changes in behaviour)', required: false, response: null },
      { text: 'Myelitis (muscle weakness, loss of bladder or bowel control)', required: false, response: null },
      { text: 'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)', required: false, response: null },
      { text: "Shingles in the ophthalmic distribution (Hutchinson's sign, visual symptoms, unexplained red eye)", required: false, response: null },
      { text: 'Shingles in severely immunosuppressed patient', required: false, response: null },
      { text: 'Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell', required: false, response: null }
    ],
    noneOption: {
      text: 'None of the above', // This option, when selected, will deselect all other options and vice versa
      action: 'untickAll' // Indicates the action to be taken when this option is selected
    },
    passResponse: 'No', // The response to be given when the node is considered passed
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
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'risk_assessment'
  },
  clinical_features_check: {
    id: 'clinical_features_check',
    type: 'multiple_choice_question',
    title: 'Clinical Features Check',
    content:
      'Does the patient follow the typical progression of Impetigo clinical features? Refer to NHS.UK for images of Impetigo.',
    answers: [
      { text: 'Yes, typical features of Impetigo', action: 'lesion_count_check' },
      { text: 'No, Impetigo less likely', action: 'alternative_diagnosis' }
    ],
    links: [
      { text: 'NHS.UK', link: 'https://www.nhs.uk/conditions/impetigo/' },
      {
        text: 'DermNet Impetigo images',
        link: 'https://dermnetnz.org/images/impetigo-images'
      }
    ],
    previousNodeId: 'risk_assessment'
  },
  alternative_diagnosis: {
    id: 'alternative_diagnosis',
    type: 'stop',
    content: 'Impetigo less likely. Consider alternative diagnosis and proceed appropriately.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'clinical_features_check'
  },
  lesion_count_check: {
    id: 'lesion_count_check',
    title: 'Lesion Count Check',

    type: 'multiple_choice_question',
    content: 'Does the patient have ≤3 lesions/clusters present, or ≥4 lesions/clusters present?',
    answers: [
      { text: '≤3 lesions/clusters', action: 'localized_treatment' },
      { text: '≥4 lesions/clusters', action: 'widespread_treatment' }
    ],
    previousNodeId: 'clinical_features_check'
  },
  comments: {
    id: 'comments',
    type: 'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  localized_treatment: {
    id: 'localized_treatment',
    type: 'treatment',
    content:
      'Localised non-bullous impetigo. Offer hydrogen peroxide 1% cream or fusidic acid cream for 5 days plus self-care.',
    treatments: [
      { id: 'hydrogen_peroxide', name: 'Hydrogen Peroxide 1% Cream', info: 'For 5 days plus self-care.' },
      {
        id: 'fusidic_acid',
        name: 'Fusidic Acid Cream',
        info: 'For 5 days plus self-care. Consider as a 2nd line treatment if hydrogen peroxide is unsuitable or ineffective.'
      }
    ],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral',
    previousNodeId: 'lesion_count_check',
    nextNodeId: 'consultation_summary'
  },
  widespread_treatment: {
    id: 'widespread_treatment',
    type: 'treatment',
    content:
      'Widespread non-bullous impetigo. Offer flucloxacillin for 5 days plus self-care. If allergic to penicillin, offer clarithromycin or erythromycin for pregnant patients.',
    treatments: [
      { id: 'flucloxacillin', name: 'Flucloxacillin', info: 'For 5 days plus self-care.' },
      {
        id: 'clarithromycin',
        name: 'Clarithromycin',
        info: 'For 5 days plus self-care for patients with penicillin allergy.'
      },
      { id: 'erythromycin', name: 'Erythromycin', info: 'For 5 days plus self-care if the patient is pregnant.' }
    ],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral',
    previousNodeId: 'lesion_count_check',
    actions: [
      {
        id: 'penicillinAllergyCheck',
        label: 'Reported penicillin allergy (via National Care Record or Patient/Carer)'
      },
      { id: 'pregnancyTest', label: 'Pregnancy Test Completed' }
    ],
    nextNodeId: 'consultation_summary'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'If symptoms worsen rapidly or significantly at any time, or do not improve after completion of treatment course, consider onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'localized_treatment' // This should be dynamic based on the actual flow
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content:
      'Summarize the consultation, including any advice given, treatments prescribed, and safety-netting information shared using the British Association of Dermatologists Impetigo leaflet.',
    previousNodeId: 'localized_treatment' // This should be dynamic based on the actual flow
    // No nextNodeId needed as this is a terminal node.
  }
  // Additional safety-netting advice or follow-up actions can be included here as needed.
}
