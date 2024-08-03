// utils/formDefinitions.js
import { pharmacyFirstForm } from '../form-definitions/pharmacyFirstForm'

// Import other form definitions as needed

export const getFormDefinitionForService = serviceId => {
  console.log('FORM DEFINITION', serviceId)
  switch (serviceId) {
    case '5a499835-7a49-43b6-9de5-6b492baf12d9':
      return pharmacyFirstForm
    case 'hypertension-service-id': // Replace with actual ID
      return hypertensionServiceForm
    // Add cases for other services
    default:
      throw new Error(`No form definition found for service ID: ${serviceId}`)
  }
}
