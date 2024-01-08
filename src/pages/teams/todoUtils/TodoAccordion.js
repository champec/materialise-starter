import { useState } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import FormControlLabel from '@mui/material/FormControlLabel'
import AccordionDetails from '@mui/material/AccordionDetails'
import Icon from 'src/@core/components/icon'

const ToDoAccordion = ({ tasks, handleSelectTask, selectedTasks }) => {
  const [expanded, setExpanded] = useState(false)

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  if (!tasks) {
    return <div>Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return <div>No tasks available.</div>
  }

  return (
    <div>
      {tasks.map(task => (
        <Accordion key={task.id} expanded={expanded === task.id} onChange={handleChange(task.id)}>
          <AccordionSummary
            id={`actions-panel-header-${task.id}`}
            aria-controls={`actions-panel-content-${task.id}`}
            expandIcon={<Icon icon='mdi:chevron-down' />}
          >
            <FormControlLabel
              label={`${task.jobPipeline.action} for ${task.entity_type} ${task.entity?.id}`}
              aria-label='Acknowledge'
              control={
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => handleSelectTask(task.id)}
                  disabled={task.completed}
                  disableRipple
                />
              }
              onClick={event => event.stopPropagation()}
              onFocus={event => event.stopPropagation()}
              style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{`Task created at: ${task.created_at}`}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}

export default ToDoAccordion
