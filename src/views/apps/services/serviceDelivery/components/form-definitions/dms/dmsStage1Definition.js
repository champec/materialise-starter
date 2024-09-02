const dmsStage1Definition = {
  name: 'DMS Stage 1',
  startNode: 'minimumDatasetCheck',
  nodes: {
    minimumDatasetCheck: {
      id: 'minimumDatasetCheck',
      field: {
        type: 'checkbox',
        question: 'Did the referral meet the minimum essential dataset requirements?',
        options: [
          "Patient's demographic details (including their hospital medical record number)",
          'The meds being used by patient at discharge (including prescribed, OTC & specialist)',
          'Any changes to meds (incl. med started or stopped, or dosage changes) and documented reason for the change',
          'Contact details for the referring clinician or hospital department',
          "Hospital's Organisation Data Service (ODS) code"
        ],
        required: true
      },
      next: () => 'clinicalCheck'
    },
    clinicalCheck: {
      id: 'clinicalCheck',
      field: {
        type: 'radio',
        question:
          'Has the pharmacist clinical check been undertaken and comparison of discharge regimen with pre-admission regimen completed?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'issuesIdentified' : 'reasonForNoCheck')
    },
    reasonForNoCheck: {
      id: 'reasonForNoCheck',
      field: {
        type: 'text',
        question: 'Reason for not undertaking clinical check:',
        required: true
      },
      next: () => 'prescriptionCheck'
    },
    issuesIdentified: {
      id: 'issuesIdentified',
      field: {
        type: 'checkbox',
        question: 'Were any issues or clinical actions identified?',
        options: [
          'No issues identified',
          'Discrepancy with medication identified',
          'Specific request included in the referral',
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
        options: ['GP', 'Hospital', 'PCN clinical pharmacist/practice pharmacist', 'Other (please specify)'],
        required: true
      },
      next: () => 'prescriptionCheck'
    },
    prescriptionCheck: {
      id: 'prescriptionCheck',
      field: {
        type: 'radio',
        question: 'Were prescriptions in supply system intercepted to prevent patient receiving inappropriate supply?',
        options: ['Yes', 'No such prescriptions'],
        required: true
      },
      next: () => 'stage1Complete'
    },
    stage1Complete: {
      id: 'stage1Complete',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Stage 1 Complete',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default dmsStage1Definition
