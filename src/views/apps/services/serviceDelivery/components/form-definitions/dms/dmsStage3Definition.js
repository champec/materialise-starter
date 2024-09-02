const dmsStage3Definition = {
  name: 'DMS Stage 3',
  startNode: 'stage3Undertaken',
  nodes: {
    stage3Undertaken: {
      id: 'stage3Undertaken',
      field: {
        type: 'radio',
        question: 'Was Stage 3 undertaken?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'consultationDate' : 'reasonForNotUndertaking')
    },
    reasonForNotUndertaking: {
      id: 'reasonForNotUndertaking',
      field: {
        type: 'checkbox',
        question: 'Reason for not undertaking Stage 3:',
        options: [
          'Patient deceased',
          'Patient withdrew consent to participate in the service',
          'Patient readmitted to hospital',
          'Patient has chosen to use another pharmacy',
          'Patient or carer not contactable despite reasonable attempts',
          'Other (please specify)'
        ],
        required: true
      },
      next: () => 'stage3Complete'
    },
    consultationDate: {
      id: 'consultationDate',
      field: {
        type: 'custom',
        component: 'DatePicker',
        question: 'Date of consultation:',
        required: true
      },
      next: () => 'undertakenBy'
    },
    undertakenBy: {
      id: 'undertakenBy',
      field: {
        type: 'radio',
        question: 'Consultation undertaken by:',
        options: ['Pharmacist', 'Pharmacy Technician'],
        required: true
      },
      next: () => 'consultationMethod'
    },
    consultationMethod: {
      id: 'consultationMethod',
      field: {
        type: 'radio',
        question: 'Method of consultation:',
        options: ['Telephone consultation', 'In pharmacy consultation', 'Video consultation', 'Home visit'],
        required: true
      },
      next: () => 'consultationOutcomes'
    },
    consultationOutcomes: {
      id: 'consultationOutcomes',
      field: {
        type: 'checkbox',
        question: 'Consultation outcomes:',
        options: [
          'All important changes understood by patient and/or carer',
          'Advice provided on medicines regimen and questions answered',
          'Referral to GP',
          'Referral to PCN clinical pharmacist/practice pharmacist',
          'Referral to Hospital',
          'Other (please specify)'
        ],
        required: true
      },
      next: () => 'otherCPCFServices'
    },
    otherCPCFServices: {
      id: 'otherCPCFServices',
      field: {
        type: 'checkbox',
        question: 'Other CPCF services provided:',
        options: [
          'Disposal of unwanted medicines',
          'New Medicine Service',
          'Healthy lifestyle advice',
          'Other (please specify)'
        ],
        required: true
      },
      next: () => 'stage3Complete'
    },
    stage3Complete: {
      id: 'stage3Complete',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Stage 3 Complete',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default dmsStage3Definition
