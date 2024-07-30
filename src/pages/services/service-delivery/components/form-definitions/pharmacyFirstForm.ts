import SymptomChecklist from '../CustomFormFiekds/SymptomChecklist'
import BloodPressureComponent from '../CustomFormFiekds/BloodPressureComponent'

const pharmacyFirstForm = {
  name: 'Pharmacy First Service',
  startNode: 'patientConsent',
  nodes: {
    patientConsent: {
      id: 'patientConsent',
      field: {
        type: 'radio',
        question: 'Has the patient given consent for this service?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'chiefComplaint' : 'noConsentStop'),
      hidden: false
    },
    noConsentStop: {
      id: 'noConsentStop',
      field: {
        type: 'text',
        question: "Patient hasn't given consent. Cannot continue with service delivery.",
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'patientConsent',
      hidden: false
    },
    chiefComplaint: {
      id: 'chiefComplaint',
      field: {
        type: 'text',
        question: "What is the patient's chief complaint?",
        required: true
      },
      next: () => 'duration',
      hidden: false
    },
    duration: {
      id: 'duration',
      field: {
        type: 'select',
        question: 'How long has the patient been experiencing these symptoms?',
        options: ['Less than 24 hours', '1-3 days', '4-7 days', 'More than a week'],
        required: true
      },
      next: answer => (answer === 'More than a week' ? 'gpReferral' : 'symptoms')
    },
    gpReferral: {
      id: 'gpReferral',
      field: {
        type: 'radio',
        question: "The patient's symptoms have persisted for over a week. Do you want to refer them to their GP?",
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'referralNotes' : 'symptoms')
    },
    referralNotes: {
      id: 'referralNotes',
      field: {
        type: 'text',
        question: 'Please provide notes for the GP referral:',
        required: true
      },
      next: () => null // End of form for GP referral
    },
    symptoms: {
      id: 'symptoms',
      field: {
        type: 'custom',
        question: 'Please select all applicable symptoms:',
        component: SymptomChecklist,
        required: true
      },
      next: () => 'temperature'
    },
    temperature: {
      id: 'temperature',
      field: {
        type: 'text',
        question: "What is the patient's temperature in °C?",
        required: true,
        validate: value => {
          const temp = parseFloat(value)
          if (isNaN(temp)) return 'Please enter a valid number'
          if (temp < 35 || temp > 42) return 'Temperature must be between 35°C and 42°C'
          return null
        }
      },
      next: answer => (parseFloat(answer) > 38 ? 'feverManagement' : 'bloodPressure')
    },
    feverManagement: {
      id: 'feverManagement',
      field: {
        type: 'text',
        question: 'The patient has a fever. What fever management advice have you provided?',
        required: true
      },
      next: () => 'bloodPressure'
    },
    bloodPressure: {
      id: 'bloodPressure',
      field: {
        type: 'custom',
        question: "Please enter the patient's blood pressure:",
        component: BloodPressureComponent,
        required: true
      },
      next: answer => {
        const [systolic, diastolic] = answer.split('/').map(Number)
        if (systolic > 140 || diastolic > 90) return 'highBloodPressure'
        return 'medication'
      }
    },
    highBloodPressure: {
      id: 'highBloodPressure',
      field: {
        type: 'radio',
        question: "The patient's blood pressure is high. Do you want to refer them to their GP?",
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'referralNotes' : 'medication')
    },
    medication: {
      id: 'medication',
      field: {
        type: 'text',
        question: 'What medication, if any, are you prescribing?',
        required: true
      },
      next: () => 'dosage'
    },
    dosage: {
      id: 'dosage',
      field: {
        type: 'text',
        question: 'What is the dosage and frequency of the medication?',
        required: true
      },
      next: () => 'followUp'
    },
    followUp: {
      id: 'followUp',
      field: {
        type: 'select',
        question: 'When should the patient follow up?',
        options: ['In 2-3 days', 'In a week', 'In two weeks', 'Only if symptoms persist'],
        required: true
      },
      next: () => 'additionalNotes'
    },
    additionalNotes: {
      id: 'additionalNotes',
      field: {
        type: 'text',
        question: 'Any additional notes or recommendations?',
        required: false
      },
      next: () => null // End of form
    }
  }
}

// -----
// UTI FORM
//-----

const utiServiceDefinition = {
  name: 'Uncomplicated Urinary Tract Infection Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Check for exclusion criteria:',
        options: [
          'Patient is pregnant',
          'Patient has a urinary catheter',
          'Patient has recurrent UTI (2 episodes in last 6 months, or 3 episodes in last 12 months)',
          'Patient is not a woman aged 16 to 64 years'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'exclusionStop' : 'riskOfDeterioration')
    },
    riskOfDeterioration: {
      id: 'riskOfDeterioration',
      field: {
        type: 'radio',
        question: `Consider the risk of deterioration or serious illness, Consider calculating NEWS2
Score ahead of signposting
patient to A&E or calling 999 in
a life threatening emergency`,
        options: ['Risk of deterioration', 'No Risk of deterioration'],
        required: true
      },
      next: answer => (answer === 'Risk of deterioration' ? 'urgentReferralStop' : 'pyelonephritisCheck')
    },
    exclusionStop: {
      id: 'exclusionStop',
      field: {
        type: 'text',
        question: 'Patient is not eligible for this service due to exclusion criteria.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'eligibilityCheck'
    },
    keySymptoms: {
      id: 'keySymptoms',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Does the patient have any of the 3 key diagnostic signs/symptoms?',
        options: [
          'Dysuria (burning pain when passing urine)',
          'New nocturia (needing to pass urine in the night)',
          'Urine cloudy to the naked eye (visual inspection by pharmacist if practicable)'
        ],
        required: true
      },
      next: answer => {
        const yesCount = Object.values(answer).filter(v => v).length
        if (yesCount === 0) return 'otherUrinarySymptoms'
        if (yesCount === 1) return 'otherDiagnoses'
        if (yesCount === 2 || 3) return 'sharedDecisionMaking'
        return 'pyelonephritisCheck'
      }
    },
    otherUrinarySymptoms: {
      id: 'otherUrinarySymptoms',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Are there other urinary symptoms?',
        options: ['Urgency', 'Frequency', 'Visible haematuria', 'Suprapubic pain/tenderness'],
        required: true
      },
      next: answer => (Object.values(answer).some(v => v) ? 'otherDiagnoses' : 'utiUnlikelyStop')
    },
    utiUnlikelyStop: {
      id: 'utiUnlikelyStop',
      field: {
        type: 'text',
        question: 'UTI is less likely. Provide self-care and pain relief advice.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'keySymptoms'
    },
    otherDiagnoses: {
      id: 'otherDiagnoses',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'additional symptom check:',
        options: [
          'Vaginal discharge',
          'Urethritis',
          'Signs and symptoms of pregnancy',
          'Genitourinary syndrome of menopause (vulvovaginal atrophy)',
          'Patient is immunosuppressed'
        ],
        required: true
      },
      next: answer => (Object.values(answer).some(v => v) ? 'referralStop' : 'keySymptoms')
    },
    referralStop: {
      id: 'referralStop',
      field: {
        type: 'text',
        question:
          'Refer patient to appropriate service (General practice, Sexual health clinics, or other provider as appropriate).',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'otherDiagnoses'
    },
    sharedDecisionMaking: {
      id: 'sharedDecisionMaking',
      field: {
        type: 'radio',
        question: 'After shared decision making using TARGET UTI resources, what is the agreed course of action?',
        options: ['Offer nitrofurantoin', 'Provide self-care advice'],
        required: true
      },
      next: answer => (answer === 'Offer nitrofurantoin' ? 'symptomSeverity' : 'selfCareStop')
    },
    symptomSeverity: {
      id: 'symptomSeverity',
      field: {
        type: 'radio',
        question: "How would you describe the patient's symptoms?",
        options: ['Mild', 'Moderate to severe'],
        required: true
      },
      next: answer => (answer === 'Moderate to severe' ? 'prescriptionWriting' : 'selfCareStop')
    },
    prescriptionWriting: {
      id: 'prescriptionWriting',
      field: {
        type: 'text',
        question: 'pretend you write a prescription on this page here',
        required: false
      },
      next: () => 'safetyNetting',
      isStopNode: false
    },
    selfCareStop: {
      id: 'selfCareStop',
      field: {
        type: 'text',
        question: 'Provide self-care advice and ask patient to return if no improvement in 48 hours.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'sharedDecisionMaking'
    },
    pyelonephritisCheck: {
      id: 'pyelonephritisCheck',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Check for any new signs/symptoms of PYELONEPHRITIS:',
        options: [
          'Kidney pain/tenderness in back under ribs',
          'New/different myalgia, flu like illness',
          'Shaking chills (rigors) or temperature 37.9°C or above',
          'Nausea/vomiting'
        ],
        required: true
      },
      next: answer => (Object.values(answer).some(v => v) ? 'urgentReferralStop' : 'otherDiagnoses')
    },
    urgentReferralStop: {
      id: 'urgentReferralStop',
      field: {
        type: 'text',
        question:
          'Urgent same day referral required. Consider calculating NEWS2 Score ahead of signposting patient to A&E or calling 999 in a life-threatening emergency.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'pyelonephritisCheck'
    },
    prescribeNitrofurantoin: {
      id: 'prescribeNitrofurantoin',
      field: {
        type: 'text',
        question:
          'Prescribe nitrofurantoin for 3 days (subject to inclusion/exclusion criteria in PGD). Provide self-care advice.',
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
          'Shared self-care and safety-netting advice using TARGET UTI leaflet',
          'Advised to return to Pharmacy if no improvement in 48 hours for reassessment',
          'Informed to seek help if symptoms worsen rapidly or significantly at any time',
          'Informed to seek help if symptoms do not improve in 48 hours of taking antibiotics'
        ],
        required: true
      },
      next: () => 'completion'
    },
    completion: {
      id: 'completion',
      field: {
        type: 'text',
        question: 'UTI assessment and treatment completed. Any additional notes or observations?',
        required: false
      },
      next: () => null,
      isEndNode: true // Add this line
    }
  }
}

export { pharmacyFirstForm, utiServiceDefinition }
