export const infectedInsectBitesDecisionTree = {
  // id: 'root',
  // type: 'information',
  // content: 'Infected Insect Bites Decision Tree',
  // information: 'Consider the risk of deterioration or serious illness. Assess for typical clinical features of UTI.',
  // nextNodeIdIfTrue: 'criteria_met',
  // nextNodeIdIfFalse: 'exclusion_criteria_met',
  // nextNodeId: 'criteria_confirmation',
  // previousNodeId: null
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Infected Insect Bites',
  icon: 'mdi:insect',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Infected insect bite(s) and sting(s) in children aged 1 year and over and
  adults.`,
  useful_links: [
    {
      text: 'NICE CKS',
      link: 'https://cks.nice.org.uk/topics/insect-bites-stings/diagnosis/assessment/'
    },
    {
      text: 'Supply of Flucloxacillin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-4a.-Infected-insect-bites-flucloxacillin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Clarithromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-4b.-Infected-insect-bites-clarithromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Erythromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-4c.-Infected-insect-bites-erythromycin-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

infectedInsectBitesDecisionTree.nodes = {
  root: {
    ...infectedInsectBitesDecisionTree
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Infected Insect Bites pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'antibiotic_treatment_options',
    previousNodeId: 'root'
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    content: 'Please confirm the patient meets the following criteria for the Infected Insect Bites pathway:',
    criteria: [
      // 'For adults and children aged 1 year and over', 'Exclude: pregnant individuals under 16 years'
      { text: 'For adults and children aged 1 year and over', required: true },
      { text: 'The patient is not a pregnant individual under 16 years', required: true }
    ],
    passResponse:'Yes',
    nextNodeIdIfPassed: 'risk_assessment',
    nextNodeIdIfFailed: 'exclusion_criteria_met',
    previousNodeId: 'root'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'symptoms',
    title: 'Risk of deterioration or serious illness',
    componentType: 'criteriaChecklist',
    content:
      'Consider the risk of deterioration or serious illness. Check for signs of systemic hypersensitivity reaction, anaphylaxis, severe immunosuppression, risk of airway obstruction, or orbital cellulitis. Select "None" if no serious risks are identified.',
    symptoms: [
      { text: 'Systemic hypersensitivity reaction or anaphylaxis', required: false },
      { text: 'Severely immunosuppressed with signs or symptoms of infection', required: false },
      { text: 'Stings with risk of airway obstruction (e.g., in the mouth or throat)', required: false },
      { text: 'Concerns of orbital cellulitis from bite or sting around the eyes', required: false },
      { text: 'None of the above', required: false, action: 'untickAll' }
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    passResponse:'No',
    nextNodeIdIfYes: 'emergency_referral',
    nextNodeIdIfNo: 'clinical_features_check',
    previousNodeId: 'criteria_confirmation'
  },
  emergency_referral: {
    id: 'emergency_referral',
    type: 'stop',
    content:
      'Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'antibiotic_treatment_options',
    previousNodeId: 'risk_assessment'
  },
  clinical_features_check: {
    id: 'clinical_features_check',
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient meet any of the following criteria related to insect bites?',
    criteria: [
      { text: 'Bite or scratch caused by animals', required: false },
      { text: 'Bite caused by humans', required: false },
      { text: 'Bite caused by tick in the UK and signs of Lyme disease', required: false },
      { text: 'Bite or sting occurred while traveling outside of the UK', required: false },
      { text: 'Bite or sting caused by an unusual or exotic insect', required: false },
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    nextNodeIdIfPassed: 'onward_referral',
    nextNodeIdIfFailed: 'post_48_hours_check',
    previousNodeId: 'risk_assessment'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content: 'Onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'clinical_features_check'
  },
  post_48_hours_check: {
    id: 'post_48_hours_check',
    type: 'criteria',
    content: 'Has it been at least 48 hours after the initial insect bite or sting?',
    criteria: ['Yes', 'No'],
    nextNodeIdIfTrue: 'itch_principal_symptom_check',
    nextNodeIdIfFalse: 'recommend_self_care',
    previousNodeId: 'clinical_features_check'
  },
  recommend_self_care: {
    id: 'recommend_self_care',
    type: 'advice',
    content:
      'Recommend self-care, oral antihistamine, and/or topical steroids over the counter and safety netting advice.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'post_48_hours_check'
  },
  itch_principal_symptom_check: {
    id: 'itch_principal_symptom_check',
    type: 'criteria',
    content: 'Is itch the principal symptom? (In the absence of other signs or symptoms of infection)',
    criteria: ['Yes', 'No'],
    nextNodeIdIfTrue: 'infected_insect_bite_less_likely',
    nextNodeIdIfFalse: 'acute_symptoms_check',
    previousNodeId: 'post_48_hours_check'
  },
  infected_insect_bite_less_likely: {
    id: 'infected_insect_bite_less_likely',
    type: 'advice',
    content:
      'Infected insect bite less likely. Recommend self-care, oral antihistamine, and/or topical steroids over the counter and safety netting advice.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'antibiotic_treatment_options',
    previousNodeId: 'itch_principal_symptom_check'
  },
  acute_symptoms_check: {
    id: 'acute_symptoms_check',
    type: 'countBased',
    componentType: 'criteriaChecklist',
    content: 'Does the patient have acute onset of ≥3 of the following symptoms of an infected insect bite?',
    questions: [
      { text: 'Redness of skin', required: false },
      { text: 'Pain or tenderness to the area', required: false },
      { text: 'Swelling of skin', required: false },
      { text: 'Skin surrounding the bite feels hot to touch', required: false },
      { text: 'None of the above', required: false, action: 'untickAll' }
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 3,
    countOption:'Yes',
    nextNodeMap:{
      0: 'recommend_self_care',
      1: 'further_infection_criteria_check',
      2: 'further_infection_criteria_check',
      3: 'further_infection_criteria_check',
      4: 'further_infection_criteria_check'
    },
    nextNodeIdIfPassed: 'further_infection_criteria_check',
    nextNodeIdIfFailed: 'recommend_self_care',
    previousNodeId: 'itch_principal_symptom_check'
  },
  further_infection_criteria_check: {
    id: 'further_infection_criteria_check',
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient meet ANY of the following criteria?',
    criteria: [
      { text: 'Redness and swelling of skin surrounding the bite is spreading', required: false },
      { text: 'Evidence of pustular discharge at site of bite/sting', required: false },
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    nextNodeIdIfPassed: 'antibiotic_treatment_criteria_check',
    nextNodeIdIfFailed: 'recommend_self_care',
    previousNodeId: 'acute_symptoms_check'
  },
  antibiotic_treatment_criteria_check: {
    id: 'antibiotic_treatment_criteria_check',
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient meet ANY of the following criteria for antibiotic treatment?',
    criteria: [
      { text: 'Patient systemically unwell', required: false },
      { text: 'Known comorbidity which may complicate or delay resolution of infection', required: false },
      { text: 'Severe pain out of proportion to the wound', required: false },
      { text: 'Significant collection of fluid or pus at site of infection', required: false }
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    nextNodeIdIfPassed: 'antibiotic_treatment_options',
    nextNodeIdIfFailed: 'recommend_self_care',
    previousNodeId: 'further_infection_criteria_check'
  },
  comments: {
    id: 'comments',
    type: 'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  antibiotic_treatment_options: {
    id: 'antibiotic_treatment_options',
    type: 'treatment',
    content: "Select the appropriate antibiotic treatment based on the patient's condition and allergies.",
    treatments: [
      { id: 'flucloxacillin', name: 'Flucloxacillin', info: 'For 5 days plus self care, if no allergy to penicillin.' },
      {
        id: 'clarithromycin',
        name: 'Clarithromycin',
        info: 'For 5 days plus self care, for patients with a penicillin allergy.'
      },
      { id: 'erythromycin', name: 'Erythromycin', info: 'For 5 days plus self care, if pregnant.' }
    ],
    nextNodeIdIfYes: 'penicillin_allergy_check',
    nextNodeIdIfNo: 'recommend_self_care',
    previousNodeId: 'antibiotic_treatment_criteria_check',
    nextNodeId: 'consultation_summary'
  },
  penicillin_allergy_check: {
    id: 'penicillin_allergy_check',
    type: 'criteria',
    content: 'Is the patient allergic to penicillin?',
    criteria: ['Yes', 'No'],
    nextNodeIdIfTrue: 'clarithromycin_option',
    nextNodeIdIfFalse: 'flucloxacillin_option',
    previousNodeId: 'antibiotic_treatment_options'
  },
  flucloxacillin_option: {
    id: 'flucloxacillin_option',
    type: 'treatment',
    content: 'Offer flucloxacillin for 5 days plus self care.',
    treatments: [{ id: 'flucloxacillin_treatment', name: 'Flucloxacillin', info: 'For 5 days plus self care.' }],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral',
    previousNodeId: 'penicillin_allergy_check'
  },
  clarithromycin_option: {
    id: 'clarithromycin_option',
    type: 'treatment',
    content: 'Offer clarithromycin for 5 days plus self care, for patients with a penicillin allergy.',
    treatments: [{ id: 'clarithromycin_treatment', name: 'Clarithromycin', info: 'For 5 days plus self care.' }],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral',
    previousNodeId: 'penicillin_allergy_check'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'If symptoms worsen rapidly or significantly at any time, or do not improve after completion of 5 days treatment course, consider onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'antibiotic_treatment_options' // This needs to dynamically change based on the flow
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content:
      'Summarize the consultation, including any advice given, treatments prescribed, and safety-netting information shared. Advise on pain management and inform eligible individuals about the shingles vaccine.',
    previousNodeId: 'onward_referral' // This should dynamically change based on the actual flow
    // No nextNodeId needed as this is a terminal node.
  }
  // Additional nodes as needed for safety-netting advice, pain management recommendations, and vaccine information.
}
