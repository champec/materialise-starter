import { universalCPCSFormDefinition } from './universalCpcsform'

const shinglesServiceDefinition = {
  name: 'Shingles Service',
  startNode: 'eligibilityCheck',
  nodes: {
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
      next: answer => (Object?.values(answer)?.some(v => v) ? 'chooseOutcome' : 'possibleScarletFever')
    },
    chooseOutcome: {
      id: ' chooseOutcome',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Choose outcome',
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
          { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines non-supply (specify actions taken)' },
          { value: 'ONWARD_REFERRAL', label: 'Onward referral to another CPCS pharmacy' },
          { value: 'NON_URGENT', label: 'Non-urgent signposting to another service' },
          { value: 'URGENT', label: 'Urgent escalation to another service' },
          { value: 'OTHER', label: 'Other (please specify)' }
        ],
        // autoProgress: true
        validate: value => {
          if (!value || !value.selectedValue) {
            return 'You must select an outcome to proceed'
          }
          return null
        }
      },
      next: answer => {
        let finalAnswer = ''
        if (typeof answer === 'object') {
          finalAnswer = answer.selectedValue
        } else if (typeof answer === 'string') {
          finalAnswer = answer
        }
        console.log('final answer', finalAnswer, answer, answer?.selectedValue, typeof answer)
        switch (finalAnswer) {
          case 'ADVICE_ONLY':
            return 'adviceProvided'
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
    chooseOutcome_treatment: {
      id: ' chooseOutcome_treatment',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Choose outcome',
        required: true,
        consultationOutcomes: [
          {
            value: 'Mild_Symptoms',
            label: '(Mild Symptoms) Conider pain relief and self care as first line treatment'
          },
          { value: 'Severe_Symptoms', label: '(Severe Symptoms) Conider antibiotics' }
        ],
        // autoProgress: true
        validate: value => {
          if (!value || !value.selectedValue) {
            return 'You must select an outcome to proceed'
          }
          return null
        }
      },
      next: answer => {
        let finalAnswer = ''
        if (typeof answer === 'object') {
          finalAnswer = answer.selectedValue
        } else if (typeof answer === 'string') {
          finalAnswer = answer
        }
        console.log('final answer', finalAnswer, answer, answer?.selectedValue, typeof answer)
        switch (finalAnswer) {
          case 'Mild_Symptoms':
            return 'adviceProvided'
          case 'Severe_Symptoms':
            return 'medicationSupplyDetails'
          default:
            return 'additionalDetails'
        }
      }
    },
    adviceProvided: {
      id: 'adviceProvided',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the advice to the patient:',
        options: [
          'Avoid scratching the rash to prevent infection.',
          'Keep the rash clean and dry.',
          'Take pain relief if necessary.',
          'Avoid contact with pregnant women, newborns, and immunocompromised individuals until the rash has crusted over.'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: answer => 'safetyNetting'
    },
    possibleScarletFever: {
      id: 'possibleScarletFever',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for risk symptoms of scarlet fever, glandular fever, quincy or any of the criteria below',
        options: [
          'Individual has signs or symptoms of scarlet fever',
          'Individual has signs or symptoms of glandular fever',
          'Individual is immunosuppressed',
          'Individual is currently taking/receiving the following medicines known to cuase agranulocytosis (e.g methotrexate, sulfasalazine, carbamazepine, all chemotherapy',
          'Individual is systemically unwell but not showing signs or symptoms of sepsis',
          'Possible cancer suspected (persistent mouth ulcers, mess/unilateral swelling preset, red or white patches in the mouth, individuals > 45 with unexplained hoarse voice lasting 3 weeks or more',
          'individuals where treatement under this PGD is not indicated/permitted but upper respiratory symptoms are present and require further assessment'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object?.values(answer)?.some(v => v) ? 'chooseOutcome' : 'feverPainSore')
    },
    feverPainSore: {
      id: 'feverPainSore',
      field: {
        type: 'custom',
        component: 'FeverPainCalculator',
        question: 'Calculate FeverPAIN score:',
        required: true
      },
      next: answer => {
        let recommendedOutcome = ''
        let additionalAdvice = ''
        if (answer.feverPainScore <= 1) {
          recommendedOutcome = 'ADVICE_ONLY'
        } else if (answer.feverPainScore <= 3) {
          recommendedOutcome = 'ADVICE_ONLY'
          additionalAdvice =
            'Unlike with a fever score of 0-1, you might want to ask the patient to come back to the pharmacy if no improvement within 3-5 days for reassessment'
        } else {
          recommendedOutcome = 'ONWARD_REFERRAL'
        }

        if (answer.feverPainScore > 3) {
          return 'wouldYouLikeToDoRTI'
        }
        return {
          nextId: 'chooseOutcome',
          data: { recommendedOutcome, additionalAdvice }
        }
      }
    },
    // ps_prescriptions expects id(auto generated supabase), created_at (now), drug_code (from the delivery forms medicationSupplyDetails node which I will show you below), drug_desc, drug_qty, drug_unit, patient_id, written_by (user id), ps_delivery_id (the delivery id)
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
    wouldYouLikeToDoRTI: {
      id: 'wouldYouLikeToDoRTI',
      field: {
        type: 'radio',
        question: 'Shared decision making approach using TARGET RTI resource and clinician global impression? ',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => ({
        nextId: answer === 'Yes' ? 'targetRTI' : 'chooseOutcome_treatment',
        data: { newsScore: answer }
      })
    },
    targetRTI: {
      id: 'targetRTI',
      field: {
        type: 'custom',
        component: 'TargetRTI',
        question: 'Complete the TARGET RTI assessment:',
        required: true,
        validate: value => {
          if (!value || !value.outcome) {
            return 'Please complete the assessment and select an outcome.'
          }
          return null
        }
      },
      next: answer => {
        if (answer.outcome === 'red_flag') {
          return 'referralComponent' // or any other logic for next step
        } else if (answer.outcome === 'mild_symptoms') {
          return 'adviceProvided'
        } else if (answer.outcome === 'sever_symptoms') {
          return 'medicationSupplyDetails'
        }

        return 'reviewComponent'
      }
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
    completion: {
      id: 'completion',
      field: {
        type: 'text',
        question: 'Any additional notes or observations?',
        multi: true,
        rows: 4,
        required: false
      },
      next: () => 'reviewComponent'
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
    additionalDetails: {
      id: 'additionalDetails',
      field: {
        type: 'text',
        question: 'Please provide any additional details or comments:',
        multi: true,
        rows: 4,
        required: false
      },
      next: () => 'reviewComponent'
    }
  }
}

export default shinglesServiceDefinition
