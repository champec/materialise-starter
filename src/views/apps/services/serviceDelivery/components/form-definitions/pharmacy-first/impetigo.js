const impetigoServiceDefinition = {
  name: 'Impetigo Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check eligibility criteria:',
        options: [
          'Non-bullous impetigo',
          'Patient is 1 year or older',
          'Not a case of recurrent impetigo (defined as 2 or more episodes in the same year)',
          'Not a pregnant individual under 16 years'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'riskOfDeterioration' : 'exclusionStop')
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
        question: 'Check for risk of deterioration or serious complications:',
        options: [
          'Meningitis (neck stiffness, photophobia, mottled skin)',
          'Encephalitis (disorientation, changes in behaviour)',
          'Myelitis (muscle weakness, loss of bladder or bowel control)',
          'Facial nerve paralysis (typically unilateral) (Ramsay Hunt)',
          "Hutchinson's sign — a rash on the tip, side, or root of the nose",
          'Visual symptoms',
          'Unexplained red eye',
          'Severely immunosuppressed patient',
          'Immunosuppressed patient where the rash is severe, widespread or patient is systemically unwell'
        ],
        required: true,
        progressionCriteria: { type: 'allNo' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'urgentReferralStop' : 'clinicalFeatures')
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
    clinicalFeatures: {
      id: 'clinicalFeatures',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient follow typical progression of impetigo clinical features:',
        options: [
          'The initial lesion is a very thin-walled vesicle on an erythematous base, which ruptures easily and is seldom observed',
          'The exudate dries to form golden yellow or yellow-brown crusts, which gradually thickens',
          'Lesions can develop anywhere on the body but are most common on exposed skin on the face (the peri-oral and peri-nasal areas), limbs and flexures (such as the axillae)',
          'Satellite lesions may develop following autoinoculation',
          'Usually asymptomatic but may be mildly itchy'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'lesionCount' : 'alternativeDiagnosis')
    },
    alternativeDiagnosis: {
      id: 'alternativeDiagnosis',
      field: {
        type: 'text',
        question: 'Impetigo less likely. Consider alternative diagnosis and proceed appropriately.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'clinicalFeatures'
    },
    lesionCount: {
      id: 'lesionCount',
      field: {
        type: 'radio',
        question: 'How many lesions/clusters are present?',
        options: ['3 or fewer', '4 or more'],
        required: true
      },
      next: answer => (answer === '3 or fewer' ? 'localizedTreatment' : 'widespreadTreatment')
    },
    localizedTreatment: {
      id: 'localizedTreatment',
      field: {
        type: 'radio',
        question: 'Localized non-bullous impetigo. Offer treatment:',
        options: [
          'Hydrogen peroxide 1% cream for 5 days',
          'Fusidic acid cream for 5 days (if hydrogen peroxide is unsuitable or ineffective)'
        ],
        required: true
      },
      next: () => 'safetyNetting'
    },
    widespreadTreatment: {
      id: 'widespreadTreatment',
      field: {
        type: 'radio',
        question: 'Does the patient have a penicillin allergy?',
        options: ['No', 'Yes'],
        required: true
      },
      next: answer => (answer === 'No' ? 'offerFlucloxacillin' : 'allergicTreatment')
    },
    offerFlucloxacillin: {
      id: 'offerFlucloxacillin',
      field: {
        type: 'text',
        question: 'Offer flucloxacillin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
        required: false
      },
      next: () => 'safetyNetting'
    },
    allergicTreatment: {
      id: 'allergicTreatment',
      field: {
        type: 'radio',
        question: 'Is the patient pregnant?',
        options: ['No', 'Yes'],
        required: true
      },
      next: answer => (answer === 'No' ? 'offerClarithromycin' : 'offerErythromycin')
    },
    offerClarithromycin: {
      id: 'offerClarithromycin',
      field: {
        type: 'text',
        question: 'Offer clarithromycin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
        required: false
      },
      next: () => 'safetyNetting'
    },
    offerErythromycin: {
      id: 'offerErythromycin',
      field: {
        type: 'text',
        question: 'Offer erythromycin for 5 days (subject to inclusion/exclusion criteria in PGD) plus self care.',
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
          'Shared self-care and safety-netting advice using British Association of Dermatologists Impetigo leaflet',
          'Advised to return if symptoms worsen rapidly or significantly at any time',
          'Advised to seek help if symptoms do not improve after completion of treatment course',
          'Informed about onward referral to General practice or other provider as appropriate if symptoms worsen or do not improve'
        ],
        required: true
      },
      next: () => 'completion'
    },
    completion: {
      id: 'completion',
      field: {
        type: 'text',
        question: 'Impetigo assessment and treatment completed. Any additional notes or observations?',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default impetigoServiceDefinition
