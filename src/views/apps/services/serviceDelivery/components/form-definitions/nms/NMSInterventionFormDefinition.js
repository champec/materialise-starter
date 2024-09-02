const nmsInterventionForm = {
  name: 'NMS Intervention',
  startNode: 'interventionDetails',
  nodes: {
    interventionDetails: {
      id: 'interventionDetails',
      field: {
        type: 'custom',
        component: 'NMSInterventionDetails',
        question: 'NMS Intervention Details',
        required: true
      },
      next: () => 'reviewSubmission'
    },
    reviewSubmission: {
      id: 'reviewSubmission',
      field: {
        type: 'custom',
        component: 'ReviewComponent',
        question: 'Review Submission',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export default nmsInterventionForm
