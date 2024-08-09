const prepareCPCSClaim = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  // Find the latest service delivery
  const latestDelivery = serviceDeliveries.reduce((latest, current) =>
    new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
  )

  //find the latest service stage appointment.service_id - is an array of services get the latest one of the nested ps_services_stages

  const { details } = latestDelivery

  const claim = {
    resourceType: 'Claim',
    identifier: [
      {
        system: 'https://fhir.nhsbsa.nhs.uk/Id/CpcsClientReference',
        //   value: details.platform_deposit_id
        value: 'TEST.123456'
      }
    ],
    contained: [
      {
        resourceType: 'Patient',
        id: 'patientId',
        identifier: [
          {
            system: 'https://fhir.nhs.uk/Id/nhs-number',
            value: patient_object.nhs_number
          }
        ],
        name: [
          {
            use: 'official',
            family: patient_object.last_name,
            given: [patient_object.first_name]
          }
        ],
        birthDate: patient_object.dob,
        gender: patient_object.sex,
        address: [
          {
            use: 'home',
            line: [patient_object.address],
            postalCode: patient_object.post_code
          }
        ],
        generalPractitioner: [
          {
            reference: '#gpOrganization'
          }
        ]
      },
      {
        resourceType: 'Organization',
        id: 'gpOrganization',
        identifier: [
          {
            system: 'https://fhir.nhs.uk/Id/ods-organization-code',
            value: gp_object.ODSCode
          }
        ],
        name: gp_object.OrganisationName,
        address: [
          {
            line: [gp_object.address1],
            postalCode: gp_object.Postcode
          }
        ]
      },
      {
        resourceType: 'ServiceRequest',
        id: 'serviceRequest',
        identifier: [
          {
            system: 'https://fhir.nhsbsa.nhs.uk/Id/UrgentCareReference',
            value: appointment.referral?.referral_reference
          }
        ],
        locationCode: {
          coding: [
            {
              system: 'https://fhir.nhs.uk/Id/ods-organization-code',
              code: appointment.referral?.referrer_org_ods
            }
          ]
        }
      }
    ],
    type: {
      coding: [
        {
          system: 'https://fhir.nhsbsa.nhs.uk/Id/CpcsType',
          code: latestDelivery?.service_stage_id?.claim_type_code, //appointment.ps_service_stages?.claim_type_code,
          display: latestDelivery?.service_stage_id?.claim_type_desc //appointment.ps_service_stages?.details.claim_type_desc
        }
      ]
    },
    patient: { reference: '#patientId' },
    billablePeriod: { start: formatDate(details.claim_month_start) },
    created: formatDate(latestDelivery.completed_at),
    provider: { reference: '#pharmacyOrganization' },
    referral: { reference: '#serviceRequest' },
    careTeam: [
      {
        sequence: 1,
        provider: {
          reference: '#professionalRole',
          identifier: { value: latestDelivery?.completed_by?.professional_identifier }
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
              code: appointment.referral?.referrer_org_type
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
              code:
                appointment.appointment_type === 'remote-video'
                  ? 'TELEMEDICINE'
                  : appointment.appointment_type === 'in-person'
                  ? 'FTF'
                  : 'TELEPHONE'
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
        timingDate: formatDate(appointment.completed_at)
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
        valueString: details?.disposition_code
      }
    ],
    item: []
  }

  // Add CPCS specific type and pathway information
  if (latestDelivery?.service_stage_id?.claim_type_code === 'EMG_MED') {
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
  if (latestDelivery?.ps_prescription) {
    claim.contained.push({
      resourceType: 'MedicationDispense',
      id: 'medicationDispense',
      status: 'completed',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: latestDelivery?.ps_prescription.drug_code,
            display: latestDelivery?.ps_prescription.drug_desc
          }
        ]
      },
      quantity: {
        value: latestDelivery?.ps_prescription.drug_qty,
        unit: latestDelivery?.ps_prescription.drug_unit,
        system: 'http://unitsofmeasure.org'
      },
      whenHandedOver: formatDate(latestDelivery?.ps_prescription.created_at),
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
            code: latestDelivery?.ps_prescription.drug_code,
            display: latestDelivery?.ps_prescription.drug_desc
          }
        ]
      },
      quantity: {
        value: latestDelivery?.ps_prescription.drug_qty
      }
    })
  }

  // Add exemption information if present
  if (appointment.patient_object.patient_exempt_code) {
    claim.extension = [
      {
        url: 'https://fhir.nhsbsa.nhs.uk/StructureDefinition/Extension-ExemptionType',
        valueCodeableConcept: {
          coding: [
            {
              system: 'https://fhir.nhsbsa.nhs.uk/Id/ExemptionType',
              code: appointment.patient_object.patient_exempt_code,
              display: appointment.patient_object.patient_exempt_display
            }
          ]
        }
      }
    ]
  }

  // Add additional supportingInfo elements if applicable
  if (details.referred_to_routine) {
    claim.supportingInfo.push({
      sequence: 7,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'REFERRED_TO_ROUTINE'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/referred-to-routine',
            code: details.referred_to_routine
          }
        ],
        text: details.other_referred_to_routine
      }
    })
  }

  if (details.referred_to_urgent) {
    claim.supportingInfo.push({
      sequence: 8,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'REFERRED_TO_URGENT'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/referred-to-urgent',
            code: details.referred_to_urgent
          }
        ],
        text: details.other_referred_to_urgent
      }
    })
  }

  if (details.onward_referral_reason) {
    claim.supportingInfo.push({
      sequence: 9,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'ONWARD_REFERRAL_REASON'
          }
        ]
      },
      valueString: details.onward_referral_reason
    })
  }

  if (details.referred_ods) {
    claim.supportingInfo.push({
      sequence: 10,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'REFERRED_ODS'
          }
        ]
      },
      valueString: details.referred_ods
    })
  }

  if (details.onward_referral_date) {
    claim.supportingInfo.push({
      sequence: 11,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'ONWARD_REFERRAL_DATE'
          }
        ]
      },
      timingDate: details.onward_referral_date
    })
  }

  if (details.signposted_from) {
    claim.supportingInfo.push({
      sequence: 12,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'SIGNPOSTED_FROM'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/signposted-from',
            code: details.signposted_from
          }
        ],
        text: details.signposted_from_other
      }
    })
  }

  if (details.self_referral_from) {
    claim.supportingInfo.push({
      sequence: 13,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'SELF_REFERRAL_FROM'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/self-referral-from',
            code: details.self_referral_from
          }
        ],
        text: details.self_referral_from_other
      }
    })
  }

  if (details.referrer_contact_details) {
    claim.supportingInfo.push({
      sequence: 14,
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory',
            code: 'REFERRER_CONTACT_DETAILS'
          }
        ]
      },
      valueString: details.referrer_contact_details
    })
  }

  return claim
}
