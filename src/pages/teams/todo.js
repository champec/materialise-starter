import React from 'react'
import ToDoAccordion from './todoUtils/TodoAccordion'
import { getOrgTasks } from '../../@core/utils/supabase/teamApis'
import { useOrgAuth } from 'src/hooks/useOrgAuth'

function Todo() {
  const [tasks, setTasks] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [selectedTasks, setSelectedTasks] = React.useState([])
  const [error, setError] = React.useState(null)
  const orgId = useOrgAuth()?.organisation?.id

  React.useEffect(() => {
    setLoading(true)
    getOrgTasks(orgId).then(tasks => {
      setTasks(tasks)
      setLoading(false)
    })
  }, [])

  const handleSelectTask = taskId => {
    setSelectedTasks(prevSelectedTasks => {
      if (prevSelectedTasks.includes(taskId)) {
        return prevSelectedTasks.filter(id => id !== taskId)
      } else {
        return [...prevSelectedTasks, taskId]
      }
    })
  }
  console.log(tasks)
  return (
    <div>
      todo
      <ToDoAccordion tasks={tasks} handleSelectTask={handleSelectTask} selectedTasks={selectedTasks} />
    </div>
  )
}

export default Todo
