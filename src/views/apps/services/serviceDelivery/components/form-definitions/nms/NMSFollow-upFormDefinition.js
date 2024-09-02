const nmsFollowUpForm = {
  name: 'NMS Follow-up',
  startNode: 'followUpDetails',
  nodes: {
    followUpDetails: {
      id: 'followUpDetails',
      field: {
        type: 'custom',
        component: 'NMSFollowUpDetails',
        question: 'NMS Follow-up Details',
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

export default nmsFollowUpForm
