import { pharmacyFirstForm } from '../form-definitions/pharmacyFirstForm'
import shinglesServiceDefinition from '../form-definitions/pharmacy-first/shingles'
import impetigoServiceDefinition from '../form-definitions/pharmacy-first/impetigo'
import infectedInsectBitesDefinition from '../form-definitions/pharmacy-first/infectedInsectbites'
import acuteSoreThroatDefinition from '../form-definitions/pharmacy-first/acuteSoreThroat'
import acuteOtitisMediaDefinition from '../form-definitions/pharmacy-first/acuteOtitisMedia'
import uncomplicatedUTIServiceDefinition from '../form-definitions/pharmacy-first/uncomplicatedUTI'
import acuteSinusitisServiceDefinition from '../form-definitions/pharmacy-first/acuteSinusitis'
import emergencySupplyDefinition from '../form-definitions/pharmacy-first/emergencySupply'
import minorAilmentsDefinition from '../form-definitions/pharmacy-first/minorAilments'
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
      return null
    case '6b1611ef-134c-421f-a736-b7b8c0841515':
      return shinglesServiceDefinition
    case '5957b831-163e-428e-9386-34b093bf0e2b':
      return impetigoServiceDefinition
    case '705e97e4-8f2d-420d-b990-cb7bf01a400f':
      return clinicalBloodPressureCheckForm
    case '89421045-4162-4b8d-937d-daddae7256c6':
      return infectedInsectBitesDefinition
    case '2a93b0fc-b159-447f-96ce-3ead40f511a8':
      return ABPMFormDefinition
    case '8c4420cd-2ffb-4ade-8281-7b4c730b0909':
      return acuteSoreThroatDefinition
    case 'eccd2387-75b9-4acb-802a-133e4d6c161b':
      return acuteSinusitisServiceDefinition
    case 'aa0bb38d-a436-4076-88e8-2b9caa704e47':
      return uncomplicatedUTIServiceDefinition
    case 'a1d06eb2-9ad0-4fda-a20a-c961cbbd7f80':
      return nmsEngagementForm
    case '87eae915-8a5f-411b-a700-b4d06806e81c':
      return emergencySupplyDefinition
    case 'cd7a58fc-5cd1-4ef3-867f-08930d2524ed':
      return minorAilmentsDefinition
    case 'f0d678b9-e776-4e69-908f-a9db1634a9f5':
      return acuteOtitisMediaDefinition
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
