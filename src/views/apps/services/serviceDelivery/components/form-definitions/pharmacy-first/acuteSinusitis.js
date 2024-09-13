const acuteSinusitisServiceDefinition = {
  name: 'Acute Sinusitis Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'radio',
        question:
          'Is the patient at least 12 years old, not immunosuppressed, does not have chronic sinusitis, and not a pregnant individual under 16 years?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'shareNiceInfo' : 'exclusionStop')
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
    shareNiceInfo: {
      id: 'shareNiceInfo',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Share the following NICE information with the patient:',
        options: [
          'Acute sinusitis is usually caused by a virus and is only complicated by bacterial infection in about 2 in 100 cases.',
          'It takes 2–3 weeks to resolve, and most people will get better without antibiotics.'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'riskOfDeterioration'
    },
    riskOfDeterioration: {
      id: 'riskOfDeterioration',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for risk of deterioration or serious illness:',
        options: [
          'Intraorbital or periorbital complications (e.g., orbital cellulitis, displaced eyeball, reduced vision)',
          'Intracranial complications, including swelling over the frontal bone',
          'Signs of meningitis, severe frontal headache, or focal neurological signs'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'news2Calculator' : 'diagnosisCheck')
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
    diagnosisCheck: {
      id: 'diagnosisCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for acute sinusitis symptoms:',
        options: [
          'Nasal blockage (obstruction/congestion)',
          'Nasal discharge (anterior/posterior nasal drip)',
          'Facial pain/pressure (or headache)',
          'Reduction (or loss) of the sense of smell (in adults)',
          'Cough during the day or at night (in children)'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 2 }
      },
      next: answer => (Object.values(answer).filter(v => v).length >= 2 ? 'symptomDuration' : 'alternativeDiagnosis')
    },
    alternativeDiagnosis: {
      id: 'alternativeDiagnosis',
      field: {
        type: 'text',
        question: 'Acute sinusitis is less likely. Consider alternative diagnosis and proceed appropriately.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'diagnosisCheck'
    },
    symptomDuration: {
      id: 'symptomDuration',
      field: {
        type: 'radio',
        question: 'Has the patient had symptoms for ≤10 days?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'shortDurationAdvice' : 'bacterialSinusitisCheck')
    },
    shortDurationAdvice: {
      id: 'shortDurationAdvice',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Consider self-care and pain relief',
          'Antibiotic is not needed',
          'Sinusitis usually lasts 2-3 weeks',
          'Manage symptoms with self-care'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'safetyNetting'
    },
    bacterialSinusitisCheck: {
      id: 'bacterialSinusitisCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Check for symptoms of acute bacterial sinusitis:',
        options: [
          'Marked deterioration after an initial milder phase',
          'Fever (>38°C)',
          'Unremitting purulent nasal discharge',
          'Severe localised unilateral pain, particularly pain over the teeth (toothache) and jaw'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 2 }
      },
      next: answer =>
        Object.values(answer).filter(v => v).length >= 2
          ? 'bacterialSinusitisTreatment'
          : 'nonBacterialSinusitisTreatment'
    },
    nonBacterialSinusitisTreatment: {
      id: 'nonBacterialSinusitisTreatment',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Self care and pain relief',
          'Shared decision making approach based on severity of symptoms',
          'Offer high dose nasal corticosteroid (off-label) for 14 days (subject to inclusion/ exclusion criteria in PGD)',
          'Acute sinusitis is usually caused by a virus. Antibiotics make little difference to how long symptoms last or the number of people whose symptoms improve',
          'Ask patient to return to Community Pharmacy if symptoms do not improve in 7 days for pharmacist reassessment'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'prescribeNasalCorticosteroid'
    },
    bacterialSinusitisTreatment: {
      id: 'bacterialSinusitisTreatment',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'Shared decision making approach based on severity of symptoms',
          'Offer high dose nasal corticosteroid (off-label) for 14 days (subject to inclusion/exclusion criteria in PGD) plus self care and pain relief instead of antibiotics first line'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'prescribeNasalCorticosteroid'
    },
    prescribeNasalCorticosteroid: {
      id: 'prescribeNasalCorticosteroid',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe high dose nasal corticosteroid for 14 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '3259411000001106',
            drugDescription: 'Mometasone 50micrograms/dose nasal spray',
            drugDose: 'Use two sprays in each nostril once daily',
            quantitySupplied: 1,
            medicationSupplyType: 'PGD'
          }
        ]
      },
      next: () => 'penicillinAllergyCheck'
    },
    penicillinAllergyCheck: {
      id: 'penicillinAllergyCheck',
      field: {
        type: 'radio',
        question: 'Does the patient have a penicillin allergy?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'penicillinAllergy' : 'prescribePhenoxymethylpenicillin')
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
    penicillinAllergy: {
      id: 'penicillinAllergy',
      field: {
        type: 'radio',
        question: 'Is the patient pregnant?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'prescribeErythromycin' : 'prescribeClarithromycinOrDoxycycline')
    },
    prescribeClarithromycinOrDoxycycline: {
      id: 'prescribeClarithromycinOrDoxycycline',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe clarithromycin OR doxycycline for 5 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '323924009',
            drugDescription: 'Clarithromycin 250mg tablets',
            drugDose: 'Take one tablet twice a day',
            quantitySupplied: 10,
            medicationSupplyType: 'PGD'
          },
          {
            drugCode: '324026007',
            drugDescription: 'Doxycycline 100mg capsules',
            drugDose: 'Take one capsule twice a day',
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

export default acuteSinusitisServiceDefinition
