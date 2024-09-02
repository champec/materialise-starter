import { format } from 'date-fns'

const prepareBPClaimData = (appointment, serviceDeliveries) => {
  const { patient_object, gp_object, pharmacy_id } = appointment

  const formatDate = date => format(new Date(date), 'yyyy-MM-dd')

  // Helper function to get the latest service delivery by service_id
  const getLatestServiceDelivery = serviceId => {
    return serviceDeliveries
      .filter(delivery => delivery.service_id === serviceId)
      .reduce(
        (latest, current) => (new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest),
        { completed_at: new Date(0) }
      )
  }

  // Get the latest clinical BP check and ABPM service deliveries
  const latestClinicalBPDelivery = getLatestServiceDelivery('705e97e4-8f2d-420d-b990-cb7bf01a400f')
  const latestABPMDelivery = getLatestServiceDelivery('2a93b0fc-b159-447f-96ce-3ead40f511a8')

  // Helper function to get the lowest BP reading
  const getLowestBPReading = readings => {
    return readings.reduce((lowest, current) => {
      if (
        current.systolic < lowest.systolic ||
        (current.systolic === lowest.systolic && current.diastolic < lowest.diastolic)
      ) {
        return current
      }
      return lowest
    })
  }

  const clinicalBPDetails = latestClinicalBPDelivery.details || {}
  const ABPMDetails = latestABPMDelivery.details || {}

  // Get the lowest BP reading from clinical check
  const lowestBPReading = clinicalBPDetails.bloodPressureReading
    ? getLowestBPReading(clinicalBPDetails.bloodPressureReading.readings)
    : { systolic: '', diastolic: '', pulse: '' }

  const claim = {
    platformDepositId: `SUP-${appointment.id}`,
    patient: {
      nhsNumber: patient_object.nhs_number,
      gpOdsCode: gp_object.ods_code
    },
    orgOdsCode: pharmacy_id,
    yearMonth: format(new Date(), 'yyyy-MM'),
    clinicTestProvided: 'Yes',
    clinicTestDetails: {
      serviceType: 'CLINIC',
      referralSource: clinicalBPDetails.referralSource,
      assessmentDate: formatDate(clinicalBPDetails.assessmentDate),
      systolicBP: lowestBPReading.systolic,
      diastolicBP: lowestBPReading.diastolic,
      bpRating: clinicalBPDetails.bloodPressureReading?.bpRating,
      irregularPulse: clinicalBPDetails.bloodPressureReading?.irregularPulse,
      abpmOffered: clinicalBPDetails.bloodPressureReading?.abpmOffered,
      pulseRate: lowestBPReading.pulse,
      healthyLivingAdvice: clinicalBPDetails.healthyLivingAdvice
    },
    abpmUndertaken: ABPMDetails.abpmData ? 'Yes' : 'No',
    professionalRole: clinicalBPDetails.professionalRole || ABPMDetails.professionalRole,
    consultationOutcome:
      clinicalBPDetails.consultationOutcome?.selectedValue || ABPMDetails.consultationOutcome?.selectedValue
  }

  if (ABPMDetails.abpmData) {
    claim.abpmDetails = {
      serviceType: 'ABPM',
      referralSource: clinicalBPDetails.referralSource, // Assuming ABPM referral source is the same as clinical
      assessmentDate: formatDate(ABPMDetails.assessmentDate),
      averageDaytimeBP: {
        systolic: ABPMDetails.abpmData.daytime.systolic,
        diastolic: ABPMDetails.abpmData.daytime.diastolic
      },
      averageNighttimeBP: {
        systolic: ABPMDetails.abpmData.nighttime.systolic,
        diastolic: ABPMDetails.abpmData.nighttime.diastolic
      },
      overallAverageBP: {
        systolic: ABPMDetails.abpmData.overall.systolic,
        diastolic: ABPMDetails.abpmData.overall.diastolic
      },
      abpmRating: ABPMDetails.abpmData.abpmRating
    }
  }

  // Add signposting or escalation details if applicable
  const relevantDetails = ABPMDetails.abpmData ? ABPMDetails : clinicalBPDetails
  if (relevantDetails.signpostedTo) {
    claim.signpostedTo = relevantDetails.signpostedTo
    claim.signpostedToOther = relevantDetails.signpostedToOther
  } else if (relevantDetails.escalatedTo) {
    claim.escalatedTo = relevantDetails.escalatedTo
    claim.escalatedToOther = relevantDetails.escalatedToOther
  }

  if (relevantDetails.referredOrgOds) {
    claim.referredOrgOds = relevantDetails.referredOrgOds
    claim.onwardReferralDate = formatDate(relevantDetails.onwardReferralDate)
  }

  claim.referrerOds = appointment.referral?.referrer_org_ods

  return claim
}

export default prepareBPClaimData
