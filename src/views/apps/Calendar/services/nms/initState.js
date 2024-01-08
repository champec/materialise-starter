export const initialState = {
  intervention: {
    during_survey: {
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      question_6: '',
      question_7: '',
      question_8: ''
    },
    post_survey: {
      matters_identified: [],
      outcomes_provided: {
        advise_provided: [],
        information_provided: [],
        agreed_actions: [],
        actions_by_pharmacist: []
      },
      lifestyle_advise: []
    }
  },
  follow_up: {
    during_survey: {
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      question_6: '',
      question_7: '',
      question_8: ''
    },
    post_survey: {
      matters_identified: [],
      outcomes_provided: {
        advise_provided: [],
        information_provided: [],
        agreed_actions: [],
        actions_by_pharmacist: []
      },
      lifestyle_advise: []
    }
  },
  cancelled: { state: false, date: new Date(), reason: '', stage: '' },
  referral: { state: false, date: new Date(), reason: '', stage: '' },
  failed_contact: { dateTime: null, number_of_attempts: null, reason: null },
  // notes: '',
  completed: {
    intervention: {
      dateTime: null,
      status: null
    },
    follow_up: {
      dateTime: null,
      status: null
    },
    overall_status: false
  }
}
