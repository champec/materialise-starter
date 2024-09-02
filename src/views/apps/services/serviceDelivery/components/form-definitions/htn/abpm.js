const ABPMFormDefinition = {
  name: 'Ambulatory Blood Pressure Monitoring',
  startNode: 'assessmentDate',
  nodes: {
    assessmentDate: {
      id: 'assessmentDate',
      field: {
        type: 'custom',
        component: 'DatePicker',
        question: 'Date of ABPM assessment:',
        required: true
      },
      next: () => 'abpmData'
    },
    abpmData: {
      id: 'abpmData',
      field: {
        type: 'custom',
        component: 'ABPMInput',
        question: 'Enter ABPM data:',
        required: true
      },
      next: () => 'consultationOutcome'
    },
    consultationOutcome: {
      id: 'consultationOutcome',
      field: {
        type: 'custom',
        component: 'ChooseOutcome',
        question: 'Select the consultation outcome:',
        required: true,
        consultationOutcomes: [
          { value: 'ADVICE_ONLY', label: 'Advice given only' },
          { value: 'SIGNPOSTED', label: 'Signposted to another service' },
          { value: 'ESCALATED', label: 'Escalated to another service' }
        ]
      },
      next: answer => {
        switch (answer.selectedValue) {
          case 'SIGNPOSTED':
            return 'signpostedTo'
          case 'ESCALATED':
            return 'escalatedTo'
          default:
            return 'professionalRole'
        }
      }
    },
    signpostedTo: {
      id: 'signpostedTo',
      field: {
        type: 'select',
        question: 'Where was the patient signposted to?',
        options: ['GP Practice', 'Out of hours GP/IUC', 'Community Pharmacy', 'Other'],
        required: true
      },
      next: answer => (answer === 'Other' ? 'signpostedToOther' : 'referredOrgOds')
    },
    signpostedToOther: {
      id: 'signpostedToOther',
      field: {
        type: 'text',
        question: 'Please specify where the patient was signposted:',
        required: true
      },
      next: () => 'referredOrgOds'
    },
    escalatedTo: {
      id: 'escalatedTo',
      field: {
        type: 'select',
        question: 'Where was the patient escalated to?',
        options: ['GP Practice', 'Out of Hours GP/IUC', 'A&E', '999', 'Other'],
        required: true
      },
      next: answer => (answer === 'Other' ? 'escalatedToOther' : 'referredOrgOds')
    },
    escalatedToOther: {
      id: 'escalatedToOther',
      field: {
        type: 'text',
        question: 'Please specify where the patient was escalated:',
        required: true
      },
      next: () => 'referredOrgOds'
    },
    referredOrgOds: {
      id: 'referredOrgOds',
      field: {
        type: 'text',
        question: 'Enter the ODS code of the organisation referred to:',
        required: true
      },
      next: () => 'onwardReferralDate'
    },
    onwardReferralDate: {
      id: 'onwardReferralDate',
      field: {
        type: 'custom',
        component: 'DatePicker',
        question: 'Date of onward referral:',
        required: true
      },
      next: () => 'professionalRole'
    },
    professionalRole: {
      id: 'professionalRole',
      field: {
        type: 'select',
        question: 'Select the professional role of the person providing the service:',
        options: ['Pharmacist', 'Pharmacy Technician'],
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

export default ABPMFormDefinition
