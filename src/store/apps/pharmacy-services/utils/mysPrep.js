import { format } from 'date-fns'

const prepareClaimData = (appointment, serviceDeliveries) => {
  switch (appointment.service_id) {
    case 'DMS_SERVICE_ID':
      return prepareDMSClaim(appointment, serviceDeliveries)
    case 'CVD_SERVICE_ID':
      return prepareHypertensionClaim(appointment, serviceDeliveries)
    case 'NMS_SERVICE_ID':
      return prepareNMSClaim(appointment, serviceDeliveries)
    case 'CPCS_SERVICE_ID':
      return prepareCPCSClaim(appointment, serviceDeliveries)
    case 'FLU_VAC_SERVICE_ID':
      return prepareFluvaccinationClaim(appointment, serviceDeliveries)
    case 'SCS_SERVICE_ID':
      return prepareSmokingCessationClaim(appointment, serviceDeliveries)
    // Add cases for other services
    default:
      throw new Error(`Unsupported service type: ${appointment.service_id}`)
  }
}

export { prepareClaimData }

const prepareDMSClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Helper function to format date to YYYY-MM-DD
  const formatDate = date => new Date(date).toISOString().split('T')[0]

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  const { details } = latestDelivery

  return {
    resourceType: 'QuestionnaireResponse',
    contained: [
      {
        resourceType: 'Practitioner',
        id: 'practitionerId',
        identifier: [{ value: gp_object.ods_code }]
      },
      {
        resourceType: 'Organization',
        id: 'organizationId',
        identifier: [{ value: pharmacy_id }]
      },
      {
        resourceType: 'Patient',
        id: 'patientId',
        identifier: [{ value: patient_object.nhs_number }],
        generalPractitioner: [{ reference: '#practitionerId' }]
      }
    ],
    identifier: { value: `SUP-${appointment.id}` },
    subject: { reference: '#patientId' },
    author: { reference: '#organizationId' },
    authored: formatDate(new Date()), // Current date
    status: 'completed',
    item: [
      {
        linkId: 'referralDetails',
        item: [
          {
            linkId: 'referralDate',
            answer: [{ valueDate: formatDate(details.referral_date) }]
          },
          {
            linkId: 'referrer',
            answer: [{ valueString: details.referrer_org_ods }]
          },
          {
            linkId: 'referrerCaseReference',
            answer: [{ valueString: details.referrer_case_reference || '' }]
          }
        ]
      },
      {
        linkId: 'stage1Questions',
        item: [
          {
            linkId: 'wasStage1Provided',
            answer: [{ valueCoding: { code: details.was_stage1_provided ? 'Y' : 'N' } }]
          },
          ...(details.was_stage1_provided
            ? [
                {
                  linkId: 'whyStage1NotProvided',
                  answer: [{ valueCoding: { code: details.why_stage1_not_provided || '' } }]
                },
                {
                  linkId: 'stage1AssessmentDate',
                  answer: [{ valueDate: formatDate(details.stage1_assessment_date) }]
                },
                {
                  linkId: 'whoProvidedStage1',
                  answer: [{ valueCoding: { code: details.stage1_provider_role } }]
                },
                {
                  linkId: 'werePrescriptionsIntercepted',
                  answer: [{ valueCoding: { code: details.prescriptions_intercepted } }]
                },
                {
                  linkId: 'anyActionsIdentifiedInStage1',
                  answer: [{ valueCoding: { code: details.stage1_actions_identified ? 'Y' : 'N' } }]
                }
              ]
            : [])
        ]
      },
      {
        linkId: 'stage2Questions',
        item: [
          {
            linkId: 'wasStage2Provided',
            answer: [{ valueCoding: { code: details.was_stage2_provided ? 'Y' : 'N' } }]
          },
          ...(details.was_stage2_provided
            ? [
                {
                  linkId: 'whyStage2NotProvided',
                  answer: [{ valueCoding: { code: details.why_stage2_not_provided || '' } }]
                },
                {
                  linkId: 'stage2AssessmentDate',
                  answer: [{ valueDate: formatDate(details.stage2_assessment_date) }]
                },
                {
                  linkId: 'whoProvidedStage2',
                  answer: [{ valueCoding: { code: details.stage2_provider_role } }]
                },
                {
                  linkId: 'anyIssuesIdentifiedInStage2',
                  answer: [{ valueCoding: { code: details.stage2_issues_identified ? 'Y' : 'N' } }]
                }
              ]
            : [])
        ]
      },
      {
        linkId: 'stage3Questions',
        item: [
          {
            linkId: 'wasStage3Provided',
            answer: [{ valueCoding: { code: details.was_stage3_provided ? 'Y' : 'N' } }]
          },
          ...(details.was_stage3_provided
            ? [
                {
                  linkId: 'whyStage3NotProvided',
                  answer: [{ valueCoding: { code: details.why_stage3_not_provided || '' } }]
                },
                {
                  linkId: 'stage3AssessmentDate',
                  answer: [{ valueDate: formatDate(details.stage3_assessment_date) }]
                },
                {
                  linkId: 'whoProvidedStage3',
                  answer: [{ valueCoding: { code: details.stage3_provider_role } }]
                },
                {
                  linkId: 'stage3ConsultationMethod',
                  answer: [{ valueCoding: { code: details.stage3_consultation_method } }]
                },
                {
                  linkId: 'stage3ConsultationOutcome',
                  answer: [{ valueCoding: { code: details.stage3_consultation_outcome } }]
                },
                ...(details.stage3_consultation_outcome === 'CPCF_SERVICE_PROVIDED'
                  ? [
                      {
                        linkId: 'cpcfServicesProvided',
                        answer: details.cpcf_services_provided.map(service => ({ valueCoding: { code: service } }))
                      }
                    ]
                  : []),
                ...(details.stage3_consultation_outcome === 'ONWARD_REFERRAL'
                  ? [
                      {
                        linkId: 'signpostedTo',
                        answer: [
                          {
                            valueCoding: { code: details.signposted_to },
                            valueString: details.signposted_to === 'OTHER' ? details.signposted_to_other : undefined
                          }
                        ]
                      },
                      {
                        linkId: 'referrerOrgOds',
                        answer: [{ valueString: details.referred_org_ods }]
                      },
                      {
                        linkId: 'onwardReferralDate',
                        answer: [{ valueDate: formatDate(details.onward_referral_date) }]
                      }
                    ]
                  : [])
              ]
            : [])
        ]
      }
    ]
  }
}

const prepareNMSClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  const { details } = latestDelivery

  const claim = {
    platformDepositId: `SUP-${appointment.id}`,
    patient: {
      nhsNumber: patient_object.nhs_number,
      gpOdsCode: gp_object.ods_code
    },
    orgOdsCode: pharmacy_id,
    yearMonth: format(new Date(), 'yyyy-MM'),
    referralDate: formatDate(details.referral_date),
    referrerOrgType: details.referrer_org_type,
    referrerOrgOdsCode: details.referrer_org_ods_code,
    referrerCaseReference: details.referrer_case_reference,
    assessmentDate: formatDate(details.assessment_date),
    professionalRole: details.professional_role,
    prescriptionDate: formatDate(details.prescription_date),
    serviceType: details.service_type,
    conditions: details.conditions,
    consultationMethod: details.consultation_method,
    products: details.products.map(product => ({
      snomedCode: product.snomed_code,
      medicationName: product.medication_name
    }))
  }

  // Fields that depend on whether the service was provided
  if (details.service_provided === false) {
    claim.nonProvisionOfServiceReason = details.non_provision_of_service_reason
  } else {
    // Fields for when service is provided
    if (details.service_type !== 'ENGAGEMENT') {
      claim.notUsingPrescribeMedicineReason = details.not_using_prescribe_medicine_reason
    }

    if (details.service_type === 'FOLLOW_UP') {
      claim.consultationOutcome = details.consultation_outcome

      if (details.consultation_outcome === 'ONWARD_REFERRAL') {
        claim.signpostedTo = details.signposted_to
        if (details.signposted_to === 'OTHER') {
          claim.signpostedToOther = details.signposted_to_other
        }
        claim.referredOrgOds = details.referred_org_ods
      }
    }
  }

  return claim
}

const prepareCPCSClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  const { details } = latestDelivery

  const claim = {
    resourceType: 'Claim',
    contained: [
      // ... (previous contained resources remain the same)
    ],
    type: {
      coding: [
        {
          system: 'https://fhir.nhsbsa.nhs.uk/Id/CpcsType',
          code: details.claim_type_code,
          display: details.claim_type_desc
        }
      ]
    },
    patient: { reference: '#patientId' },
    billablePeriod: { start: formatDate(details.claim_month_start) },
    created: formatDate(details.date_recorded),
    provider: { reference: '#pharmacyOrganization' },
    referral: { reference: '#serviceRequest' },
    careTeam: [
      {
        sequence: 1,
        provider: {
          reference: '#professionalRole',
          identifier: { value: details.professional_identifier }
        }
      }
    ],
    supportingInfo: [
      {
        sequence: 1,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'REFERRER_ORG_TYPE'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/referrer-organisation-type',
              code: details.referrer_org_type
            }
          ]
        }
      },
      {
        sequence: 2,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'CONSULTATION_METHOD'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/consultation-method',
              code: details.consultation_method
            }
          ]
        }
      },
      {
        sequence: 3,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'CONSULTATION_OUTCOME'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/consultation-outcome',
              code: details.consultation_outcome
            }
          ]
        }
      },
      {
        sequence: 4,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'ASSESSMENT_DATE'
            }
          ]
        },
        timingDate: formatDate(details.assessment_date)
      },
      {
        sequence: 5,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'DISPOSITION_CODE'
            }
          ]
        },
        valueString: details.disposition_code
      }
    ],
    item: []
  }

  // Add CPCS specific type and pathway information
  if (details.claim_type_code === 'EMG_MED') {
    claim.supportingInfo.push({
      sequence: 6,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'SUPPLY_REQUEST_REASON'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/medication-supply-request-reasons',
            code: details.supply_request_reason
          }
        ]
      },
      valueString: details.supply_request_reason === 'OTHER' ? details.other_supply_request_reason : undefined
    })
  } else if (details.claim_type_code === 'MIN_ILL' || details.claim_type_code === 'MIN_ILL_UEC') {
    claim.supportingInfo.push({
      sequence: 6,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'PRESENTING_COMPLAINT_OR_ISSUES'
          }
        ]
      },
      valueString: details.presenting_complaint_or_issues
    })
  }

  // Add medication details if supplied
  if (details.medication_supplied) {
    claim.contained.push({
      resourceType: 'MedicationDispense',
      id: 'medicationDispense',
      status: 'completed',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: details.drug_code,
            display: details.drug_desc
          }
        ]
      },
      quantity: {
        value: details.drug_qty,
        unit: details.drug_unit,
        system: 'http://unitsofmeasure.org'
      },
      whenHandedOver: formatDate(details.provision_date),
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/medication-supply-type',
            code: details.medication_supply_type
          }
        ]
      }
    })

    claim.item.push({
      sequence: 1,
      productOrService: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: details.drug_code,
            display: details.drug_desc
          }
        ]
      },
      quantity: {
        value: details.drug_qty
      }
    })
  }

  // Add exemption information if present
  if (details.patient_exempt_code) {
    claim.extension = [
      {
        url: 'https://fhir.nhsbsa.nhs.uk/StructureDefinition/Extension-ExemptionType',
        valueCodeableConcept: {
          coding: [
            {
              system: 'https://fhir.nhsbsa.nhs.uk/Id/ExemptionType',
              code: details.patient_exempt_code,
              display: details.patient_exempt_display
            }
          ]
        }
      }
    ]
  }

  return claim
}

const prepareFluvaccinationClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  const { details } = latestDelivery

  const claim = {
    resourceType: 'Claim',
    contained: [
      {
        resourceType: 'Patient',
        id: 'patientId',
        identifier: [{ value: patient_object.nhs_number }],
        name: [
          {
            use: 'official',
            family: patient_object.family_name,
            given: [patient_object.given_name]
          }
        ],
        birthDate: formatDate(patient_object.date_of_birth),
        address: [
          {
            use: 'home',
            line: [patient_object.address_line1, patient_object.address_line2].filter(Boolean),
            postalCode: patient_object.postcode
          }
        ],
        generalPractitioner: [{ reference: '#gpOrganization' }]
      },
      {
        resourceType: 'Organization',
        id: 'gpOrganization',
        identifier: [
          {
            system: 'https://fhir.nhs.uk/Id/ods-organization-code',
            value: gp_object.ods_code
          }
        ],
        name: gp_object.name,
        address: [
          {
            line: [gp_object.address_line1, gp_object.address_line2].filter(Boolean),
            postalCode: gp_object.postcode
          }
        ]
      },
      {
        resourceType: 'Organization',
        id: 'pharmacyOrganization',
        identifier: [
          {
            system: 'https://fhir.nhs.uk/Id/ods-organization-code',
            value: pharmacy_id
          }
        ]
      }
    ],
    identifier: [
      {
        system: 'https://fhir.nhsbsa.nhs.uk/Id/CpcsClientReference',
        value: `SUP-${appointment.id}`
      }
    ],
    status: 'active',
    type: {
      coding: [
        {
          system: 'https://fhir.nhsbsa.nhs.uk/StructureDefinition/FluVacc',
          code: 'FLU_VAC',
          display: 'NHS Seasonal Flu Vaccination'
        }
      ]
    },
    patient: { reference: '#patientId' },
    billablePeriod: {
      start: formatDate(details.claim_month_start)
    },
    created: formatDate(details.date_recorded),
    provider: { reference: '#pharmacyOrganization' },
    priority: { coding: [{ code: 'normal' }] },
    facility: {
      type: 'Location',
      identifier: {
        system: 'https://fhir.nhs.uk/Id/ods-organization-code',
        value: details.vaccination_site_ods
      }
    },
    supportingInfo: [
      {
        sequence: 1,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'DOSE_NUMBER'
            }
          ]
        },
        valueString: details.dose_number.toString()
      },
      {
        sequence: 2,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'TREATMENT_SUPPLEMENT'
            }
          ]
        },
        valueString: details.treatment_supplement
      },
      {
        sequence: 3,
        category: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
              code: 'PROCEDURE_CODE'
            }
          ]
        },
        valueString: details.procedure_code
      }
    ],
    item: [
      {
        sequence: 1,
        productOrService: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: details.drug_code,
              display: details.drug_desc
            }
          ]
        },
        quantity: {
          value: details.drug_qty,
          unit: details.drug_unit
        }
      }
    ]
  }

  return claim
}
// Implement similar functions for other service types

export { prepareClaimData }

const prepareSmokingCessationClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  const { details } = latestDelivery

  const claim = {
    platformDepositId: `SUP-${appointment.id}`,
    patient: {
      nhsNumber: patient_object.nhs_number,
      gpOdsCode: gp_object.ods_code
    },
    orgOdsCode: pharmacy_id,
    yearMonth: format(new Date(), 'yyyy-MM'),
    referralDate: formatDate(details.referral_date),
    referrerOdsCode: details.referrer_ods_code,
    assessmentDate: formatDate(details.assessment_date),
    serviceType: details.service_type,
    consultationMethod: details.consultation_method,
    quitDate: formatDate(details.quit_date),
    smokingStatus: details.smoking_status,
    numberOfConsultations: details.number_of_consultations,
    numberOfSupportWeeks: details.number_of_support_weeks,
    fourWeeksPostQuit: details.four_weeks_post_quit,
    twelveWeeksPostQuit: details.twelve_weeks_post_quit,
    pregnancyStatus: details.pregnancy_status,
    eCigarettesUsed: details.e_cigarettes_used,
    nrtUsed: details.nrt_used,
    nrtProducts: details.nrt_products.map(product => ({
      snomedCode: product.snomed_code,
      medicationName: product.medication_name,
      quantitySupplied: product.quantity_supplied
    })),
    prescriptionChargeExempt: details.prescription_charge_exempt,
    referredOrgOds: details.referred_org_ods,
    onwardReferralDate: details.onward_referral_date ? formatDate(details.onward_referral_date) : undefined
  }

  return claim
}
