import { supabaseOrg } from 'src/configs/supabase'

// async function getOrgTasks(orgId) {
//   if (!orgId) {
//     return
//   }

//   let { data: tasks, error } = await supabaseOrg
//     .from('tasks')
//     .select('*')
//     .eq('role', orgId)
//     .order('completed', { ascending: true })
//     .order('created_at', { ascending: false })

//   if (error) console.log('Error: ', error)

//   tasks = tasks || []

//   return tasks
// }

async function getOrgTasks(orgId) {
  if (!orgId) {
    return
  }

  let { data: tasks, error } = await supabaseOrg
    .from('tasks')
    .select('*')
    .eq('role', orgId)
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) console.log('Error: ', error)

  tasks = tasks || []

  // Fetch related data for each task
  for (let task of tasks) {
    // Fetch data from the entity table
    const { data: entity, error: entityError } = await supabaseOrg
      .from(task.entity_type)
      .select('*')
      .eq('id', task.entity_id)

    if (entityError) console.log('Entity error: ', entityError)
    task.entity = entity[0]

    const { data: jobPipeline, error: jobPipelineError } = await supabaseOrg
      .from('job_pipeline')
      .select('*')
      .eq('id', task.job_pipeline_id)

    if (jobPipelineError) console.log('Job pipeline error: ', jobPipelineError)
    task.jobPipeline = jobPipeline[0]
  }

  return tasks
}

export { getOrgTasks }
