export const acuteOtitisMediaDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Acute Otitis Media',
  icon: 'openmoji:ear',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Local symptomatic relief of pain from acute otitis media (AOM) in
  children aged 1 year and over and young people (under 18 years of
  age).`,
  useful_links: [
    {
      text: 'NICE Clinical Knowledge Summary',
      link: 'https://cks.nice.org.uk/topics/otitis-media-acute/diagnosis/diagnosis/'
    },
    {
      text: 'Supply of Amoxicillin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-7b.-Acute-otitis-media-amoxicillin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Clarithromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-7c.-Acute-otitis-media-clarithromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Erythromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-7d.-Acute-otitis-media-erythromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Otigo',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-7a.-Acute-otitis-media-phenazone-lidocaine-ear-drops-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  criteria: [
    'For children aged 1 to 17 years',
    'Exclude: recurrent acute otitis media (3 or more episodes in 6 months or four or more episodes in 12 months), pregnant individuals under 16 years'
  ],
  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

acuteOtitisMediaDecisionTree.nodes = {
  root: {
    ...acuteOtitisMediaDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    icon: 'oui:list-add',
    content: 'Please confirm the patient meets the criteria for inclusion to the Acute Otitis Media pathway:',
    criteria: [
      { text: 'The patient is aged 1 to 17 years.', required: true },
      {
        text: 'The patient does not have recurrent acute otitis media (3 or more episodes in 6 months or four or more episodes in 12 months).',
        required: true
      },
      { text: 'The patient is not a pregnant individual under 16 years.', required: true }
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
    nextNodeIdIfPassed: 'initial_information',
    nextNodeIdIfFailed: 'criteria_not_met_stop',
    previousNodeId: 'root' // Assuming the root node is the direct predecessor
  },

  criteria_not_met_stop: {
    id: 'criteria_not_met_stop',
    type: 'stop',
    content: 'The patient does not meet the necessary criteria for proceeding with the Acute Otitis Media pathway.',
    previousNodeId: 'criteria_confirmation',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },

  initial_information: {
    id: 'initial_information',
    type: 'information',
    icon: 'icon-park:info',
    content:
      'Acute otitis media mainly affects children, can last for around 1 week, and over 80% of children recover spontaneously without antibiotics 2-3 days from presentation.',
    nextNodeId: 'deterioration_check',
    previousNodeId: 'criteria_confirmation'
  },
  deterioration_check: {
    id: 'deterioration_check',
    type: 'symptoms',
    icon: 'ic:sharp-sick',
    content: 'Does the patient risk deterioration?:',
    symptoms: [
      'Meningitis (neck stiffness, photophobia, mottled skin)',
      'Mastoiditis (pain, soreness, swelling, tenderness behind the affected ear(s))',
      'Brain abscess (severe headache, confusion or irritability, muscle weakness)',
      'Sinus thrombosis (headache behind or around the eyes)',
      'Facial nerve paralysis'
    ],
    nextNodeIdIfYes: 'stop_emergency',
    nextNodeIdIfNo: 'gateway_point',
    previousNodeId: 'initial_information'
  },
  stop_emergency: {
    id: 'stop_emergency',
    type: 'stop',
    content:
      'Signpost patient to A&E or calling 999 in a life threatening emergency. Cannot continue with consultation.',
    previousNodeId: 'deterioration_check',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },
  gateway_point: {
    id: 'gateway_point',
    type: 'gateway',
    icon: 'mdi:arrow-right-bold',
    content: 'Begin detailed consultation process.',
    nextNodeId: 'acute_symptoms_check',
    previousNodeId: 'deterioration_check'
  },
  acute_symptoms_check: {
    id: 'acute_symptoms_check',
    type: 'symptoms',
    content: 'Does the patient have acute onset of symptoms:',
    symptoms: [
      'In older children—earache',
      'In younger children—holding, tugging, or rubbing of the ear',
      'In younger children: non-specific symptoms such as fever, crying, poor feeding, restlessness, behavioural changes, cough, or rhinorrhoea'
    ],
    nextNodeIdIfYes: 'otoscopic_examination',
    nextNodeIdIfNo: 'alternative_diagnosis_advice',
    previousNodeId: 'gateway_point'
  },
  alternative_diagnosis_advice: {
    id: 'alternative_diagnosis_advice',
    type: 'stop',
    content: 'Acute otitis media less likely. Consider alternative diagnosis and proceed appropriately.',
    previousNodeId: 'acute_symptoms_check',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision'
  },
  otoscopic_examination: {
    id: 'otoscopic_examination',
    type: 'question',
    content: 'Does the patient have an otoscopic examination showing:',
    answers: [
      'A distinctly red, yellow, or cloudy tympanic membrane',
      'Moderate to severe bulging of the tympanic membrane, with loss of normal landmarks and an air-fluid level behind the tympanic membrane',
      'Perforation of the tympanic membrane and/or sticky discharge in the external auditory canal'
    ],
    context_list: [
      'A distinctly red, yellow, or cloudy tympanic membrane',
      'Moderate to severe bulging of the tympanic membrane, with loss of normal landmarks and an air-fluid level behind the tympanic membrane',
      'Perforation of the tympanic membrane and/or sticky discharge in the external auditory canal'
    ],
    nextNodeIdIfYes: 'high_risk_criteria_check',
    nextNodeIdIfNo: 'alternative_diagnosis_advice',
    previousNodeId: 'acute_symptoms_check'
  },
  high_risk_criteria_check: {
    id: 'high_risk_criteria_check',
    type: 'symptoms',
    content: 'Does the patient meet ANY of the following high-risk criteria:',
    symptoms: [
      'Systemically very unwell',
      'Signs of a more serious illness',
      'High risk of complications due to pre-existing comorbidity'
    ],
    nextNodeIdIfYes: 'onward_referral',
    nextNodeIdIfNo: 'otorrhoea_check',
    previousNodeId: 'otoscopic_examination'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'referral',
    content: 'Onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'high_risk_criteria_check'
  },
  otorrhoea_check: {
    id: 'otorrhoea_check',
    type: 'question',
    content: 'Does the child/young person have otorrhoea or eardrum perforation?',
    answers: ['Yes', 'No'],
    nextNodeIdIfYes: 'shared_decision_making',
    nextNodeIdIfNo: 'age_and_infection_check',
    previousNodeId: 'high_risk_criteria_check'
  },
  age_and_infection_check: {
    id: 'age_and_infection_check',
    type: 'question',
    content: 'Is the child under 2 years AND with infection in both ears?',
    answers: ['Yes', 'No'],
    nextNodeIdIfYes: 'shared_decision_making',
    nextNodeIdIfNo: 'mild_symptoms_advice',
    previousNodeId: 'otorrhoea_check'
  },
  shared_decision_making: {
    id: 'shared_decision_making',
    type: 'plan',
    content: 'Shared decision-making approach and clinician global impression.',
    nextNodeId: 'treatment_decision',
    nextNodeIdIfNo: 'treatment_decision',
    nextNodeIdIfYes: 'comments',
    previousNodeId: 'age_and_infection_check'
  },
  mild_symptoms_advice: {
    id: 'mild_symptoms_advice',
    type: 'advice',
    content:
      'In patients with mild symptoms offer self-care and pain relief. For moderate and severe symptoms, consider phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days plus self-care. Ask patient to return if no improvement within 3-5 days.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'age_and_infection_check'
  },
  comments: {
    id:'comments',
    type:'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  treatment_decision: {
    id: 'treatment_decision',
    type: 'treatment',
    content: 'Treatment options based on the severity of symptoms and specific patient criteria.',
    treatments: [
      {
        id: 'amoxicillin',
        info: 'for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care',
        name: 'Amoxicillin',
        contraindications: ['allergyPenicillin']
      },
      {
        id: 'clarithromycin',
        info: 'Offer clarithromycin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care',
        name: 'Clarithromycin',
        contraindications: ['aged 16-17 and preganant']
      },
      {
        id: 'erythromycin',
        name: 'Erythromycin',
        contraindications: ['pregnancy'],
        info: 'Offer erythromycin for 5 days (subject to inclusion/ exclusion criteria in PGD) plus self care'
      }
    ],
    actions: [
      { id: 'allergyCheck', label: 'Reported penicillin allergy (Via National Care Record or Patient/Carer)' },
      { id: 'otoscopyCarried', label: 'Otoscopic examination carried out' }
    ],
    nextNodeId: 'safe_netting',
    previousNodeId: 'root'
  },
  safety_netting: {
    id: 'safety_netting',
    type: 'information',
    content:
      'Share self-care and safety-netting information, and evidence on antibiotic use following NICE guidelines.',
    nextNodeId: 'comments',
    previousNodeId: 'treatment_decision'
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content: 'Consultation summary.',
    previousNodeId: 'root'
  }
}

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
      'Intraorbital or periorbital complications (orbital cellulitis, displaced eyeball, reduced vision)',
      'Intracranial complications (swelling over the frontal bone)',
      'Signs of meningitis',
      'Severe frontal headache',
      'Focal neurological signs'
    ],
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
    type: 'symptoms',
    title: 'Risk of deterioration or serious illness?',

    context:
      'Diagnose acute sinusitis by the presence of ONE or more of: Nasal blockage or discharge, with ONE or more of: Facial pain/pressure, reduction or loss of sense of smell (in adults), or cough (in children).',
    symptoms: [
      'Nasal blockage (obstruction/congestion)',
      'Nasal discharge (anterior/posterior nasal drip)',
      'Facial pain/pressure (or headache)',
      'Reduction (or loss) of the sense of smell (in adults)',
      'Cough during the day or at night (in children)'
    ],
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
    content: 'Has the patient had symptoms for ≤10 days?',
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
    type: 'symptoms',
    content:
      'Does the patient have 2 or more of the following symptoms to suggest acute bacterial sinusitis: Marked deterioration after an initial milder phase, fever, unremitting purulent nasal discharge, or severe localised unilateral pain?',
    symptoms: [
      'Marked deterioration after an initial milder phase',
      'Fever (>38°C)',
      'Unremitting purulent nasal discharge',
      'Severe localised unilateral pain (particularly pain over the teeth or jaw)'
    ],
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
    id:'comments',
    type:'comments',
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
    nextNodeId: 'comments'
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
    previousNodeId: 'comments',
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

export const acuteSoreThroatDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Sore Throat',
  icon: 'medical-icon:i-ear-nose-throat',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Acute sore throat due to suspected streptococcal infection in children aged
  5 years and over and adults. `,
  useful_links: [
    {
      text: 'NICE Clinical Knowledge Summary',
      link: 'https://www.nice.org.uk/guidance/ng84/'
    },
    {
      text: 'Fever pain score',
      link: 'https://www.mdcalc.com/calc/3316/feverpain-score-strep-pharyngitis'
    },
    {
      text: 'Supply of Clarithromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-5b.-Sore-throat-clarithromycin-patient-group-direction-Pharmacy-First.pdf'
    },
    {
      text: 'Supply of Erythromycin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-5c.-Sore-throat-erythromycin-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  previousNodeId: null,
  nextNodeId: 'criteria_confirmation'
}

acuteSoreThroatDecisionTree.nodes = {
  root: {
    ...acuteSoreThroatDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    icon: 'oui:list-add',
    content: 'Please confirm the patient meets the criteria for inclusion to the Acute Sore Throat pathway:',
    criteria: [
      { text: 'The patient is aged 5 years or older.', required: true },
      { text: 'Informed consent ', required: true },
      {
        text: 'You will: Diagnose sore throat using the appropriate NICE guidance and FeverPAIN score.',
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
    nextNodeIdIfPassed: 'initial_information',
    nextNodeIdIfFailed: 'criteria_not_met_stop',
    previousNodeId: 'root' // Assuming the root node is the direct predecessor
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Acute Sore Throat pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'root'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'symptoms',
    content:
      'Consider the risk of deterioration or serious illness. Check for suspected Epiglottitis (4Ds: dysphagia, dysphonia, drooling, distress), severe complications (like clinical dehydration, pharyngeal abscess), and stridor.',
    symptoms: [
      'Suspected Epiglottitis (4Ds: dysphagia, dysphonia, drooling, distress)',
      'Severe complications suspected (such as clinical dehydration, signs of pharyngeal abscess)',
      'Stridor (noisy or high pitched sound with breathing)'
    ],
    nextNodeIdIfYes: 'emergency_referral',
    nextNodeIdIfNo: 'further_assessment',
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
  further_assessment: {
    id: 'further_assessment',
    type: 'symptoms',
    content:
      'Check for signs or symptoms indicating possible scarlet fever, quinsy, glandular fever, suspected cancer, or if the patient is immunosuppressed.',
    symptoms: [
      'Signs or symptoms indicating possible scarlet fever, quinsy or glandular fever',
      'Signs and symptoms of suspected cancer',
      'Patient is immunosuppressed'
    ],
    nextNodeIdIfYes: 'onward_referral',
    nextNodeIdIfNo: 'feverpain_score',
    previousNodeId: 'risk_assessment'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'Onward referral to General Practice or other provider as appropriate based on the presence of concerning signs or symptoms.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'further_assessment'
  },
  feverpain_score: {
    id: 'feverpain_score',
    type: 'multiple_choice_question',
    content:
      'Use FeverPAIN Score to assess the patient. Assign 1 point for each: Fever over 38°C, Purulence, First attendance within 3 days, Severely inflamed tonsils, No cough or coryza.',
    answers: [
      { text: '0 or 1', action: 'self_care_0_1' },
      { text: '2 or 3', action: 'self_care_2_3' },
      { text: '4 or 5', action: 'decision_4_5' }
    ],
    previousNodeId: 'further_assessment'
  },
  self_care_0_1: {
    id: 'self_care_0_1',
    type: 'advice',
    content:
      'For FeverPAIN score of 0 or 1: Self-care and pain relief. Antibiotics are not needed. Offer over-the-counter treatment for symptomatic relief and advise drinking adequate fluids. Ask the patient to return to Community Pharmacy after 1 week if no improvement.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'feverpain_score'
  },
  self_care_2_3: {
    id: 'self_care_2_3',
    type: 'advice',
    title: 'Self-care and pain relief',
    context:
      'For FeverPAIN score of 2 or 3: Self-care and pain relief. Antibiotics make little difference. Withholding antibiotics is unlikely to lead to complications. Ask the patient to return if no improvement within 3-5 days for pharmacist reassessment.',
    content:
      'For FeverPAIN score of 2 or 3: Self-care and pain relief. Antibiotics make little difference. Withholding antibiotics is unlikely to lead to complications. Ask the patient to return if no improvement within 3-5 days for pharmacist reassessment.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'decision_4_5',
    nextNodeId: 'comments'
  },
  decision_4_5: {
    id: 'decision_4_5',
    type: 'multiple_choice_question',
    content:
      'For FeverPAIN score of 4 or 5: Use a shared decision-making approach. Consider pain relief and self-care for mild symptoms. For severe symptoms, consider an immediate antibiotic.',
    answers: [
      {
        text: 'Mild symptoms: Self-care and pain relief. Ask patient to return if no improvement within 3-5 days.',
        action: 'self_care_2_3'
      },
      {
        text: 'Severe symptoms: Offer immediate antibiotic treatment. Consider phenoxymethylpenicillin for 5 days, unless there is a penicillin allergy.',
        action: 'treatment_decision'
      }
    ],
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'feverpain_score'
  },
  self_care_2_3: {
    id: 'self_care_2_3',
    type: 'advice',
    content: 'Ask patient to return to Pharmacy if no improvement in 48 hours for pharmacist reassessment',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'decision_4_5',
    nextNodeId: 'comments'
  },
  comments: {
    id:'comments',
    type:'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  treatment_decision: {
    id: 'treatment_decision',
    type: 'treatment',
    content:
      'Treatment options based on the severity of symptoms and specific patient criteria. Consider antibiotics if symptoms do not improve after pharmacist reassessment or for severe cases initially.',
    treatments: [
      {
        id: 'phenoxymethylpenicillin',
        name: 'Phenoxymethylpenicillin',
        info: 'For 5 days plus self-care, unless there is a penicillin allergy.'
      },
      {
        id: 'clarithromycin',
        name: 'Clarithromycin',
        info: 'For 5 days plus self-care for patients with penicillin allergy.'
      },
      {
        id: 'erythromycin',
        name: 'Erythromycin',
        info: 'For 5 days plus self-care if the patient is pregnant.'
      }
    ],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral_after_treatment',
    previousNodeId: 'decision_4_5',
    actions: [
      {
        id: 'penicillinAllergyCheck',
        label: 'Reported penicillin allergy (via National Care Record or Patient/Carer)'
      },
      { id: 'pregnancyTest', label: 'Pregnancy Test Completed' }
    ],
    nextNodeId: 'consultation_summary'
  },
  onward_referral_after_treatment: {
    id: 'onward_referral_after_treatment',
    type: 'stop',
    content:
      'If symptoms do not improve after completion of the treatment course, consider onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'treatment_decision'
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content:
      'Summarize the consultation, including any advice given, treatments prescribed, and the safety-netting information shared with the patient. Document any decisions made regarding the management of acute sore throat.',
    previousNodeId: 'self_care_0_1' // This needs to be dynamic based on the actual flow of the decision tree
    // No nextNodeId needed as this is a terminal node.
  }
  // Additional safety-netting advice or follow-up actions can be included here as needed.
}

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
      'Meningitis (neck stiffness, photophobia, mottled skin)',
      'Encephalitis (disorientation, changes in behaviour)',
      'Myelitis (muscle weakness, loss of bladder or bowel control)',
      'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)',
      "Shingles in the ophthalmic distribution (Hutchinson's sign, visual symptoms, unexplained red eye)",
      'Shingles in severely immunosuppressed patient',
      'Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell'
    ],
    noneOption: {
      text: 'None of the above', // This option, when selected, will deselect all other options and vice versa
      action: 'untickAll' // Indicates the action to be taken when this option is selected
    },
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
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'criteria_confirmation'
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteria',
    componentType: 'criteriaChecklist',
    content: 'Please confirm the patient meets the following criteria for the Shingles pathway:',
    criteria: ['For adults aged 18 years and over', 'Exclude: pregnant individuals'],
    nextNodeIdIfTrue: 'risk_assessment',
    nextNodeIdIfFalse: 'exclusion_criteria_met',
    previousNodeId: 'root'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'component',
    componentType: 'criteriaChecklist',
    content:
      'Consider the risk of deterioration or serious illness. Check for serious complications such as Meningitis, Encephalitis, Myelitis, Facial nerve paralysis, or Shingles in specific conditions. Select "None" if no serious complications are suspected.',
    criteria: [
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
    minRequired: 0, // Minimum number of criteria that must be selected for the node to be considered passed
    nextNodeIdIfPassed: 'clinical_features_check',
    nextNodeIdIfFailed: 'emergency_referral',
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
    type: 'question',
    componentType: 'criteriaChecklist',
    content:
      'Does the patient follow the typical progression of Shingles clinical features? Refer to NHS.UK for images of Shingles.',
    context_list: [
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
    nextNodeIdIfYes: 'treatment_criteria_check',
    nextNodeIdIfNo: 'alternative_diagnosis',
    previousNodeId: 'risk_assessment'
  },
  alternative_diagnosis: {
    id: 'alternative_diagnosis',
    type: 'stop',
    content: 'Shingles less likely. Consider alternative diagnosis and proceed appropriately.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
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
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'treatment_criteria_check'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'If symptoms worsen or do not improve, consider onward referral. For immunosuppressed patients, notify the GP.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
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

const uncomplicatedUrinaryTractInfectionDecisionTree = {
  id: 'root',
  type: 'opening',
  // content: 'Acute Otitis Media Decision Tree',
  title: 'Uncomplicated Urinary Tract Infection',
  icon: 'noto:test-tube',
  notices: [
    {
      text: 'Individuals operating under this PGD must be assessed as competent or complete a self-declaration of competence to operate under this PGD'
    },
    {
      text: 'The decision to supply any medication rests with the individual registered health professional who must abide by the PGD and any associated organisational policies.'
    }
  ],
  clinical_situations: `Lower urinary tract infection (UTI) in non-pregnant women aged 16
  years to 64 years in the absence of current or recent fever (within past
  48 hours)`,
  useful_links: [
    {
      text: 'Urinary tract infection diagnosis',
      link: 'https://www.gov.uk/government/publications/urinary-tract-infection-diagnosis'
    },
    {
      text: 'Supply of Nitrofurantoin',
      link: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN01010-1a.-Urinary-tract-infection-nitrofurantoin-patient-group-direction-Pharmacy-First.pdf'
    }
  ],
  dates_of_validity: '31/01/2024 to 30/01/2027',
  previousNodeId: null,
  nextNodeId: 'criteria_met'
}

uncomplicatedUrinaryTractInfectionDecisionTree.nodes = {
  root: {
    ...uncomplicatedUrinaryTractInfectionDecisionTree
  },
  criteria_met: {
    id: 'criteria_met',
    type: 'criteria',
    content: 'Does the patient meets the inclusion criteria for the Uncomplicated Urinary Tract Infection pathway?',
    inclusion: ['women aged 16 to 64 years with suspected lower UTIs'],
    exclusion: [
      'pregnant individuals',
      'urinary catheter',
      'recurrent UTI (2 episodes in last 6 months',
      '3 episodes in last 12 months'
    ],
    nextNodeIdIfTrue: 'risk_assessment',
    nextNodeIdIfFalse: 'exclusion_criteria_met',
    previousNodeId: 'criteria_confirmation'
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Uncomplicated Urinary Tract Infection pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'criteria_met'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'information',
    title: 'General Risk Assessment',
    content:
      'The next set of question consider the risk of deterioration or serious illness. Assess for typical clinical features of UTI. Is there a risk of deterioration or serious illness',
    context:
      'Consider the risk of deterioration or serious illness. Assess for typical clinical features of UTI. Is there a risk of deterioration or serious illness?',
    symptoms: [],
    // answers: ['Yes', 'No'],
    nextNodeIdIfYes: 'NEWS2_check',
    nextNodeIdIfNo: 'risk_assessment_pylonephritis',
    previousNodeId: 'criteria_met',
    nextNodeId: 'risk_assessment_pylonephritis'
  },
  risk_assessment_pylonephritis: {
    id: 'risk_assessment_pylonephritis',
    type: 'symptoms',
    // componentType: 'criteriaChecklist',
    title: 'Pyelonephritis Risk Assessment',
    content: 'Consider the risk of deterioration or serious illness. Check for signs of pyelonephritis.',
    symptoms: [
      'Kidney pain/tenderness in back under ribs',
      'New/different myalgia, flu like illness',
      'Shaking chills (rigors) or temperature 37.9°C or above',
      'Nausea/vomiting'
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    // minRequired: 1,
    nextNodeIdIfYes: 'emergency_referral',
    nextNodeIdIfNo: 'risk_assessment_other',
    previousNodeId: 'risk_assessment'
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
  NEWS2_check: {
    id: 'NEWS2_check',
    type: 'stop',
    content:
      'Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'risk_assessment'
  },
  risk_assessment_other: {
    id: 'risk_assessment_other',
    type: 'symptoms',
    componentType: 'criteriaChecklist',
    title: 'Additional Risk Assessment',
    content: 'Does the patient have ANY of the following:',

    symptoms: [
      'Vaginal discharge: 80% do not have UTI (treat over the counter if signs and symptoms of thrush)',
      'Urethritis: inflammation post sexual intercourse, irritants',
      'Check sexual history to exclude sexually transmitted infections',
      'Check for signs and symptoms of pregnancy- ask about missed or lighter periods- carry out a pregnancy test if unsure',
      'Genitourinary syndrome of menopause (vulvovaginal atrophy)',
      'Is the patient immunosuppressed?'
    ],
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 1,
    nextNodeIdIfYes: 'onward_referral',
    nextNodeIdIfNo: 'gateway_point',
    previousNodeId: 'risk_assessment_pylonephritis'
  },
  onward_referral: {
    id: 'onward_referral',
    type: 'stop',
    content:
      'If symptoms worsen rapidly or significantly at any time, or do not improve after completion of treatment course, consider onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'risk_assessment_other'
  },
  gateway_point: {
    id: 'gateway_point',
    type: 'gateway',
    content: 'You have reached the gateway point. Now you can assess the patient for treatment.',
    nextNodeIdIfYes: 'treatment_criteria_check',
    nextNodeId: 'symptoms_check',
    previousNodeId: 'risk_assessment_other'
  },
  symptoms_check: {
    id: 'symptoms_check',
    type: 'multiple_choice_question',
    title: 'Symptoms Check',
    content: 'Does the patient have any of the following symptoms?',
    context_list: [
      'Dysuria (burning pain when passing urine)',
      'New nocturia (needing to pass urine in the night)',
      'Urine cloudy to the naked eye (visual inspection by pharmacist if practicable)'
    ],

    answers: [
      { text: 'No symptoms', action: 'other_symptoms_check' },
      { text: '1 symptom', action: 'uti_unclear' },
      { text: '2 or 3 symptoms', action: 'shared_decision_making' }
    ],
    previousNodeId: 'gateway_point'
  },
  other_symptoms_check: {
    id: 'other_symptoms_check',
    type: 'symptoms',
    content: 'Check for other symptoms of UTI.',
    symptoms: [
      'Frequency (needing to pass urine more often than usual)',
      'Urgency (needing to rush to the toilet to pass urine)',
      'Suprapubic pain (pain in the lower abdomen, above the pubic bone)',
      'Visible Haematuria (blood in the urine)',
      'Suprapubic tenderness (pain on palpation of the lower abdomen, above the pubic bone)',
      'Flank pain (pain in the back, below the ribs)'
    ],
    nextNodeIdIfYes: 'uti_unclear',
    nextNodeIdIfNo: 'uti_unlikely',
    previousNodeId: 'symptoms_check'
  },
  uti_unclear: {
    id: 'uti_unclear',
    type: 'information',
    content: 'UTI is unclear. Consider other causes of symptoms and proceed appropriately.',
    nextNodeId: 'onward_referral_2',
    previousNodeId: 'symptoms_check'
  },
  onward_referral_2: {
    id: 'onward_referral_2',
    type: 'stop',
    content:
      'If symptoms worsen rapidly or significantly at any time, or do not improve after completion of treatment course, consider onward referral to General Practice or other provider as appropriate.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'uti_unclear'
  },
  uti_unlikely: {
    id: 'uti_unlikely',
    type: 'information',
    content: 'UTI is unlikely. Consider other causes of symptoms and proceed appropriately.',
    nextNodeId: 'self_care_advice',
    previousNodeId: 'symptoms_check'
  },
  self_care_advice: {
    id: 'self_care_advice',
    type: 'advice',
    title: 'Self-care Advice',
    content: 'Share self-care and safety-netting advice. Recommend pain management and inform about UTI.',
    nextNodeId: 'comments',
    previousNodeId: 'uti_unlikely'
  },
  shared_decision_making: {
    id: 'shared_decision_making',
    type: 'multiple_choice_question',
    content:
      'Shared decision making approach using TARGET UTI resources, in patients that describe their symptoms  as mild consider paint relief and self care as first line, as paitnet to return to pharmacy if no improvement after 48 hours.',
    answers: [
      {
        text: 'Mild symptoms: Self-care and pain relief. Ask patient to return if no improvement within 3-5 days. t',
        action: 'self_care_advice_mild'
      },
      { text: 'Severe symptoms: Offer immediate antibiotic treatment.', action: 'treatment_decision' }
    ],
    previousNodeId: 'symptoms_check'
  },
  comments: {
    id:'comments',
    type:'comments',
    title: 'Additional comments about actions taken',
    nextNodeId: 'consultation_summary'
  },
  treatment_decision: {
    id: 'treatment_decision',
    type: 'treatment',
    content:
      'Treatment options based on the severity of symptoms and specific patient criteria. Consider antibiotics if symptoms do not improve after pharmacist reassessment or for severe cases initially.',
    treatments: [
      {
        id: 'Nitrofurantoin',
        name: 'Nitrofurantoin',
        info: ', offer nitrofurantoin for 3 days (subject to inclusion/exclusion criteria in  PGD) plus self-care'
      }
    ],
    nextNodeIdIfYes: 'consultation_summary',
    nextNodeIdIfNo: 'onward_referral_after_treatment',
    previousNodeId: 'root',
    nextNodeId: 'self_care_advice'
  },
  self_care_advice_mild: {
    id: 'self_care_advice_mild',
    type: 'information',
    title: 'Self-care Advice',
    content:
      'FOR ALL PATIENTS: If symptoms worsen rapidly or significantly at any time, OR do not improve in 48 hours of taking antibiotics. Use TARGET UTI leaflet',
    nextNodeId: 'comments',
    previousNodeId: 'uti_unlikely'
  },
  consultation_summary: {
    id: 'consultation_summary',
    type: 'summary',
    content: 'This concludes the UTI pathway.',
    previousNodeId: 'root' // This should be dynamic based on the actual flow
    // No nextNodeId needed as this is a terminal node.
  }
}

export const infectedInsectBitesDecisionTree = {
  id: 'root',
  type: 'information',
  content: 'Infected Insect Bites Decision Tree',
  information: 'Consider the risk of deterioration or serious illness. Assess for typical clinical features of UTI.',
  nextNodeIdIfTrue: 'criteria_met',
  nextNodeIdIfFalse: 'exclusion_criteria_met',
  nextNodeId: 'criteria_confirmation',
  previousNodeId: null
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
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'root'
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteria',
    content: 'Please confirm the patient meets the following criteria for the Infected Insect Bites pathway:',
    criteria: ['For adults and children aged 1 year and over', 'Exclude: pregnant individuals under 16 years'],
    nextNodeIdIfTrue: 'risk_assessment',
    nextNodeIdIfFalse: 'exclusion_criteria_met',
    previousNodeId: 'root'
  },
  risk_assessment: {
    id: 'risk_assessment',
    type: 'component',
    componentType: 'criteriaChecklist',
    content:
      'Consider the risk of deterioration or serious illness. Check for signs of systemic hypersensitivity reaction, anaphylaxis, severe immunosuppression, risk of airway obstruction, or orbital cellulitis. Select "None" if no serious risks are identified.',
    criteria: [
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
    nextNodeIdIfPassed: 'emergency_referral',
    nextNodeIdIfFailed: 'clinical_features_check',
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
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient meet any of the following criteria related to insect bites?',
    criteria: [
      { text: 'Bite or scratch caused by animals', required: false },
      { text: 'Bite caused by humans', required: false },
      { text: 'Bite caused by tick in the UK and signs of Lyme disease', required: false },
      { text: 'Bite or sting occurred while traveling outside of the UK', required: false },
      { text: 'Bite or sting caused by an unusual or exotic insect', required: false },
      { text: 'None of the above', required: false, action: 'untickAll' }
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
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'itch_principal_symptom_check'
  },
  acute_symptoms_check: {
    id: 'acute_symptoms_check',
    type: 'component',
    componentType: 'criteriaChecklist',
    content: 'Does the patient have acute onset of ≥3 of the following symptoms of an infected insect bite?',
    criteria: [
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
      { text: 'None of the above', required: false, action: 'untickAll' }
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

export const DecisionTrees = {
  Earache: acuteOtitisMediaDecisionTree,
  Sinusitis: acuteSinusitisDecisionTree,
  Sore_Throat: acuteSoreThroatDecisionTree,
  Impetigo: impetigoDecisionTree,
  Shingles: shinglesDecisionTree,
  UTI: uncomplicatedUrinaryTractInfectionDecisionTree,
  Infected_Insect_Bites: infectedInsectBitesDecisionTree
}
