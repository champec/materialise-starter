const dmsStage2Definition = {
  name: 'DMS Stage 2',
  startNode: 'stage2Undertaken',
  nodes: {
    stage2Undertaken: {
      id: 'stage2Undertaken',
      field: {
        type: 'radio',
        question: 'Was Stage 2 undertaken?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'firstPrescriptionReceived' : 'reasonForNotUndertaking')
    },
    reasonForNotUndertaking: {
      id: 'reasonForNotUndertaking',
      field: {
        type: 'checkbox',
        question: 'Reason for not undertaking Stage 2:',
        options: [
          'Patient deceased',
          'Patient withdrew consent to participate in the service',
          'Patient readmitted to hospital',
          'Provided by another community pharmacy',
          'Other (please specify)'
        ],
        required: true
      },
      next: () => 'stage2Complete'
    },
    firstPrescriptionReceived: {
      id: 'firstPrescriptionReceived',
      field: {
        type: 'custom',
        component: 'DatePicker',
        question: 'Date first prescription received:',
        required: true
      },
      next: () => 'checkUndertakenBy'
    },
    checkUndertakenBy: {
      id: 'checkUndertakenBy',
      field: {
        type: 'radio',
        question: 'Check of first prescription undertaken by:',
        options: ['Pharmacist', 'Pharmacy Technician'],
        required: true
      },
      next: () => 'issuesIdentified'
    },
    issuesIdentified: {
      id: 'issuesIdentified',
      field: {
        type: 'checkbox',
        question: 'Issues identified on first prescription:',
        options: [
          'None – medicines reconciliation completed by the pharmacy',
          'Medicine stopped in hospital still on first prescription',
          'Wrong medicine issued on first prescription',
          'Wrong strength of medicine prescribed',
          'Wrong dose of medicine prescribed',
          'Wrong formulation of medicine prescribed',
          'Medicine included on discharge list inappropriately missed from first prescription',
          'New medicine initiated in primary care since discharge',
          'Other (please specify)'
        ],
        required: true
      },
      next: () => 'issuesDiscussedWith'
    },
    issuesDiscussedWith: {
      id: 'issuesDiscussedWith',
      field: {
        type: 'checkbox',
        question: 'Where issues were identified, they were discussed with:',
        options: ['GP', 'PCN clinical pharmacist/practice pharmacist', 'Hospital', 'Other (please specify)'],
        required: true
      },
      next: () => 'stage2Complete'
    },
    stage2Complete: {
      id: 'stage2Complete',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Stage 2 Complete',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default dmsStage2Definition
