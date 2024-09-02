import drugChoices from './drugChoices'

const contraceptionInitiationServiceDefinition = {
  name: 'NHS Community Pharmacy Contraception Service - Initiation',
  startNode: 'initiationReason',
  nodes: {
    initiationReason: {
      id: 'initiationReason',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Select the reason for initiation:',
        required: true,
        consultationOutcomes: [
          { value: 'INITIATION_ORAL_FIRST_TIME', label: 'Initiation of oral contraception - First time pill user' },
          {
            value: 'RE_INITIATION_BEEN_BEFORE',
            label: 'Re-initiation of oral contraception - has been on pill before'
          },
          { value: 'SWITCHING_ORAL', label: 'Switching oral contraception' }
        ]
      },
      next: () => 'includeExcludeCheck'
    },
    includeExcludeCheck: {
      id: 'includeExcludeCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check inclusion and exclusion criteria:',
        options: [
          'Individual is from menarche up to and including 54 years of age',
          'Not pregnant',
          'Not breastfeeding and less than 6 weeks post-partum',
          'No hypersensitivity to the active ingredient or any constituent of the product',
          'No acute porphyria',
          'No history of breast cancer',
          'No severe cirrhosis',
          'No benign or malignant liver tumor',
          'No current or history of venous or arterial thrombosis',
          'Not taking interacting medicines'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(Boolean) ? 'consentGiven' : 'notSuitableForService')
    },
    notSuitableForService: {
      id: 'notSuitableForService',
      field: {
        type: 'text',
        question: 'The patient is not suitable for this service. Please provide a reason:',
        required: true
      },
      next: () => null,
      isStopNode: true
    },
    consentGiven: {
      id: 'consentGiven',
      field: {
        type: 'radio',
        question: 'Has the patient given consent for the service and data sharing?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'biometricMeasurements' : 'noContinueToNextNode')
    },
    biometricMeasurements: {
      id: 'biometricMeasurements',
      field: {
        type: 'custom',
        component: 'BiometricMeasurements',
        question: 'Enter the biometric measurements:',
        required: true
      },
      next: () => 'prescriptionChoice'
    },
    prescriptionChoice: {
      id: 'prescriptionChoice',
      field: {
        type: 'custom',
        component: 'SimpleMedicineSelect',
        question: 'Choose the prescription based on clinical assessment:',
        required: true,
        predefinedOptions: drugChoices
      },
      next: answer => (Object.values(answer?.medications).length > 0 ? 'supplyDetails' : 'noSupplyReason')
    },
    noSupplyReason: {
      id: 'noSupplyReason',
      field: {
        type: 'radio',
        question: 'Select the reason for no supply:',
        options: [
          'A: Consent not given',
          'B: Individual under 16 years and not competent',
          'C: Individual over 16 years and lacks capacity to consent',
          'D: Known or suspected pregnancy',
          'E: Hypersensitivity to ingredients',
          'F: Less than 21 days after childbirth',
          'G: Less than 5 days after abortion, miscarriage, ectopic, or GTD',
          'H: Breastfeeding and less than 6 weeks postpartum',
          'I: Interacting medicines',
          'J: Cardiovascular disease related',
          'K: Neurological condition related',
          'L: Cancer related',
          'M: Gastro-intestinal condition related',
          'N: Other health conditions',
          'O: VTE risk concerns',
          'P: Blood pressure above target or BMI concerns',
          'Q: Outside PGD age range',
          'R: Oral contraception not covered by PGD',
          'S: Requires initiation of oral contraception',
          'T: Other'
        ],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'T' ? 'noSupplyReasonOther' : 'signpostEscalate')
    },
    noSupplyReasonOther: {
      id: 'noSupplyReasonOther',
      field: {
        type: 'text',
        question: 'Enter the other reason for no supply:',
        required: true
      },
      next: () => 'signpostEscalate'
    },
    supplyDetails: {
      id: 'supplyDetails',
      field: {
        type: 'custom',
        component: 'SupplyDetails',
        question: 'Enter the supply details:',
        required: true
      },
      next: () => 'signpostEscalate'
    },
    signpostEscalate: {
      id: 'signpostEscalate',
      field: {
        type: 'radio',
        question: 'Does the patient require signposting or escalation?',
        options: ['Signposting', 'Escalation', 'None required'],
        required: true,
        autoProgress: true
      },
      next: answer => {
        if (answer === 'Signposting') return 'signpostingDetails'
        else if (answer === 'Escalation') return 'escalationDetails'
        else return 'reviewSubmit'
      }
    },
    signpostingDetails: {
      id: 'signpostingDetails',
      field: {
        type: 'custom',
        component: 'SignpostingDetails',
        question: 'Enter the signposting details:',
        required: true
      },
      next: () => 'reviewSubmit'
    },
    escalationDetails: {
      id: 'escalationDetails',
      field: {
        type: 'custom',
        component: 'EscalationDetails',
        question: 'Enter the escalation details:',
        required: true
      },
      next: () => 'reviewSubmit'
    },
    reviewSubmit: {
      id: 'reviewSubmit',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Review and submit the consultation details',
        required: true
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default contraceptionInitiationServiceDefinition
