export const uncomplicatedUrinaryTractInfectionDecisionTree = {
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
  nextNodeId: 'criteria_confirmation'
}

uncomplicatedUrinaryTractInfectionDecisionTree.nodes = {
  root: {
    ...uncomplicatedUrinaryTractInfectionDecisionTree
  },
  criteria_confirmation: {
    id: 'criteria_confirmation',
    type: 'criteriaCheck',
    content: 'Does the patient meets the inclusion criteria for the Uncomplicated Urinary Tract Infection pathway?',
    inclusion: ['women aged 16 to 64 years with suspected lower UTIs'],
    exclusion: [
      'pregnant individuals',
      'urinary catheter',
      'recurrent UTI (2 episodes in last 6 months',
      '3 episodes in last 12 months'
    ],
    criteria:[
      {text: 'The patient is a woman aged 16 to 64 years with', required: true, response:null},
      {text: 'The patient has suspected lower UTIs', required: true, response:null},
      {text: 'The patient is not pregnant', required: true, response:null},
      {text: 'The patient does not have a urinary catheter', required: true, response:null},
      {text: 'The patient does not have recurrent UTI (2 episodes in last 6 months or 3 episodes in last 12 months)', required: true, response:null}
    ],
    passResponse:'Yes',
    nextNodeIdIfPassed: 'risk_assessment',
    nextNodeIdIfFailed: 'exclusion_criteria_met',
    previousNodeId: 'criteria_confirmation'
  },
  exclusion_criteria_met: {
    id: 'exclusion_criteria_met',
    type: 'stop',
    content: 'The patient does not meet the inclusion criteria for the Uncomplicated Urinary Tract Infection pathway.',
    nextNodeIdIfYes: 'comments',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'criteria_confirmation'
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
    previousNodeId: 'criteria_confirmation',
    nextNodeId: 'risk_assessment_pylonephritis'
  },
  risk_assessment_pylonephritis: {
    id: 'risk_assessment_pylonephritis',
    type: 'symptoms',
    // componentType: 'criteriaChecklist',
    title: 'Pyelonephritis Risk Assessment',
    content: 'Consider the risk of deterioration or serious illness. Check for signs of pyelonephritis.',
    symptoms: [
      // 'Kidney pain/tenderness in back under ribs',
      // 'New/different myalgia, flu like illness',
      // 'Shaking chills (rigors) or temperature 37.9°C or above',
      // 'Nausea/vomiting'
      {text: 'Kidney pain/tenderness in back under ribs', required: false, response:null},
      {text: 'New/different myalgia, flu like illness', required: false, response:null},
      {text: 'Shaking chills (rigors) or temperature 37.9°C or above', required: false, response:null},
      {text: 'Nausea/vomiting', required: false, response:null}
    ],
    passResponse: 'No',
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
      // 'Vaginal discharge: 80% do not have UTI (treat over the counter if signs and symptoms of thrush)',
      // 'Urethritis: inflammation post sexual intercourse, irritants',
      // 'Check sexual history to exclude sexually transmitted infections',
      // 'Check for signs and symptoms of pregnancy- ask about missed or lighter periods- carry out a pregnancy test if unsure',
      // 'Genitourinary syndrome of menopause (vulvovaginal atrophy)',
      // 'Is the patient immunosuppressed?'
      {text: 'Vaginal discharge: 80% do not have UTI (treat over the counter if signs and symptoms of thrush)', required: false, response:null},
      {text: 'Urethritis: inflammation post sexual intercourse, irritants', required: false, response:null},
      {text: 'Check sexual history to exclude sexually transmitted infections', required: false, response:null},
      {text: 'Check for signs and symptoms of pregnancy- ask about missed or lighter periods- carry out a pregnancy test if unsure', required: false, response:null},
      {text: 'Genitourinary syndrome of menopause (vulvovaginal atrophy)', required: false, response:null},
      {text: 'Is the patient immunosuppressed?', required: false, response:null}
    ],
    passResponse: 'No',
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
    type: 'countBased',
    title: 'Symptoms Check',
    content: 'Does the patient have any of the following symptoms?',
    questions: [
      // 'Dysuria (burning pain when passing urine)',
      // 'New nocturia (needing to pass urine in the night)',
      // 'Urine cloudy to the naked eye (visual inspection by pharmacist if practicable)'
      {text: 'Dysuria (burning pain when passing urine)', required: false, response:null},
      {text: 'New nocturia (needing to pass urine in the night)', required: false, response:null},
      {text: 'Urine cloudy to the naked eye (visual inspection by pharmacist if practicable)', required: false, response:null}
    ],
    countOption:'Yes',
    countText:'Symptoms',
    nextNodeMap:{
      0:'other_symptoms_check',
      1:'uti_unclear',
      2:'shared_decision_making',
      3:'shared_decision_making'
    },
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
      // 'Frequency (needing to pass urine more often than usual)',
      // 'Urgency (needing to rush to the toilet to pass urine)',
      // 'Suprapubic pain (pain in the lower abdomen, above the pubic bone)',
      // 'Visible Haematuria (blood in the urine)',
      // 'Suprapubic tenderness (pain on palpation of the lower abdomen, above the pubic bone)',
      // 'Flank pain (pain in the back, below the ribs)'
      {text: 'Frequency (needing to pass urine more often than usual)', required: false, response:null},
      {text: 'Urgency (needing to rush to the toilet to pass urine)', required: false, response:null},
      {text: 'Suprapubic pain (pain in the lower abdomen, above the pubic bone)', required: false, response:null},
      {text: 'Visible Haematuria (blood in the urine)', required: false, response:null},
      {text: 'Suprapubic tenderness (pain on palpation of the lower abdomen, above the pubic bone)', required: false, response:null},
      {text: 'Flank pain (pain in the back, below the ribs)', required: false, response:null}
    ],
    passResponse: 'No',
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
    id: 'comments',
    type: 'comments',
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
