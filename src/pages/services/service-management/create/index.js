import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import CustomServiceCreator from './CustomServiceCreator'

const CreateEditService = () => {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState(null)

  useEffect(() => {
    if (id) {
      fetchService(id)
    }
  }, [id])

  const fetchService = async serviceId => {
    const { data, error } = await supabase
      .from('ps_services')
      .select(
        `
        *,
        stages:ps_service_stages(*)
      `
      )
      .eq('id', serviceId)
      .single()

    if (error) {
      console.error('Error fetching service:', error)
    } else {
      // Transform the data to match the expected structure
      const transformedService = {
        ...data,
        stages: data.stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          fields: Object.entries(stage.definition?.nodes || {})
            .filter(([key]) => key !== 'reviewComponent')
            .map(([key, node]) => ({
              id: node.id,
              type: node.field?.type || 'text',
              label: node.field?.question || '',
              required: node.field?.required || false,
              options: node.field?.options || []
            }))
        }))
      }
      console.log('transformedService', transformedService, data)
      setService(transformedService)
    }
  }

  const onSave = async (service, orgId, userId, initialService = null) => {
    try {
      // Start a Supabase transaction
      const { data: txData, error: txError } = await supabase.rpc('begin_transaction')
      if (txError) throw txError

      let serviceId

      if (initialService) {
        // Update existing service
        const { data, error } = await supabase
          .from('ps_services')
          .update({
            name: service.name,
            abbreviation: service.abbreviation,
            description: service.description,
            multi: service.multi
          })
          .eq('id', initialService.id)
          .select()
          .single()

        if (error) throw error
        serviceId = data.id
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('ps_services')
          .insert({
            name: service.name,
            abbreviation: service.abbreviation,
            description: service.description,
            multi: service.multi,
            by: userId,
            organisation: orgId,
            is_custom: true
          })
          .select()
          .single()

        if (error) throw error
        serviceId = data.id
      }

      // Prepare stages for upsert
      const stagesForUpsert = service.stages.map((stage, index) => {
        const nodes = {}

        // Create nodes for each field in the stage
        stage.fields.forEach((field, fieldIndex) => {
          const fieldId = `field_${fieldIndex + 1}`
          nodes[fieldId] = {
            id: fieldId,
            field: {
              type: field.type,
              question: field.label,
              required: field.required,
              ...(field.type === 'select' && { options: field.options || [] })
            },
            next: fieldIndex === stage.fields.length - 1 ? 'reviewComponent' : `field_${fieldIndex + 2}`
          }
        })

        // Add a review component as the last node
        nodes.reviewComponent = {
          id: 'reviewComponent',
          field: {
            type: 'custom',
            component: 'ReviewComponent',
            question: 'Review your answers:',
            required: false
          },
          next: null,
          isEndNode: true
        }

        // Create the stage definition
        const stageDefinition = {
          name: stage.name,
          startNode: 'field_1',
          nodes: nodes
        }

        return {
          id: stage.id, // This will be undefined for new stages
          service_id: serviceId,
          stage_number: index + 1,
          name: stage.name,
          description: stage.description,
          is_mandatory: true,
          claim_type_code: 'custom',
          claim_type_desc: 'Custom Service Stage',
          definition: stageDefinition
        }
      })

      console.log('stagesForUpsert', stagesForUpsert)
      // Upsert stages
      const { error: stagesError } = await supabase
        .from('ps_service_stages')
        .upsert(stagesForUpsert, { onConflict: 'id' })
        .select()

      if (stagesError) throw stagesError

      // If it's a new service, subscribe the pharmacy to it
      if (!initialService) {
        const { error: subscriptionError } = await supabase.from('ps_pharmacy_services').insert({
          service_id: serviceId,
          pharmacy_id: orgId,
          color: 'success' // Default color
        })
        if (subscriptionError) throw subscriptionError
      }

      // Commit the transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) throw commitError

      router.push(`/services/service-management`)

      return {
        success: true,
        message: initialService ? 'Service updated successfully' : 'Service created successfully'
      }
    } catch (error) {
      console.error('Error saving service:', error)
      // Rollback the transaction in case of any error
      await supabase.rpc('rollback_transaction')
      return { success: false, message: 'Error saving service. Please try again.', error }
    }
  }

  return <CustomServiceCreator initialService={service} isEdit={!!id} onSave={onSave} />
}

export default CreateEditService
