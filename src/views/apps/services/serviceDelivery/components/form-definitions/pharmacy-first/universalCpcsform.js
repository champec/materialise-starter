export const dispositionCodeOptions = [
  { code: 'DX06', display: 'To contact a Primary Care Service within 6 hours' },
  { code: 'DX07', display: 'To contact a Primary Care Service within 12 hours' },
  { code: 'DX08', display: 'To contact a Primary Care Service within 24 hours' },
  {
    code: 'DX09',
    display: 'For persistent or recurrent symptoms get in touch with the GP Practice for a non-urgent appointment'
  },
  { code: 'DX10', display: 'MUST contact own GP Practice for a non-urgent appointment' },
  { code: 'DX13', display: 'Speak to a Primary Care Service within 6 hours' },
  { code: 'DX14', display: 'Speak to a Primary Care Service within 12 hours' },
  { code: 'DX15', display: 'Speak to a Primary Care Service within 24 hours' },
  {
    code: 'DX16',
    display: 'For persistent or recurrent symptoms get in touch with the GP Practice within 3 working days'
  },
  { code: 'DX28', display: 'Contact Pharmacist within 24 hours' },
  { code: 'DX29', display: 'Contact Pharmacist next working day' },
  { code: 'DX45', display: 'Service Location Information' },
  { code: 'DX75', display: 'MUST contact own GP Practice within 3 working days' },
  { code: 'DX80', display: 'Repeat prescription required within 6 hours' },
  { code: 'DX82', display: 'Medication Enquiry' },
  { code: 'DX85', display: 'Repeat prescription required within 2 hours' },
  { code: 'DX86', display: 'Repeat prescription required within 12 hours' },
  { code: 'DX87', display: 'Repeat prescription required within 24 hours' },
  { code: 'DX97', display: 'Emergency Contraception within 2 hours' },
  { code: 'DX98', display: 'Emergency Contraception within 12 hours' },
  { code: 'DX115', display: 'Contact Own GP Practice next working day for appointment' }
]

