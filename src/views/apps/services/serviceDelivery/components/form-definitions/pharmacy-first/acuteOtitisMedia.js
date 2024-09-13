const acuteOtitisMediaServiceDefinition = {
  name: 'Acute Otitis Media Service',
  startNode: 'eligibilityCheck',
  nodes: {
    eligibilityCheck: {
      id: 'eligibilityCheck',
      field: {
        type: 'checkbox',
        question: 'Confirm the following:',
        options: [
          'Patient is aged 1 to 17 years',
          'Patient does not have recurrent acute otitis media (3 or more episodes in 6 months or four or more episodes in 12 months)',
          'Patient is not a pregnant individual under 16 years'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: answer => (Object.values(answer).every(v => v) ? 'shareInformation' : 'exclusionStop')
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
    shareInformation: {
      id: 'shareInformation',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Share the following information with the patient:',
        options: [
          'Acute otitis media mainly affects children',
          'It can last for around 1 week',
          'Over 80% of children recover spontaneously without antibiotics 2-3 days from presentation'
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
        question: 'Check for risk of deterioration:',
        options: [
          'Meningitis (neck stiffness, photophobia, mottled skin)',
          'Mastoiditis (pain, soreness, swelling, tenderness behind the affected ear(s))',
          'Brain abscess (severe headache, confusion or irritability, muscle weakness)',
          'Sinus thrombosis (headache behind or around the eyes)',
          'Facial nerve paralysis'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'referralComponent' : 'acuteSymptoms')
    },
    acuteSymptoms: {
      id: 'acuteSymptoms',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient have acute onset of symptoms including:',
        options: [
          'In older children— earache',
          'In younger children — holding, tugging, or rubbing of the ear',
          'In younger children: non-specific symptoms such as fever, crying, poor feeding, restlessness, behavioural changes, cough, or rhinorrhoea'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'otoscopicExamination' : 'alternativeDiagnosis')
    },
    alternativeDiagnosis: {
      id: 'alternativeDiagnosis',
      field: {
        type: 'text',
        question: 'Acute otitis media is less likely. Consider alternative diagnosis and proceed appropriately.',
        required: false
      },
      next: () => null,
      isStopNode: true,
      returnTo: 'acuteSymptoms'
    },
    otoscopicExamination: {
      id: 'otoscopicExamination',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient have an otoscopic examination showing:',
        options: [
          'A distinctly red, yellow, or cloudy tympanic membrane',
          'Moderate to severe bulging of the tympanic membrane, with loss of normal landmarks and an air-fluid level behind the tympanic membrane',
          'Perforation of the tympanic membrane and/or sticky discharge in the external auditory canal'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'highRiskCriteria' : 'alternativeDiagnosis')
    },
    highRiskCriteria: {
      id: 'highRiskCriteria',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: [
          'Patient is systemically very unwell',
          'Patient has signs of a more serious illness',
          'Patient is high risk of complications because of pre-existing comorbidity (this includes children with significant heart, lung, renal, liver or neuromuscular disease, immunosuppression, cystic fibrosis and young children who were born prematurely)'
        ],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'referralComponent' : 'otorrhoea')
    },
    otorrhoea: {
      id: 'otorrhoea',
      field: {
        type: 'radio',
        question:
          'Does the child/young person have otorrhoea (discharge after eardrum perforation) or eardrum perforation (suspected or confirmed)?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'treatmentComponent' : 'bilateralInfection')
    },
    bilateralInfection: {
      id: 'bilateralInfection',
      field: {
        type: 'radio',
        question: 'Is the child under 2 years AND with infection in both ears?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'treatmentComponent' : 'severityCheck')
    },
    severityCheck: {
      id: 'severityCheck',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Does the patient meet ANY of the following criteria:',
        options: ['Severe symptoms based on clinician global impression', 'Symptoms for >3 days'],
        required: true,
        progressionCriteria: { type: 'any' }
      },
      next: answer => (Object.values(answer).some(v => v) ? 'treatmentComponent' : 'selfCareAndEarDrops')
    },
    selfCareAndEarDrops: {
      id: 'selfCareAndEarDrops',
      field: {
        type: 'custom',
        component: 'AdviceForm',
        question: 'Provide the following advice to the patient:',
        options: [
          'In patients with mild symptoms, offer self-care and pain relief',
          'In patients with moderate and severe symptoms, without eardrum perforation, consider offering phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days (subject to inclusion/exclusion criteria in PGD) plus self care',
          'Ask patient to return to Community Pharmacy if no improvement within 3-5 days for pharmacist reassessment'
        ],
        required: true,
        progressionCriteria: { type: 'allYes' }
      },
      next: () => 'prescribeEarDrops'
    },
    prescribeEarDrops: {
      id: 'prescribeEarDrops',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe ear drops:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '10365411000001102',
            drugDescription: 'Phenazone 40mg/g / Lidocaine 10mg/g ear drops',
            drugDose: 'Apply 4 drops into the affected ear(s) 2-3 times daily',
            quantitySupplied: 1,
            medicationSupplyType: 'PGD'
          }
        ]
      },
      next: () => 'safetyNetting'
    },
    treatmentComponent: {
      id: 'treatmentComponent',
      field: {
        type: 'radio',
        question: 'Does the patient have a penicillin allergy?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'penicillinAllergy' : 'prescribeAmoxicillin')
    },
    prescribeAmoxicillin: {
      id: 'prescribeAmoxicillin',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Prescribe amoxicillin for 5 days:',
        required: true,
        predefinedOptions: [
          {
            drugCode: '3264611000001106',
            drugDescription: 'Amoxicillin 250mg/5ml oral suspension sugar free',
            drugDose: 'Dose according to age and weight as per BNF for Children',
            quantitySupplied: 1,
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
        question: 'Is the patient pregnant (aged 16-17)?',
        options: ['Yes', 'No'],
        required: true,
        autoProgress: true
      },
      next: answer => (answer === 'Yes' ? 'prescribeErythromycin' : 'prescribeClarithromycin')
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
            drugCode: '323925005',
            drugDescription: 'Clarithromycin 125mg/5ml oral suspension',
            drugDose: 'Dose according to age and weight as per BNF for Children',
            quantitySupplied: 1,
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
            drugCode: '3542911000001102',
            drugDescription: 'Erythromycin 250mg/5ml oral suspension',
            drugDose: 'Dose according to age and weight as per BNF for Children',
            quantitySupplied: 1,
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
          'Shared self-care and safety-netting advice using NICE guidelines',
          'Advised to return if symptoms worsen rapidly or significantly, or the child or young person becomes very unwell',
          'Advised to seek help if symptoms do not improve despite antibiotics taken for at least 2-3 days'
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

export default acuteOtitisMediaServiceDefinition
