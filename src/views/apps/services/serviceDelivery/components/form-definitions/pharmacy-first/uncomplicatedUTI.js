const utiServiceDefinition = {
  name: 'Urinary Tract Infection (UTI) Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Confirm the following inclusion criteria:',
        options: [
          'Non-pregnant female aged 16-64 years',
          'No nitrofurantoin use in the past 3 months',
          'Not severely immunosuppressed',
          'Not pregnant or breastfeeding',
          'No history of raised temperature, fever, or chills within the past 48 hours',
          'No symptoms of severe/life-threatening infection or systemic sepsis',
          'No complicated UTI (associated with structural or functional abnormality)',
          'No known previous nitrofurantoin-resistant UTI'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'initialAssessment' : 'gatewayNotMet')
    },
    gatewayNotMet: {
      id: 'gatewayNotMet',
      field: {
        type: 'custom',
        component: 'GateWayNotMet',
        question: 'Patient does not meet the inclusion criteria for this service.',
        required: false
      },
      next: () => 'referralComponent',
      isStopNode: true
    },
    initialAssessment: {
      id: 'initialAssessment',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for urinary signs and symptoms:',
        options: [
          'Dysuria (burning pain when passing urine)',
          'New nocturia (needing to pass urine in the night)',
          'Urine cloudy to the naked eye'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => {
        const symptomCount = Object.values(answer).filter(v => v).length
        if (symptomCount === 0) {
          return 'utiLessLikely'
        } else if (symptomCount === 1) {
          return 'referralComponent'
        } else {
          return 'deteriorationRisk'
        }
      }
    },
    utiLessLikely: {
      id: 'utiLessLikely',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'UTI is less likely. Provide the following advice:',
        options: [
          'Consider alternative diagnosis',
          'Provide self-care and pain relief advice',
          'Advise to seek medical help if symptoms worsen or persist'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'chooseOutcome'
    },
    deteriorationRisk: {
      id: 'deteriorationRisk',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for risk of deterioration or serious illness:',
        options: [
          'Kidney pain/tenderness in the back under ribs',
          'New/different myalgia, flu-like illness',
          'Shaking chills (rigors) or temperature 37.9°C or above',
          'Nausea or vomiting'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'news2Calculator' : 'additionalChecks')
    },
    news2Calculator: {
      id: 'news2Calculator',
      field: {
        type: 'custom',
        component: 'NEWS2Calculator',
        question: 'Calculate NEWS2 Score',
        required: true
      },
      next: () => 'referralComponent'
    },
    additionalChecks: {
      id: 'additionalChecks',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for additional symptoms:',
        options: ['Urgency', 'Frequency', 'Visible haematuria', 'Suprapubic pain/tenderness'],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'referralComponent' : 'confirmDiagnosis')
    },
    confirmDiagnosis: {
      id: 'confirmDiagnosis',
      field: {
        type: 'radio',
        question: 'Based on the assessment, do you confirm the diagnosis of UTI?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'treatmentPlan' : 'chooseOutcome')
    },
    treatmentPlan: {
      id: 'treatmentPlan',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe nitrofurantoin:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '3231511000001101',
            drugDescription: 'Nitrofurantoin 100mg modified-release capsules',
            drugDose: 'Take one capsule twice daily for 3 days',
            quantitySupplied: 6,
            medicationSupplyType: 'PGD'
          },
          {
            drugCode: '3231611000001102',
            drugDescription: 'Nitrofurantoin 50mg tablets',
            drugDose: 'Take one tablet four times daily for 3 days',
            quantitySupplied: 12,
            medicationSupplyType: 'PGD'
          }
        ]
      },
      next: () => 'safetyNetting'
    },
    safetyNetting: {
      id: 'safetyNetting',
      field: {
        type: 'checkbox',
        question: 'Safety netting advice provided:',
        options: [
          'Shared self-care and safety-netting advice using TARGET UTI leaflet',
          'Advised to drink plenty of fluids to keep urine pale in color',
          'Recommended paracetamol or NSAIDs such as ibuprofen for pain relief',
          'Advised to avoid OTC cystitis preparations containing potassium citrate or sodium bicarbonate during nitrofurantoin treatment',
          'Advised to return if symptoms worsen rapidly or significantly at any time',
          'Advised to seek help if symptoms do not improve after completion of the 3-day treatment course'
        ],
        required: true
      },
      next: () => 'chooseOutcome'
    },
    referralComponent: {
      id: 'referralComponent',
      field: {
        type: 'custom',
        component: 'ReferralComponent',
        question: 'Complete Referral',
        options: [''],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: () => 'chooseOutcome'
    },
    chooseOutcome: {
      id: 'chooseOutcome',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Choose Consultation Outcome',
        required: true,
        consultationOutcomes: [
          { value: 'ADVICE_ONLY', label: 'Advice given only' },
          { value: 'OTC_MEDICINE_SALE', label: 'Sale of an Over the Counter (OTC) medicine' },
          { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines supply / non-supply' },
          { value: 'ONWARD_REFERRAL', label: 'Onward referral to another CPCS pharmacy' },
          { value: 'NON_URGENT', label: 'Non-urgent signposting to another service' },
          { value: 'URGENT', label: 'Urgent escalation to another service' },
          { value: 'OTHER', label: 'Other (please specify)' }
        ]
      },
      next: () => 'reviewComponent'
    },
    reviewComponent: {
      id: 'reviewComponent',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Review your answers:',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default utiServiceDefinition
