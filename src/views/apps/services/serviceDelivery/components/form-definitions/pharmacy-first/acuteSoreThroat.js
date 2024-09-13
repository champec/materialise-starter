import SymptomChecklist from '../../CustomFormFields/SymptomChecklist'
import { universalCPCSFormDefinition } from './universalCpcsform'

const acuteSoreThroatServiceDefinition = {
  name: 'Acute Sore Throat Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'radio',
        question: 'Is the patient at least 5 years old and not a pregnant individual under 16 years?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'riskOfDeterioration' : 'exclusionStop')
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
    riskOfDeterioration: {
      id: 'riskOfDeterioration',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for risk of deterioration or serious illness:',
        options: [
          'Suspected Epiglottitis',
          '4Ds: dysphagia, dysphonia, drooling, distress',
          'Severe complications (e.g., clinical dehydration, signs of pharyngeal abscess)',
          'Stridor (noisy or high pitched sound with breathing)'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'news2Calculator' : 'otherConditions')
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
    otherConditions: {
      id: 'otherConditions',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for other conditions:',
        options: [
          'Signs or symptoms indicating possible scarlet fever, quinsy or glandular fever',
          'Signs and symptoms of suspected cancer',
          'Patient is immunosuppressed'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'referralComponent' : 'feverPainScore')
    },
    feverPainScore: {
      id: 'feverPainScore',
      field: {
        type: 'custom',
        component: 'FeverPainCalculator',
        question: 'Calculate FeverPAIN score:',
        required: true
      },
      next: answer => {
        if (answer.feverPainScore <= 1) {
          return 'lowFeverPainScore'
        } else if (answer.feverPainScore <= 3) {
          return 'mediumFeverPainScore'
        } else {
          return 'highFeverPainScore'
        }
      }
    },
    lowFeverPainScore: {
      id: 'lowFeverPainScore',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Antibiotic is not needed',
          'Offer over the counter treatment for symptomatic relief',
          'Drink adequate fluids',
          'Ask patient to return to Community Pharmacy after 1 week if no improvement for pharmacist reassessment'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'safetyNetting'
    },
    mediumFeverPainScore: {
      id: 'mediumFeverPainScore',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Self-care and pain relief',
          'Antibiotics make little difference to how long symptoms last',
          'Withholding antibiotics is unlikely to lead to complications',
          'Ask patient to return to Community Pharmacy if no improvement within 3-5 days for pharmacist reassessment'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'safetyNetting'
    },
    highFeverPainScore: {
      id: 'highFeverPainScore',
      field: {
        type: 'custom',
        component: 'TargetRTI',
        question: 'Use TARGET RTI resources for shared decision making:',
        required: true
      },
      next: answer => {
        if (answer.outcome === 'mild_symptoms') {
          return 'mildSymptoms'
        } else if (answer.outcome === 'severe_symptoms') {
          return 'severeSymptoms'
        }
        return 'safetyNetting'
      }
    },
    mildSymptoms: {
      id: 'mildSymptoms',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Consider pain relief and self care as first line treatment',
          'Ask patient to return to Community Pharmacy if no improvement within 3-5 days for pharmacist reassessment'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'safetyNetting'
    },
    severeSymptoms: {
      id: 'severeSymptoms',
      field: {
        type: 'radio',
        question: 'Does the patient have a penicillin allergy?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'penicillinAllergy' : 'prescribePhenoxymethylpenicillin')
    },
    penicillinAllergy: {
      id: 'penicillinAllergy',
      field: {
        type: 'radio',
        question: 'Is the patient pregnant?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'prescribeErythromycin' : 'prescribeClarithromycin')
    },
    prescribePhenoxymethylpenicillin: {
      id: 'prescribePhenoxymethylpenicillin',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe phenoxymethylpenicillin for 5 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '325286007',
            drugDescription: 'Phenoxymethylpenicillin 250mg tablets',
            drugDose: 'Take two tablets four times a day',
            quantitySupplied: 40,
            medicationSupplyType: 'PGD'
          }
        ]
      },
      next: () => 'safetyNetting'
    },
    prescribeClarithromycin: {
      id: 'prescribeClarithromycin',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe clarithromycin for 5 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '323924009',
            drugDescription: 'Clarithromycin 250mg tablets',
            drugDose: 'Take one tablet twice a day',
            quantitySupplied: 10,
            medicationSupplyType: 'PGD'
          }
        ]
      },
      next: () => 'safetyNetting'
    },
    prescribeErythromycin: {
      id: 'prescribeErythromycin',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe erythromycin for 5 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '329606002',
            drugDescription: 'Erythromycin 250mg tablets',
            drugDose: 'Take two tablets four times a day',
            quantitySupplied: 40,
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
          'Shared self-care and safety-netting advice using TARGET Respiratory Tract Infection leaflets',
          'Advised to return if symptoms worsen rapidly or significantly at any time',
          'Advised to seek help if symptoms do not improve after completion of treatment course (if applicable)'
        ],
        required: true
      },
      next: () => 'reviewComponent'
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

export default acuteSoreThroatServiceDefinition
