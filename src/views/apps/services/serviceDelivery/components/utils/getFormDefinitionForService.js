import { pharmacyFirstForm } from '../form-definitions/pharmacyFirstForm'
import shinglesServiceDefinition from '../form-definitions/pharmacy-first/shingles'
// Import other form definitions as needed
import clinicalBloodPressureCheckForm from '../form-definitions/htn/clinicalcasefindinghtn'
import ABPMFormDefinition from '../form-definitions/htn/abpm'
import nmsEngagementForm from '../form-definitions/nms/NMSEngagementFormDefinition'
import nmsInterventionForm from '../form-definitions/nms/NMSInterventionFormDefinition'
import nmsFollowUpForm from '../form-definitions/nms/NMSFollow-upFormDefinition'
import contraceptionInitiationForm from '../form-definitions/contraception/InitiationForm'
import dmsStage1Definition from '../form-definitions/dms/dmsStage1Definition'
import dmsStage2Definition from '../form-definitions/dms/dmsStage2Definition'
import dmsStage3Definition from '../form-definitions/dms/dmsStage3Definition'

export const getFormDefinitionForService = stage => {
  console.log('FORM DEFINITION FOR STAGE', stage)

  if (stage.definition) {
    return stage.definition
  }
  // For stages of pre-defined services
  switch (stage?.id) {
    case '5a499835-7a49-43b6-9de5-6b492baf12d9':
      return pharmacyFirstForm
    case 'hypertension-service-id': // Replace with actual ID
      return hypertensionServiceForm
    case '6b1611ef-134c-421f-a736-b7b8c0841515':
      return shinglesServiceDefinition
    case '705e97e4-8f2d-420d-b990-cb7bf01a400f':
      return clinicalBloodPressureCheckForm
    case '2a93b0fc-b159-447f-96ce-3ead40f511a8':
      return ABPMFormDefinition
    case 'a1d06eb2-9ad0-4fda-a20a-c961cbbd7f80':
      return nmsEngagementForm
    case '0b04318a-3975-4c78-ab4b-37be80e6e1ec':
      return nmsInterventionForm
    case '3b6eeca3-93c7-4a99-8b12-59a6d5843108':
      return nmsFollowUpForm
    case 'e0668b8a-a996-4df4-ae79-dee6ab64fd1d':
      return contraceptionInitiationForm
    case '6e5554ee-7a3c-4566-bb1e-ff5ab62680f2':
      return dmsStage1Definition
    case '66b3f7df-4291-4339-9b1b-3b6f68ece81e':
      return dmsStage2Definition
    case '319a545b-fd3f-48e7-9a49-295ad2cc8b07':
      return dmsStage3Definition
    // Add cases for other services
    default:
      throw new Error(`No form definition found for service ID: ${stage?.service_id}`)
  }
}
