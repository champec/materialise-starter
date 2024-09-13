const emergencySupplyServiceDefinition = {
  name: 'CPCS NHS 111 Referred / UEC Emergency Supply Service',
  startNode: 'assessmentDate',
  nodes: {
    assessmentDate: {
      id: 'assessmentDate',
      field: {
        type: 'custom',
        component: 'DatePicker',
        question: 'Enter the assessment date:',
        required: true
      },
      next: () => 'consultationMethod'
    },
    consultationMethod: {
      id: 'consultationMethod',
      field: {
        type: 'select',
        question: 'Select the consultation method:',
        options: [
          { value: 'FTF', label: 'Face to face communication' },
          { value: 'TELEPHONE', label: 'Telephone' },
          { value: 'TELEMEDICINE', label: 'Telemedicine' }
        ],
        required: true
      },
      next: () => 'professionalRole'
    },
    professionalRole: {
      id: 'professionalRole',
      field: {
        type: 'select',
        question: 'Select your professional role:',
        options: [
          { value: '46255001', label: 'Pharmacist' },
          { value: '159040006', label: 'Pharmacy technician' },
          { value: '734294007', label: 'Independent Prescriber' }
        ],
        required: true
      },
      next: () => 'professionalIdentifier'
    },
    professionalIdentifier: {
      id: 'professionalIdentifier',
      field: {
        type: 'text',
        question: 'Enter your professional identifier:',
        required: true
      },
      next: () => 'supplyRequestReason'
    },
    supplyRequestReason: {
      id: 'supplyRequestReason',
      field: {
        type: 'select',
        question: 'Select the reason for supply request:',
        options: [
          'PRESCRIPTION_NOT_ORDERED',
          'PRESCRIPTION_ORDERED_NOT_READY',
          'PRESCRIPTION_FORM_LOST',
          'LOST_OR_MISPLACED_MEDICINES',
          'UNABLE_TO_COLLECT_MEDICINES',
          'AWAY_FROM_HOME',
          'OTHER'
        ],
        required: true
      },
      next: () => 'chooseOutcome'
    },
    chooseOutcome: {
      id: 'chooseOutcome',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Select consultation outcome:',
        required: true,
        consultationOutcomes: [
          { value: 'ADVICE_ONLY', label: 'Advice given only' },
          { value: 'OTC_MEDICINE_SALE', label: 'Sale of an Over the Counter (OTC) medicine' },
          { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines supply / non-supply' },
          { value: 'ONWARD_REFERRAL', label: 'Onward referral to another CPCS pharmacy' },
          { value: 'NON_URGENT', label: 'Non-urgent signposting to another service' },
          { value: 'URGENT', label: 'Urgent escalation to another service' },
          { value: 'OTHER', label: 'Other (please specify)' }
        ]
      },
      next: answer => {
        if (answer.selectedValue === 'SUPPLY_NO_SUPPLY') {
          return 'medicationSupply'
        } else if (['ONWARD_REFERRAL', 'NON_URGENT', 'URGENT'].includes(answer.selectedValue)) {
          return 'referralComponent'
        }
        return 'safetyNetting'
      }
    },
    medicationSupply: {
      id: 'medicationSupply',
      field: {
        type: 'custom',
        component: 'MedicineSupplied',
        question: 'Enter medication supply details:',
        required: true,
        predefinedOptions: [] // Add any predefined medication options here if needed
      },
      next: () => 'safetyNetting'
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
      next: () => 'safetyNetting'
    },
    safetyNetting: {
      id: 'safetyNetting',
      field: {
        type: 'checkbox',
        question: 'Safety netting advice provided:',
        options: [
          'Advised to return if symptoms worsen rapidly or significantly at any time',
          'Advised to seek help if symptoms do not improve after completion of the emergency supply',
          'Provided information on proper use of the supplied medication',
          'Discussed potential side effects and when to seek further medical advice'
        ],
        required: true
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

export default emergencySupplyServiceDefinition
