import { universalCPCSFormDefinition } from './universalCpcsform'

const infectedInsectBitesDefinition = {
  name: 'Infected Insect Bites',
  startNode: 'inclusionCriteria',
  nodes: {
    ...universalCPCSFormDefinition.nodes,
    inclusionCriteria: {
      id: 'inclusionCriteria',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet the following inclusion criteria?',
        options: ['Adults and children aged 1 year and over', 'Not pregnant', 'Not under 16 years old'],
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
        component: 'SymptomChecklist',
        question: 'Consider the risk of deterioration or serious illness:',
        options: [
          'Signs of systemic hypersensitivity reaction or anaphylaxis',
          'Severely immunosuppressed and have signs or symptoms of an infection',
          'Stings where there is risk of airway obstruction (e.g. in the mouth or throat)',
          'Concerns of orbital cellulitis from bite or sting around the eyes'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'urgentReferralStop' : 'unusualBites')
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
    unusualBites: {
      id: 'unusualBites',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Bite or scratch caused by animal(s)',
          'Bite caused by human(s)',
          'Bite caused by tick in the UK and signs of Lyme disease such as erythema migrans (bullseye) rash',
          'Bite or sting that occurred while travelling outside of UK with concern of insect borne diseases e.g. malaria, tick borne encephalitis',
          'Bite or sting caused by an unusual or exotic insect'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'onwardReferral' : 'timeFromBite')
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
      returnTo: 'unusualBites'
    },
    timeFromBite: {
      id: 'timeFromBite',
      field: {
        type: 'radio',
        question: 'Has it been at least 48 hours after the initial insect bite or sting?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'No' ? 'selfCareAndSafetyNetting' : 'principalSymptom')
    },
    selfCareAndSafetyNetting: {
      id: 'selfCareAndSafetyNetting',
      field: {
        type: 'text',
        question:
          'Recommend self care, oral antihistamine and/or topical steroids over the counter and provide safety netting advice.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'timeFromBite'
    },
    principalSymptom: {
      id: 'principalSymptom',
      field: {
        type: 'radio',
        question: 'Is itch the principal symptom? (In the absence of other signs or symptoms of infection)',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'itchAdvice' : 'infectionSymptoms')
    },
    itchAdvice: {
      id: 'itchAdvice',
      field: {
        type: 'checkbox',
        question: 'Provide the following advice:',
        options: [
          'Skin redness and itching are common and may last for up to 10 days',
          'It is unlikely that the skin will become infected',
          'Avoiding scratching may reduce inflammation and the risk of infection',
          'Recommend self care, oral antihistamine and/or topical steroids over the counter'
        ],
        required: true
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'principalSymptom'
    },
    infectionSymptoms: {
      id: 'infectionSymptoms',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient have acute onset of ≥3 of the following symptoms of an infected insect bite?',
        options: [
          'Redness of skin',
          'Pain or tenderness to the area',
          'Swelling of skin',
          'Skin surrounding the bite feels hot to touch'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 3 }
      },
      next: answer =>
        Object.values(answer).filter(v => v).length >= 3 ? 'infectionEvidence' : 'selfCareAndReassessment'
    },
    selfCareAndReassessment: {
      id: 'selfCareAndReassessment',
      field: {
        type: 'checkbox',
        question: 'Provide the following advice:',
        options: [
          'Clearly demarcate the area and ask patient to monitor',
          'Ask patient to return to pharmacy if symptoms worsen at any time OR do not improve after 3 days of over the counter treatment for pharmacist reassessment',
          'Recommend self care, oral antihistamine and/or topical steroids over the counter'
        ],
        required: true
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'infectionSymptoms'
    },
    infectionEvidence: {
      id: 'infectionEvidence',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Redness and swelling of skin surrounding the bite is spreading',
          'There is evidence of pustular discharge at site of bite/sting'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'complicatingFactors' : 'selfCareAndReassessment')
    },
    complicatingFactors: {
      id: 'complicatingFactors',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Patient systemically unwell',
          'Known comorbidity which may complicate or delay resolution of infection: for example peripheral arterial disease, chronic venous insufficiency, lymphoedema or morbid obesity',
          'Severe pain out of proportion to the wound (may indicate the presence of toxin-producing bacteria)',
          'Patient has significant collection of fluid or pus at site of infection (for incision and drainage where appropriate)'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'onwardReferral' : 'antibioticTreatment')
    },
    antibioticTreatment: {
      id: 'antibioticTreatment',
      field: {
        type: 'radio',
        question: 'Is the patient allergic to penicillin?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'clarithromycinTreatment' : 'flucloxacillinTreatment')
    },
    flucloxacillinTreatment: {
      id: 'flucloxacillinTreatment',
      field: {
        type: 'text',
        question: 'Offer flucloxacillin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
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
          'If symptoms worsen rapidly or significantly at any time, OR do not improve after completion of 5 days treatment course, refer to General Practice or other provider as appropriate.',
        required: false
      },
      next: () => 'completion'
    },
    completion: {
      ...universalCPCSFormDefinition.nodes.completion,
      field: {
        ...universalCPCSFormDefinition.nodes.completion.field,
        question: 'Infected insect bite assessment and treatment completed. Any additional notes or observations?'
      }
    }
  }
}

export default infectedInsectBitesDefinition
