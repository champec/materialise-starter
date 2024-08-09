import { universalCPCSFormDefinition } from './universalCpcsform'

const shinglesServiceDefinition = {
  name: 'Shingles Service',
  startNode: 'eligibilityCheck',
  nodes: {
    ...universalCPCSFormDefinition.nodes,
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'radio',
        question: 'The patient is at least 18 years old and they are not preganant',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'riskOfDeterioration' : 'gateWayNotMet')
    },
    exclusionStop: {
      id: 'exclusionStop',
      field: {
        type: 'text',
        question: 'Patient is not eligible for this service. Please refer to appropriate care.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'eligibilityCheck'
    },
    gateWayNotMet: {
      id: 'gateWayNotMet',
      field: {
        type: 'custom',
        component: 'GateWayNotMet',
        question: 'Gate way not met',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'eligibilityCheck'
    },
    riskOfDeterioration: {
      id: 'riskOfDeterioration',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for risk of deterioration or serious illness:',
        options: [
          'Meningitis (neck stiffness, photophobia, mottled skin)',
          'Encephalitis (disorientation, changes in behaviour)',
          'Myelitis (muscle weakness, loss of bladder or bowel control)',
          'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)',
          'Shingles in the ophthalmic distribution',
          'Shingles in severely immunosuppressed patient',
          'Shingles in immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object?.values(answer)?.some(v => v) ? 'chooseOutcome' : 'clinicalFeatures')
    },
    chooseOutcome: {
      id: ' chooseOutcome',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Choose outcome',
        required: true,
        progressionCriteria: { type: 'any' },
        autoProgress: true
      },
      next: answer => {
        switch (answer) {
          case 'ADVICE_ONLY':
            return 'adviceDetails'
          case 'OTC_MEDICINE_SALE':
            return 'medicationSupplyDetails'
          case 'MAS_REFERRAL':
            return 'wouldYouLikeANewsScore'
          case 'LOCAL_COMMISSIONED_REFERRAL':
            return 'wouldYouLikeANewsScore'
          case 'SUPPLY_NO_SUPPLY':
            return 'medicationSupplyDetails'
          case 'ONWARD_REFERRAL':
            return 'wouldYouLikeANewsScore'
          case 'NON_URGENT':
            return 'signpostingDetails'
          case 'URGENT':
            return 'wouldYouLikeANewsScore'
          case 'OTHER':
            return 'otherOutcomeDetails'
          default:
            return 'additionalDetails'
        }
      }
    },
    medicationSupplyDetails: {
      id: 'medicationSupplyDetails',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Provide details of the medication supply:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '41983611000001105',
            drugDescription: 'Chloroquine sulfate 200mg tablets',
            drugDose: 'Take one at night',
            quantitySupplied: 20,
            medicationSupplyType: 'RX',
            provisionDate: '2024-01-01',
            patientExemptCode: 'A',
            vpid: '41983611000001105' // replace with actual apid
          }
          // Add more predefined options here
        ]
      },
      next: () => 'reviewComponent'
    },
    wouldYouLikeANewsScore: {
      id: 'wouldYouLikeANewsScore',
      field: {
        type: 'radio',
        question: 'Would you like to do a news score before referral?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => ({
        nextId: answer === 'Yes' ? 'news2Calculator' : 'referralComponent',
        data: { newsScore: answer }
      })
    },
    news2Calculator: {
      id: 'news2Calculator',
      field: {
        type: 'custom',
        component: 'NEWS2Calculator',
        question: 'Calculate news 2 score',
        options: [''],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => 'referralComponent'
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
      next: answer => 'reviewComponent'
    },
    reviewComponent: {
      id: 'reviewComponent',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Review your answers:',
        required: false
      },
      next: () => null, // End of the form
      isEndNode: true
    },

    // OLD COMPONENT
    urgentReferralStop: {
      id: 'urgentReferralStop',
      field: {
        type: 'text',
        question:
          'Urgent referral required. Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'riskOfDeterioration'
    },
    clinicalFeatures: {
      id: 'clinicalFeatures',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient follow typical progression of shingles clinical features:',
        options: [
          'Abnormal skin sensation and pain in the affected area (burning, stabbing, throbbing, itching, tingling)',
          'Rash appears within 2-3 days after the onset of pain',
          'Fever and/or headache may develop',
          'Rash appears as a group of red spots on a pink-red background which quickly turn into small fluid-filled blisters',
          'Blisters burst, fill with blood or pus, then slowly dry and form crusts/scabs',
          'Rash covers a well-defined area of skin on one side of the body only in a dermatomal distribution'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'rashOnsetCheck' : 'alternativeDiagnosis')
    },
    alternativeDiagnosis: {
      id: 'alternativeDiagnosis',
      field: {
        type: 'text',
        question: 'Shingles less likely. Consider alternative diagnosis and proceed appropriately.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'clinicalFeatures'
    },
    rashOnsetCheck: {
      id: 'rashOnsetCheck',
      field: {
        type: 'radio',
        question: 'Is the shingles rash within 72 hours of onset?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'treatmentCriteria72h' : 'rashOnsetCheck1Week')
    },
    treatmentCriteria72h: {
      id: 'treatmentCriteria72h',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Immunosuppressed',
          'Non-truncal involvement (shingles affecting the neck, limbs, or perineum)',
          'Moderate or severe pain',
          'Moderate or severe rash (defined as confluent lesions)',
          'Patient aged over 50 years'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'offerTreatment' : 'selfCareStop')
    },
    rashOnsetCheck1Week: {
      id: 'rashOnsetCheck1Week',
      field: {
        type: 'radio',
        question: 'Is the shingles rash up to one week after onset?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'treatmentCriteria1Week' : 'selfCareStop')
    },
    treatmentCriteria1Week: {
      id: 'treatmentCriteria1Week',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Immunosuppressed',
          'Continued vesicle formation',
          'Severe pain',
          'High risk of severe shingles (e.g. severe atopic dermatitis/eczema)',
          'Patient aged 70 years and over'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'offerTreatment' : 'selfCareStop')
    },
    offerTreatment: {
      id: 'offerTreatment',
      field: {
        type: 'radio',
        question: 'Offer treatment:',
        options: ['Aciclovir', 'Valaciclovir'],
        required: true
      },
      next: () => 'medication_supply'
    },
    selfCareStop: {
      id: 'selfCareStop',
      field: {
        type: 'text',
        question: 'Patient does not meet treatment criteria. Provide self-care advice and safety-netting information.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'rashOnsetCheck'
    },
    painManagement: {
      id: 'painManagement',
      field: {
        type: 'radio',
        question: 'Is pain management with over-the-counter medications effective?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'No' ? 'referForPainManagement' : 'safetyNetting')
    },
    referForPainManagement: {
      id: 'referForPainManagement',
      field: {
        type: 'text',
        question: 'Refer patient to general practice for further pain management.',
        required: false
      },
      next: () => 'safetyNetting'
    },
    safetyNetting: {
      id: 'safetyNetting',
      field: {
        type: 'checkbox',
        question: 'Safety netting advice provided:',
        options: [
          'Shared self-care and safety-netting advice using British Association of Dermatologists Shingles leaflet',
          'For pain management, recommended a trial of paracetamol, a NSAID such as ibuprofen, or co-codamol over the counter',
          'Advised to return if symptoms worsen rapidly or significantly at any time',
          'Advised to seek help if symptoms do not improve after completion of 7 days treatment course',
          "For immunosuppressed patients: Called patient's GP or sent urgent for action email if out of hours to notify supply of antiviral and request review by GP",
          'For immunosuppressed patients: Advised to attend A&E or call 999 if symptoms worsen rapidly, become systemically unwell, or if rash becomes severe or widespread',
          'Signposted eligible individuals to information and advice about receiving the shingles vaccine after recovery from this episode'
        ],
        required: true
      },
      next: () => 'completion'
    },
    completion: {
      ...universalCPCSFormDefinition.nodes.completion,
      field: {
        ...universalCPCSFormDefinition.nodes.completion.field,
        question: 'Shingles assessment and treatment completed. Any additional notes or observations?'
      }
    }
  }
}

export default shinglesServiceDefinition
