import SymptomChecklist from '../../CustomFormFields/SymptomChecklist'
import { universalCPCSFormDefinition } from './universalCpcsform'

const acuteSoreThroatDefinition = {
  name: 'Acute Sore Throat',
  startNode: 'inclusionCriteria',
  nodes: {
    ...universalCPCSFormDefinition.nodes,
    inclusionCriteria: {
      id: 'inclusionCriteria',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Does the patient meet the following inclusion criteria?',
        options: ['Adults and children aged 5 years and over', 'Not pregnant', 'Not under 16 years old'],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'riskOfDeterioration' : 'exclusionStop')
    },
    exclusionStop: {
      id: 'exclusionStop',
      field: {
        type: 'text',
        question: 'Patient does not meet inclusion criteria. Please refer to appropriate care.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'inclusionCriteria'
    },
    riskOfDeterioration: {
      id: 'riskOfDeterioration',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Consider the risk of deterioration or serious illness:',
        options: [
          'Suspected Epiglottitis (4Ds: dysphagia, dysphonia, drooling, distress)',
          'Severe complications suspected (such as clinical dehydration, signs of pharyngeal abscess)',
          'Stridor (noisy or high pitched sound with breathing)'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'urgentReferralStop' : 'otherComplications')
    },
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
    otherComplications: {
      id: 'otherComplications',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Does the patient have any of the following:',
        options: [
          'Signs or symptoms indicating possible scarlet fever, quinsy or glandular fever (refer to NICE CKS for list of symptoms)',
          'Signs and symptoms of suspected cancer',
          'Immunosuppression'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'onwardReferral' : 'feverPAINScore')
    },
    onwardReferral: {
      id: 'onwardReferral',
      field: {
        type: 'text',
        question: 'Onward referral to General Practice or other provider as appropriate.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'otherComplications'
    },
    feverPAINScore: {
      id: 'feverPAINScore',
      field: {
        type: 'custom',
        component: SymptomChecklist,
        question: 'Use FeverPAIN Score to assess (1 point for each):',
        options: [
          'Fever (over 38°C)',
          'Purulence',
          'First Attendance within 3 days after onset of symptoms',
          'Severely Inflamed tonsils',
          'No cough or coryza (cold symptoms)'
        ],
        required: true
      },
      next: answer => {
        const score = Object.values(answer).filter(v => v).length
        if (score <= 1) return 'feverPAIN01'
        if (score <= 3) return 'feverPAIN23'
        return 'feverPAIN45'
      }
    },
    feverPAIN01: {
      id: 'feverPAIN01',
      field: {
        type: 'checkbox',
        question: 'Self-care and pain relief:',
        options: [
          'Antibiotic is not needed',
          'Offer over the counter treatment for symptomatic relief',
          'Drink adequate fluids',
          'Ask patient to return to Community Pharmacy after 1 week if no improvement for pharmacist reassessment'
        ],
        required: true
      },
      next: () => 'completion'
    },
    feverPAIN23: {
      id: 'feverPAIN23',
      field: {
        type: 'checkbox',
        question: 'Self-care and pain relief:',
        options: [
          'Antibiotics make little difference to how long symptoms last',
          'Withholding antibiotics is unlikely to lead to complications',
          'Ask patient to return to Community Pharmacy if no improvement within 3-5 days for pharmacist reassessment',
          'After pharmacist reassessment, patient can be offered antibiotics if appropriate based on clinician global impression'
        ],
        required: true
      },
      next: () => 'completion'
    },
    feverPAIN45: {
      id: 'feverPAIN45',
      field: {
        type: 'radio',
        question: 'Shared decision making approach using TARGET RTI resources and clinician global impression:',
        options: [
          'Mild symptoms: consider pain relief and self care as first line treatment',
          'Severe symptoms: consider offering an immediate antibiotic'
        ],
        required: true
      },
      next: answer =>
        answer === 'Mild symptoms: consider pain relief and self care as first line treatment'
          ? 'mildSymptoms'
          : 'severeSymptoms'
    },
    mildSymptoms: {
      id: 'mildSymptoms',
      field: {
        type: 'checkbox',
        question: 'Self-care and pain relief:',
        options: [
          'Ask patient to return to Community Pharmacy if no improvement within 3-5 days for pharmacist reassessment',
          'After pharmacist reassessment, patient can be offered antibiotics if appropriate based on clinician global impression'
        ],
        required: true
      },
      next: () => 'completion'
    },
    severeSymptoms: {
      id: 'severeSymptoms',
      field: {
        type: 'radio',
        question: 'Is the patient allergic to penicillin?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'clarithromycinTreatment' : 'phenoxymethylpenicillinTreatment')
    },
    phenoxymethylpenicillinTreatment: {
      id: 'phenoxymethylpenicillinTreatment',
      field: {
        type: 'text',
        question:
          'Offer phenoxymethylpenicillin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
        required: false
      },
      next: () => 'treatmentFailure'
    },
    clarithromycinTreatment: {
      id: 'clarithromycinTreatment',
      field: {
        type: 'radio',
        question: 'Is the patient pregnant?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'erythromycinTreatment' : 'clarithromycinNonPregnant')
    },
    clarithromycinNonPregnant: {
      id: 'clarithromycinNonPregnant',
      field: {
        type: 'text',
        question: 'Offer clarithromycin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
        required: false
      },
      next: () => 'treatmentFailure'
    },
    erythromycinTreatment: {
      id: 'erythromycinTreatment',
      field: {
        type: 'text',
        question: 'Offer erythromycin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
        required: false
      },
      next: () => 'treatmentFailure'
    },
    treatmentFailure: {
      id: 'treatmentFailure',
      field: {
        type: 'text',
        question:
          'If symptoms do not improve after completion of treatment course, refer to General Practice or other provider as appropriate.',
        required: false
      },
      next: () => 'rapidDeterioration'
    },
    rapidDeterioration: {
      id: 'rapidDeterioration',
      field: {
        type: 'text',
        question:
          'If symptoms worsen rapidly or significantly at any time, refer to General Practice or other provider as appropriate.',
        required: false
      },
      next: () => 'safetyNetting'
    },
    safetyNetting: {
      id: 'safetyNetting',
      field: {
        type: 'text',
        question: 'Share self-care and safety-netting advice using TARGET Respiratory Tract Infection leaflets.',
        required: false
      },
      next: () => 'completion'
    },
    completion: {
      ...universalCPCSFormDefinition.nodes.completion,
      field: {
        ...universalCPCSFormDefinition.nodes.completion.field,
        question: 'Acute sore throat assessment and treatment completed. Any additional notes or observations?'
      }
    }
  }
}
