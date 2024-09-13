const minorAilmentsServiceDefinition = {
  name: 'Minor Ailments Service',
  startNode: 'patientEligibility',
  nodes: {
    patientEligibility: {
      id: 'patientEligibility',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Confirm patient eligibility:',
        options: [
          'Registered with an Isle of Wight GP',
          'Present in the pharmacy (for a child under 16, parent or guardian must also be present)',
          'Exempt from prescription charges',
          'Currently suffering from a minor ailment that is included in the service specification',
          'Has agreed to share service outcome information with their registered GP'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'minorAilmentSelection' : 'gatewayNotMet')
    },
    gatewayNotMet: {
      id: 'gatewayNotMet',
      field: {
        type: 'custom',
        component: 'GateWayNotMet',
        question: 'Patient does not meet the eligibility criteria for this service.',
        required: false
      },
      next: () => 'reviewComponent',
      isStopNode: true
    },
    minorAilmentSelection: {
      id: 'minorAilmentSelection',
      field: {
        type: 'select',
        question: 'Select the minor ailment:',
        options: [
          'Constipation',
          'Headlice',
          'Dyspepsia',
          'Insect bites and stings',
          'Diarrhoea',
          'Mouth ulcers',
          'Haemorrhoids',
          'Nappy rash',
          'Allergic rhinitis/Hayfever',
          'Vaginal thrush',
          'Oral thrush adult and paediatric',
          'Sore throat',
          'Minor burns and scalds',
          'Viral upper respiratory tract infection',
          'Conjunctivitis',
          'Headache',
          'Earwax',
          'Musculoskeletal pain & soft tissue injury',
          'Paediatric teething',
          'Athletes foot',
          'Paediatric fever',
          'Cold sores',
          'Threadworm',
          'Contact dermatitis',
          'Fungal skin infection'
        ],
        required: true
      },
      next: () => 'consultationDetails'
    },
    consultationDetails: {
      id: 'consultationDetails',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Consultation details:',
        options: [
          'Discussed nature and duration of symptoms',
          'Reviewed concurrent medication and medical conditions',
          'Excluded serious disease/alarm/red flag symptoms'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'treatmentDecision'
    },
    treatmentDecision: {
      id: 'treatmentDecision',
      field: {
        type: 'select',
        question: 'Select the treatment decision:',
        options: [
          'Advice only',
          'Advice and supply of medication',
          'Referral non-urgent appointment, with or without supply of medication where appropriate',
          'Urgent referral'
        ],
        required: true
      },
      next: answer => {
        if (answer === 'Urgent referral') {
          return 'referralComponent'
        } else if (
          answer === 'Advice and supply of medication' ||
          answer === 'Referral non-urgent appointment, with or without supply of medication where appropriate'
        ) {
          return 'medicationSupply'
        }
        return 'adviceProvided'
      }
    },
    medicationSupply: {
      id: 'medicationSupply',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Enter medication supply details:',
        required: true,
        predefinedOptions: [] // Add medications from Pharmacy First Formulary here
      },
      next: () => 'adviceProvided'
    },
    adviceProvided: {
      id: 'adviceProvided',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Advice provided to the patient:',
        options: [
          'Expected duration of symptoms – whats normal duration etc.',
          'Self-care messages',
          'What patients can do for themselves',
          'Provided service information stressing importance of making pharmacy first port of call for minor ailments',
          'When and where to go for further advice and the management of future minor ailments',
          'Anti-biotic use messages',
          'Provided printed information where appropriate'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 3 }
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
        question: 'Select consultation outcome:',
        required: true,
        consultationOutcomes: [
          { value: 'ADVICE_ONLY', label: 'Advice given only' },
          { value: 'OTC_MEDICINE_SALE', label: 'Sale of an Over the Counter (OTC) medicine' },
          { value: 'MAS_REFERRAL', label: 'Referral into a pharmacy local minor ailments service (MAS)' },
          {
            value: 'LOCAL_COMMISSIONED_REFERRAL',
            label: 'Referral into an appropriate locally commissioned NHS service'
          },
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

export default minorAilmentsServiceDefinition
