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
    passResponse: 'Yes',
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
      // 'Meningitis (neck stiffness, photophobia, mottled skin)',
      // 'Mastoiditis (pain, soreness, swelling, tenderness behind the affected ear(s))',
      // 'Brain abscess (severe headache, confusion or irritability, muscle weakness)',
      // 'Sinus thrombosis (headache behind or around the eyes)',
      // 'Facial nerve paralysis'
      {text: 'Meningitis (neck stiffness, photophobia, mottled skin)', required: true, response:null},
      {text: 'Mastoiditis (pain, soreness, swelling)', required: true, response:null},
      {text: 'Brain abscess (severe headache)', required: true, response:null},
      {text: 'Sinus thrombosis (headache)', required: true, response:null},
      {text: 'Facial nerve paralysis', required: true, response:null}
    ],
    passResponse: 'No',
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
    type: 'countBased',
    content: 'Does the patient have acute onset of symptoms:',
    questions: [
      // 'In older children—earache',
      // 'In younger children—holding, tugging, or rubbing of the ear',
      // 'In younger children: non-specific symptoms such as fever, crying, poor feeding, restlessness, behavioural changes, cough, or rhinorrhoea'
    {text: 'In older children—earache', required: true, response:null},
    {text: 'In younger children—holding, tugging, or rubbing of the ear', required: true, response:null},
    {text: 'In younger children: non-specific symptoms such as fever, crying, poor feeding, restlessness, behavioural changes, cough, or rhinorrhoea', required: true, response:null}
    ],
    countText: 'Acute symptoms',
    countOption:'Yes',
    nextNodeMap:{
      0: 'alternative_diagnosis_advice',
      1: 'otoscopic_examination',
      2: 'otoscopic_examination',
      3: 'otoscopic_examination'
    },
    passResponse: 'Yes',
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
      // 'Systemically very unwell',
      // 'Signs of a more serious illness',
      // 'High risk of complications due to pre-existing comorbidity'
      {text: 'Systemically very unwell', required: true, response:null},
      {text: 'Signs of a more serious illness', required: true, response:null},
      {text: 'High risk of complications due to pre-existing comorbidity', required: true, response:null}
    ],
    passResponse: 'No',
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
    id: 'comments',
    type: 'comments',
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
