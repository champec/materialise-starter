import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg } from 'src/configs/supabase'

const supabase = supabaseOrg

export const createFirstBoard = createAsyncThunk('kanban/createFirstBoard', async (organisationId, thunkAPI) => {
  const { data, error } = await supabase.from('kan_boards').insert({ pharmacy_id: organisationId })
  if (error) {
    console.log(error)

    return thunkAPI.rejectWithValue(error)
  }

  return data
})

export const fetchBoardByOrg = createAsyncThunk('kanban/fetchBoardByOrg', async organisationId => {
  console.log('KAN fetchid', organisationId)
  const { data, error } = await supabase.rpc('get_board_by_org', { organisation_id: organisationId })

  if (error) {
    console.log(error)
    throw new Error(error.message) // Throw the error
  }

  console.log('KAN', data)

  return data || []
})

export const addLane = createAsyncThunk('kanban/addLane', async ({ lane, boardId }) => {
  const { data, error } = await supabase.from('kan_lanes').insert(lane)
  if (error) {
    console.log(error)
  }

  return { data, boardId }
})

export const updateLane = createAsyncThunk('kanban/updateLane', async ({ lane, boardId }) => {
  const { data, error } = await supabase.from('kan_lanes').update(lane).eq('id', lane.id)
  if (error) {
    console.log(error)
  }

  return { data, boardId }
})

export const deleteLane = createAsyncThunk('kanban/deleteLane', async ({ laneId, boardId }) => {
  const { data, error } = await supabase.from('kan_lanes').delete().eq('id', laneId)
  if (error) {
    console.log(error)
    throw new Error(error.message)
  }

  return { data, boardId }
})

export const addTask = createAsyncThunk('kanban/addTask', async ({ task, orgId, labels, users }) => {
  const taskResponse = await supabase.from('kan_tasks').insert(task).select('id')

  if (taskResponse.error) {
    console.error(taskResponse.error)
    throw new Error(taskResponse.error)
  }

  const taskId = taskResponse.data[0].id

  if (labels && labels.length > 0) {
    const labelPromises = labels.map(label => {
      console.log(label, 'ADD LABELS TO SUPABASE')

      supabase
        .from('kan_labels')
        .insert({ ...label, pharmacy_id: orgId })
        .select('id')
    })

    const labelResponses = await Promise.all(labelPromises)

    for (let i = 0; i < labelResponses.length; i++) {
      if (labelResponses[i].error) {
        console.error(labelResponses[i].error)
        throw new Error(labelResponses[i].error)
      }
      await supabase.from('kan_task_labels').insert({ task_id: taskId, label_id: labelResponses[i].data[0].id })
    }
  }

  if (users && users.length > 0) {
    const userPromises = users.map(user =>
      supabase.from('kan_task_assignees').insert({ task_id: taskId, user_id: user })
    )

    const userResponses = await Promise.all(userPromises)

    for (let response of userResponses) {
      if (response.error) {
        console.error(response.error)
        throw new Error(response.error)
      }
    }
  }

  return { data: taskResponse.data, orgId }
})

export const updateTask = createAsyncThunk('kanban/updateTask', async ({ task, laneId }) => {
  const { data, error } = await supabase.from('kan_tasks').update(task).eq('id', task.id)
  if (error) {
    console.log(error)
  }

  return { data, laneId }
})

export const deleteTask = createAsyncThunk('kanban/deleteTask', async ({ taskId, laneId }) => {
  const { data, error } = await supabase.from('kan_tasks').delete().eq('id', taskId)
  if (error) {
    console.log(error)
  }

  return { data, laneId }
})

export const addLabel = createAsyncThunk('kanban/addLabel', async ({ orgId, title, color }) => {
  const newLabel = { pharmacy_id: orgId, title: title, color: color }
  const { data, error } = await supabase.from('kan_labels').insert(newLabel)
  if (error) {
    console.log(error)
  }

  return data
})

export const kanbanSlice = createSlice({
  name: 'kanban',
  initialState: {
    board: 'none',
    lanes: [],
    tasks: [],
    users: [],
    labels: [],
    pending: false,
    error: null, // Add an error field to the state
    previousState: null
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchBoardByOrg.pending, state => {
      state.previousState = {
        board: state.board,
        lanes: state.lanes,
        tasks: state.tasks,
        users: state.users,
        labels: state.labels
      }
      state.pending = true
      state.error = null
    })
    builder.addCase(fetchBoardByOrg.fulfilled, (state, action) => {
      const tasks = action.payload
      const lanes = {}
      tasks.forEach(task => {
        if (task.lane_id !== null) {
          if (!(task.lane_id in lanes)) {
            lanes[task.lane_id] = {
              id: task.lane_id,
              title: task.lane_title,
              position: task.lane_position,
              cards: []
            }
          }
          if (task.task_id !== null) {
            lanes[task.lane_id].cards.push({
              id: task.task_id,
              title: task.task_title,
              description: task.task_description,
              due_date: task.task_due_date,
              recurring_days: task.task_recurring_days,
              recurring_time: task.task_recurring_time,
              labels: task.labels,
              users: task.users
            })
          }
        }
      })
      state.board = tasks[0]?.board_id || 'none'
      state.lanes = Object.values(lanes)
      state.users = tasks[0]?.users || []
      state.labels = tasks[0]?.labels || []
      state.pending = false
      state.error = null
    })
    builder.addCase(fetchBoardByOrg.rejected, (state, action) => {
      state.error = action.error.message
      state.pending = false
    })
    builder.addCase(addLane.fulfilled, (state, action) => {
      if (action.payload.boardId === state.board.id) {
        state.lanes.push(action.payload.data)
      }
    })
    builder.addCase(updateLane.fulfilled, (state, action) => {
      if (action.payload.boardId === state.board.id) {
        state.lanes = state.lanes.map(lane => (lane.id === action.payload.data.id ? action.payload.data : lane))
      }
    })
    builder.addCase(deleteLane.fulfilled, (state, action) => {
      if (action.payload.boardId === state.board.id) {
        state.lanes = state.lanes.filter(lane => lane.id !== action.payload.data.id)
      }
    })
    builder.addCase(addTask.fulfilled, (state, action) => {
      if (action.payload.laneId) {
        state.tasks.push(action.payload.data)
      }
    })
    builder.addCase(updateTask.fulfilled, (state, action) => {
      if (action.payload.laneId) {
        state.tasks = state.tasks.map(task => (task.id === action.payload.data.id ? action.payload.data : task))
      }
    })
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      if (action.payload.laneId) {
        state.tasks = state.tasks.filter(task => task.id !== action.payload.data.id)
      }
    })
    builder.addCase(addLabel.fulfilled, (state, action) => {
      state.labels.push(action.payload)
    })
    builder.addCase(createFirstBoard.fulfilled, (state, action) => {
      state.board = action.payload
    })
    builder.addMatcher(
      action => action.type.endsWith('/pending'),
      state => {
        state.pending = true
        state.error = null
      }
    )
    builder.addMatcher(
      action => action.type.endsWith('/fulfilled'),
      state => {
        state.pending = false
        state.error = null
      }
    )
    builder.addMatcher(
      action => action.type.endsWith('/rejected'),
      (state, action) => {
        state.pending = false
        state.error = `An error has occured, nothing has been saved please try again. Detailse: ${action.error.message}`
        if (state.previousState) {
          state.board = state.previousState.board
          state.lanes = state.previousState.lanes
          state.tasks = state.previousState.tasks
          state.users = state.previousState.users
          state.labels = state.previousState.labels
        }
      }
    )
  }
})

export default kanbanSlice.reducer
