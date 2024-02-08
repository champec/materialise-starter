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
      { text: 'The patient is aged 5 years or older.', required: true, response: null },
      { text: 'Informed consent ', required: true, response: null },
      {
        text: 'You will: Diagnose sore throat using the appropriate NICE guidance and FeverPAIN score.',
        required: true,
        response: null
      }
    ],
    allOption: {
      text: 'All of the above',
      action: 'tickAll'
    },
    noneOption: {
      text: 'None of the above',
      action: 'untickAll'
    },
    minRequired: 3, // Specifies the minimum number of checkboxes (excluding the 'None' option) that need to be ticked to proceed
    passResponse: 'Yes',
    nextNodeIdIfPassed: 'risk_assessment',
    nextNodeIdIfFailed: 'exclusion_criteria_met',
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
    title: 'Assess the risk of deterioration',
    context:
      'Consider the risk of deterioration or serious illness. Check for suspected Epiglottitis (4Ds: dysphagia, dysphonia, drooling, distress), severe complications (like clinical dehydration, pharyngeal abscess), and stridor.',
    symptoms: [
      { text: 'Severe complications suspected (such as clinical dehydration, signs of pharyngeal abscess)', required: true, response: null},
      { text: 'Stridor (noisy or high pitched sound with breathing)', required: true, response: null},
      { text: 'Suspected Epiglottitis, does the patient show sign of dysphagia ?', required: true, response: null},
      { text: 'Suspected Epiglotitis, does the patient show sign of dysphonia ?', required: true, response: null},
      { text: 'Suspected Epiglotitis, does the patient show sign of drooling ?', required: true, response: null},
      { text: 'Suspected Epiglotitis, does the patient show sign of distress ?', required: true, response: null}
    ],
    passResponse: 'No',
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
    title: 'Differential diagnosis',
    context:
      'Check for signs or symptoms indicating possible scarlet fever, quinsy, glandular fever, suspected cancer, or if the patient is immunosuppressed.',
    symptoms: [

      { text: 'Signs or symptoms indicating possible scarlet fever, quinsy or glandular fever', required: true, response: null },
      { text: 'Signs and symptoms of suspected cancer', required: true, response: null },
      { text: 'Patient is immunosuppressed', required: true, response: null }

    ],
    passResponse: 'No',
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
    passResponse: 'No',
    nextNodeIdIfNo: 'treatment_decision',
    previousNodeId: 'further_assessment'
  },
  feverpain_score: {
    id: 'feverpain_score',
    type: 'countBased',
    title: 'Fever Pain Score Calculation',
    content:
      'Use FeverPAIN Score to assess the patient. Assign 1 point for each: Fever over 38°C, Purulence, First attendance within 3 days, Severely inflamed tonsils, No cough or coryza.',
    questions: [
      { text: 'Fever over 38°C', required: true, response: null },
      { text: 'Purulence', required: true, response: null },
      { text: 'First attendance within 3 days', required: true, response: null },
      { text: 'Severely inflamed tonsils', required: true, response: null },
      { text: 'No cough or coryza', required: true, response: null }
    ],
    previousNodeId: 'further_assessment',
    countText: 'FeverPAIN Score',
    countOption:'Yes',
    nextNodeMap: {
      0: 'self_care_0_1',
      1: 'self_care_0_1',
      2: 'self_care_2_3',
      3: 'self_care_2_3',
      4: 'decision_4_5',
      5: 'decision_4_5'
    }
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
