import React from 'react'
import Kanbanboard from 'src/views/apps/KanbanBoard/KanbanBoard'
import withReducer from 'src/@core/HOC/withReducer'
import kanbanSlice from 'src/store/apps/kanban'

function kanban() {
  return (
    <div>
      <Kanbanboard />
    </div>
  )
}

export default withReducer('kanban', kanbanSlice)(kanban)
