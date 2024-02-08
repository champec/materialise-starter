export const acuteSinusitisDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Acute Sinusitis',
  icon: 'twemoji:nose-medium-light-skin-tone',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Acute sinusitis (rhinosinusitis) in children aged 12 years and over and
  adults. `,
  useful_links: [
    {
      text: 'NICE Clinical Knowledge Summary',
      link: 'https://cks.nice.org.uk/topics/sinusitis/diagnosis/diagnosis-acute-sinusitis/'
    },
    {
      text: 'Supply of flutiason fuorate 27.5mcg',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6a.-Sinusitis-fluticasone-nasal-spray-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Momestasone 50mcg',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6b.-Sinusitis-mometasone-nasal-spray-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Phenoxymethylpenicillin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6c.-Sinusitis-phenoxymethylpenicillin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Clarithromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6d.-Sinusitis-clairthromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Doxycycline',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6e.-Sinusitis-doxycycline-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Erythromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-6f.-Sinusitis-erythromycin-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',

  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

acuteSinusitisDecisionTree.nodes = {
  root: {
    ...acuteSinusitisDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    icon: 'oui:list-add',
    content: 'Please confirm the patient meets the criteria for inclusion to the Acute Sinusitis pathway:',

    criteria: [
      { text: 'The patient is aged 12 years or older.', required: true },
      { text: 'Informed consent ', required: true },
      {
        text: 'You will: Diagnose acute sinusitis by the CKS guidelines',
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
    minRequired: 3, // Specifies the minimum number of checkboxes (excluding the 'None' option) that need to be ticked to proceed
    passResponse: 'Yes',
    nextNodeIdIfPassed: 'deterioration_risk_check',
    nextNodeIdIfFailed: 'criteria_not_met',
    previousNodeId: 'root' // Assuming the root node is the direct predecessor
  },
  criteria_not_met: {
    id: 'criteria_not_met',
    type: 'stop',
    content: 'The patient does not meet the necessary criteria for proceeding with the Acute Sinusitis pathway.',
    previousNodeId: 'root',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },
  deterioration_risk_check: {
    id: 'deterioration_risk_check',
    type: 'symptoms',
    title: 'Risk of deterioration or serious illness?',
    context:
      'Is there a risk of deterioration or serious illness? Check for signs including intraorbital or periorbital complications, intracranial complications, signs of meningitis, severe frontal headache, or focal neurological signs.',
    symptoms: [
      {text: 'Intraorbital or periorbital complications (orbital cellulitis, displaced eyeball, reduced vision)', response: null},
      {text: 'Intracranial complications (swelling over the frontal bone)', response: null},
      {text: 'Signs of meningitis', response: null},
      {text: 'Severe frontal headache', response: null},
      {text: 'Focal neurological signs', response: null}
    ],
    passResponse: 'No',
    nextNodeIdIfYes: 'emergency_referral',
    nextNodeIdIfNo: 'diagnosis_check',
    previousNodeId: 'root'
  },
  emergency_referral: {
    id: 'emergency_referral',
    type: 'stop',
    content:
      'Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
    previousNodeId: 'deterioration_risk_check',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },
  diagnosis_check: {
    id: 'diagnosis_check',
    type: 'countBased',
    title: 'Symptom based diagnosis',
    context:
      'Diagnose acute sinusitis by the presence of ONE or more of: Nasal blockage or discharge, with ONE or more of: Facial pain/pressure, reduction or loss of sense of smell (in adults), or cough (in children).',
    questions: [
      {text: 'Nasal blockage (obstruction/congestion)', response: null},
      {text: 'Nasal discharge (anterior/posterior nasal drip)', response: null},
      {text: 'Facial pain/pressure (or headache)', response: null},
      {text: 'Reduction (or loss) of the sense of smell (in adults)', response: null},
      {text: 'Cough during the day or at night (in children)', response: null}
    ],
    passResponse: 'No',
    countOption:'Yes',
    countText:'Number of symptoms',
    nextNodeMap: {
      0: 'alternative_diagnosis',
      1: 'symptom_duration_check',
      2: 'symptom_duration_check',
      3: 'symptom_duration_check',
      4: 'symptom_duration_check',
      5: 'symptom_duration_check'
    },
    nextNodeIdIfYes: 'symptom_duration_check',
    nextNodeIdIfNo: 'alternative_diagnosis',
    previousNodeId: 'deterioration_risk_check'
  },
  alternative_diagnosis: {
    id: 'alternative_diagnosis',
    type: 'stop',
    content: 'Acute sinusitis is less likely. Consider alternative diagnosis and proceed appropriately.',
    previousNodeId: 'diagnosis_check',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },
  symptom_duration_check: {
    id: 'symptom_duration_check',
    type: 'question',
    content: 'Has the patient had symptoms for less than 10 days?',
    answers: ['Yes', 'No'],
    nextNodeIdIfYes: 'self_care_advice',
    nextNodeIdIfNo: 'bacterial_infection_check',
    previousNodeId: 'diagnosis_check'
  },
  self_care_advice: {
    id: 'self_care_advice',
    type: 'advice',
    content:
      'Consider self-care and pain relief. Antibiotics are not needed as sinusitis usually lasts 2-3 weeks. Manage symptoms with self-care and safety netting advice.',
    previousNodeId: 'symptom_duration_check'
  },
  bacterial_infection_check: {
    id: 'bacterial_infection_check',
    type: 'countBased',
    title: 'Symptoms suggesting acute bacterial sinusitis',
    content:
      'Does the patient have 2 or more of the following symptoms to suggest acute bacterial sinusitis: Marked deterioration after an initial milder phase, fever, unremitting purulent nasal discharge, or severe localised unilateral pain?',
    questions: [
      {text: 'Marked deterioration after an initial milder phase', response: null},
      {text: 'Fever (>38°C)', response: null},
      {text: 'Unremitting purulent nasal discharge', response: null},
      {text: 'Severe localised unilateral pain (particularly pain over the teeth or jaw)', response: null}
    ],
    countText:'Number of symptoms',
    countOption:'Yes',
    nextNodeMap:{
      2: 'treatment_decision',
      1: 'non_bacterial_advice',
      0: 'non_bacterial_advice',
      3: 'treatment_decision',
      4: 'treatment_decision'
    },
    nextNodeIdIfYes: 'treatment_decision',
    nextNodeIdIfNo: 'non_bacterial_advice',
    previousNodeId: 'symptom_duration_check'
  },
  non_bacterial_advice: {
    id: 'non_bacterial_advice',
    type: 'advice',
    content:
      'Offer self-care and pain relief. Consider high dose nasal corticosteroid (off-label) for 14 days for patients with non-bacterial acute sinusitis. Antibiotics make little difference to how long symptoms last or the number of people whose symptoms improve. Advise patient to return to Community Pharmacy if symptoms do not improve in 7 days.',
    previousNodeId: 'bacterial_infection_check'
  },
  comments: {
    id: 'comments',
    type: 'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  treatment_decision: {
    id: 'treatment_decision',
    type: 'treatment',
    content:
      'For bacterial acute sinusitis, consider a shared decision-making approach. Offer high dose nasal corticosteroid (off-label) for 14 days plus self-care and pain relief instead of antibiotics first line. If unsuitable or ineffective, consider antibiotics.',
    treatments: [
      {
        id: 'phenoxymethylpenicillin',
        name: 'Phenoxymethylpenicillin',
        info: 'For 5 days (subject to inclusion/exclusion criteria in PGD) plus self-care. Check for penicillin allergy.',
        contraindications: ['penicillinAllergy']
      },
      {
        id: 'clarithromycin',
        name: 'Clarithromycin',
        info: 'For 5 days (subject to inclusion/exclusion criteria in PGD) plus self-care for patients with penicillin allergy.',
        contraindications: []
      },
      {
        id: 'doxycycline',
        name: 'Doxycycline',
        info: 'For 5 days (subject to inclusion/exclusion criteria in PGD) plus self-care for patients with penicillin allergy.',
        contraindications: []
      },
      {
        id: 'erythromycin',
        name: 'Erythromycin',
        info: 'For 5 days (subject to inclusion/exclusion criteria in PGD) plus self-care if the patient is pregnant.',
        contraindications: []
      }
    ],
    actions: [
      {
        id: 'penicillinAllergyCheck',
        label: 'Reported penicillin allergy (via National Care Record or Patient/Carer)'
      },
      { id: 'pregnancyTest', label: 'Pregnancy Test Completed' }
    ],
    previousNodeId: 'bacterial_infection_check',
    nextNodeId: 'safety_netting'
  },
  safety_netting: {
    id: 'safety_netting',
    type: 'information',
    content:
      'Share self-care and safety-netting advice using Target respiratory tract Infection leaflets. Inform the patient about the signs of potential complications and advise on when to seek further medical attention.',
    previousNodeId: 'treatment_decision',
    nextNodeId: 'consultation_summary'
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content:
      'Summarize the consultation, including any advice given, treatments prescribed, and the safety netting information shared with the patient. Document any decisions made regarding the management of acute sinusitis and plan for follow-up if necessary.',
    previousNodeId: 'safety_netting',
    nextNodeId: 'pathway_conclusion'
  },
  follow_up: {
    id: 'follow_up',
    type: 'question',
    content:
      'If symptoms worsen rapidly or significantly at any time, or do not improve after completion of the treatment course, consider the need for onward referral to General Practice or other provider as appropriate.',
    answers: ['Yes', 'No'],
    previousNodeId: 'consultation_summary',
    nextNodeIdIfYes: 'onward_referral',
    nextNodeIdIfNo: 'pathway_conclusion'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'referral',
    content:
      'Based on the worsening of symptoms or lack of improvement, an onward referral to General Practice or other healthcare provider may be necessary for further evaluation and management.',
    previousNodeId: 'follow_up',
    nextNodeId: 'pathway_conclusion'
  },
  pathway_conclusion: {
    id: 'pathway_conclusion',
    type: 'summary',
    content:
      'This marks the conclusion of the acute sinusitis management pathway. Ensure all necessary information has been shared with the patient, and all appropriate steps have been documented.',
    previousNodeId: 'follow_up' // or 'onward_referral' depending on the flow
  }
}