const universalCPCSFormDefinition = {
  name: 'Universal CPCS Form',
  startNode: 'referral_details',
  nodes: {
    referral_details: {
      id: 'referral_details',
      field: {
        type: 'text',
        question: 'Referral Details:',
        required: true
      },
      next: () => 'referrer_contact_details'
    },
    referrer_contact_details: {
      id: 'referrer_contact_details',
      field: {
        type: 'text',
        question: 'Referrer Contact Details:',
        required: true
      },
      next: () => 'consultation_method'
    },
    consultation_method: {
      id: 'consultation_method',
      field: {
        type: 'select',
        question: 'Consultation Method:',
        options: ['FTF', 'Telephone', 'Telemedicine'],
        required: true
      },
      next: () => 'consultation_outcome'
    },
    consultation_outcome: {
      id: 'consultation_outcome',
      field: {
        type: 'select',
        question: 'Consultation Outcome:',
        options: [
          'ADVICE_ONLY',
          'OTC_MEDICINE_SALE',
          'MAS_REFERRAL',
          'LOCAL_COMMISSIONED_REFERRAL',
          'SUPPLY_NO_SUPPLY',
          'ONWARD_REFERRAL',
          'NON_URGENT',
          'URGENT',
          'OTHER'
        ],
        required: true
      },
      next: answer => {
        switch (answer) {
          case 'ADVICE_ONLY':
          case 'NON_URGENT':
          case 'URGENT':
            return 'disposition_code'
          case 'OTC_MEDICINE_SALE':
          case 'SUPPLY_NO_SUPPLY':
            return 'medication_supply'
          case 'MAS_REFERRAL':
          case 'LOCAL_COMMISSIONED_REFERRAL':
          case 'ONWARD_REFERRAL':
            return 'referral_details'
          case 'OTHER':
            return 'consultation_outcome_other'
          default:
            return 'disposition_code'
        }
      }
    },
    consultation_outcome_other: {
      id: 'consultation_outcome_other',
      field: {
        type: 'text',
        question: 'Please specify the consultation outcome:',
        required: true
      },
      next: () => 'disposition_code'
    },
    medication_supply: {
      id: 'medication_supply',
      field: {
        type: 'radio',
        question: 'Was medication supplied?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'medication_details' : 'no_supply_reason')
    },
    no_supply_reason: {
      id: 'no_supply_reason',
      field: {
        type: 'select',
        question: 'Reason for no supply:',
        options: [
          'Item not able to be supplied under emergency supply regulations',
          'Prescription dispensed for patient',
          'Pharmacist determined supply not necessary',
          'Item not in stock',
          'Patient bought the item',
          'Other'
        ],
        required: true
      },
      next: answer => (answer === 'Other' ? 'no_supply_other' : 'additional_details')
    },
    no_supply_other: {
      id: 'no_supply_other',
      field: {
        type: 'text',
        question: 'Please specify the reason for no supply:',
        required: true
      },
      next: () => 'additional_details'
    },
    medication_details: {
      id: 'medication_details',
      field: {
        type: 'custom',
        component: 'SymptomChecklist',
        question: 'Medication Details:',
        options: ['Drug Code', 'Drug Description', 'Drug Quantity', 'Drug Unit'],
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: () => 'supply_request_reason'
    },
    supply_request_reason: {
      id: 'supply_request_reason',
      field: {
        type: 'select',
        question: 'Reason for supply request:',
        options: [
          'Prescription not ordered',
          'Prescription ordered but not ready',
          'Lost prescription form',
          'Lost or misplaced medicines',
          'Unable to collect medicines',
          'Away from home',
          'Other'
        ],
        required: true
      },
      next: answer => (answer === 'Other' ? 'supply_other_reason' : 'exemption_information')
    },
    supply_other_reason: {
      id: 'supply_other_reason',
      field: {
        type: 'text',
        question: 'Please specify the supply request reason:',
        required: true
      },
      next: () => 'exemption_information'
    },
    exemption_information: {
      id: 'exemption_information',
      field: {
        type: 'radio',
        question: 'Is the patient exempt from charges?',
        options: ['Yes', 'No'],
        required: true
      },
      next: answer => (answer === 'Yes' ? 'exemption_details' : 'additional_details')
    },
    exemption_details: {
      id: 'exemption_details',
      field: {
        type: 'select',
        question: 'Exemption Reason:',
        options: ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'S', 'U', 'W', 'X', 'HMP'],
        required: true
      },
      next: () => 'additional_details'
    },
    disposition_code: {
      id: 'disposition_code',
      field: {
        type: 'custom',
        component: 'CodeSelect',
        label: 'Disposition Code',
        options: dispositionCodeOptions,
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: () => 'additional_details'
    },
    additional_details: {
      id: 'additional_details',
      field: {
        type: 'custom',
        component: 'SafetyNettingChecklist',
        question: 'Additional Details:',
        options: [
          'referred_to_routine',
          'referred_to_urgent',
          'onward_referral_reason',
          'referred_ods',
          'onward_referral_date',
          'signposted_from',
          'signposted_from_other',
          'self_referral_from',
          'self_referral_from_other',
          'referrer_contact_details'
        ],
        required: true,
        progressionCriteria: { type: 'someYes', count: 1 }
      },
      next: () => 'professional_identifier'
    },
    professional_identifier: {
      id: 'professional_identifier',
      field: {
        type: 'text',
        question: 'Professional Identifier (e.g. GPhC number):',
        required: true
      },
      next: () => 'ethnic_group'
    },
    ethnic_group: {
      id: 'ethnic_group',
      field: {
        type: 'select',
        question: 'Patient Ethnic Group:',
        options: [
          { code: 'A', display: 'White - British' },
          { code: 'B', display: 'White - Irish' },
          { code: 'C', display: 'White - Any other background' },
          { code: 'D', display: 'Mixed - White and Black Caribbean' },
          { code: 'E', display: 'Mixed - White and Black African' },
          { code: 'F', display: 'Mixed - White and Asian' },
          { code: 'G', display: 'Mixed - Any other mixed background' },
          { code: 'H', display: 'Asian or Asian British - Indian' },
          { code: 'J', display: 'Asian or Asian British - Pakistani' },
          { code: 'K', display: 'Asian or Asian British - Bangladeshi' },
          { code: 'L', display: 'Asian or Asian British - Any other Asian background' },
          { code: 'M', display: 'Black or Black British - Caribbean' },
          { code: 'N', display: 'Black or Black British - African' },
          { code: 'P', display: 'Black or Black British - Any other Black background' },
          { code: 'R', display: 'Other Ethnic Groups - Chinese' },
          { code: 'S', display: 'Other Ethnic Groups - Any other ethnic group' },
          { code: 'Z', display: 'Not stated' }
        ],
        required: false
      },
      next: () => 'presenting_complaint'
    },
    presenting_complaint: {
      id: 'presenting_complaint',
      field: {
        type: 'text',
        question: 'Presenting complaint or issues:',
        required: false
      },
      next: () => 'assessment_date'
    },
    assessment_date: {
      id: 'assessment_date',
      field: {
        type: 'date',
        question: 'Date of assessment:',
        required: true
      },
      next: () => 'completion'
    },
    completion: {
      id: 'completion',
      field: {
        type: 'text',
        question: 'Any additional notes or observations?',
        required: false
      },
      next: () => null,
      isEndNode: true
    }
  }
}

export { universalCPCSFormDefinition }
