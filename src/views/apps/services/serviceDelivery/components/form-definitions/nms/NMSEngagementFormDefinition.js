const nmsEngagementForm = {
  name: 'NMS Engagement',
  startNode: 'medicationDetails',
  nodes: {
    medicationDetails: {
      id: 'medicationDetails',
      field: {
        type: 'custom',
        component: 'SimpleMedicineSelect',
        question: 'Provide details of the medication supply:',
        required: true
      },
      next: answer => ({
        nextId: 'engagementDetails',
        data: { medications: answer.medications }
      })
    },
    engagementDetails: {
      id: 'engagementDetails',
      field: {
        type: 'custom',
        component: 'NMSEngagementDetails',
        question: 'NMS Engagement Details',
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

export default nmsEngagementForm
