//* Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg } from 'src/configs/supabase'
import { v4 as uuidv4 } from 'uuid'
//* Imports end

//! declaire supabase var
const supabase = supabaseOrg
//! declaire supabase var end

//! Fetch Base (Fetch the organisations board if exists, fetch Data if board exists, create board if non exists)
export const createFirstBoard = createAsyncThunk('kanban/createFirstBoard', async (organisationId, thunkAPI) => {
  const { data, error } = await supabase.from('kan_boards').insert({ pharmacy_id: organisationId })
  if (error) {
    console.log(error)

    return thunkAPI.rejectWithValue(error)
  }

  return data
})

export const fetchOrgData = createAsyncThunk('kanban/fetchOrgData', async orgId => {
  const { data, error } = await supabase.rpc('get_org_data', { organisation_id: orgId })
  if (error) {
    console.log(error)
    throw Error(error.message)
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
//! Fetch Base end

//! Lane Management
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
//! Lane Management End

//! Task Management
export const addTask = createAsyncThunk('kanban/addTask', async ({ task, orgId, labels, users }, thunkAPI) => {
  const { dispatch } = thunkAPI

  // Generate a new UUID for the task and update local state
  const maintaskId = uuidv4()
  task.id = maintaskId
  dispatch(taskAdded({ task, labels, users, orgId }))

  // async update the task in the database
  const taskResponse = await supabase.from('kan_tasks').insert(task).select('id')
  if (taskResponse.error) {
    console.error(taskResponse.error)
    dispatch(taskAddFailed({ task, orgId }))
    throw new Error(taskResponse.error)
  }

  // get the task id from the response
  const taskId = taskResponse.data[0].id

  // Insert the task labels into the kan_task_labels table if there are any
  if (labels && labels.length > 0) {
    const labelPromises = labels.map(label => {
      return supabase.from('kan_task_labels').insert({ task_id: taskId, label_id: label.id }).select('id')
    })
    const labelResponses = await Promise.all(labelPromises)
    for (let response of labelResponses) {
      if (response.error) {
        console.error(response.error)
        throw new Error(response.error)
      }
    }
  }

  // Insert the task assignees into the kan_task_assignees table if there are any
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

export const addRecurringTask = createAsyncThunk(
  'kanban/addRecurringTask',
  async ({ task, orgId, labels, users }, thunkAPI) => {
    // const dispatch = thunkAPI.dispatch
    // Insert the recurring schedule into the kan_recurring_tasks table
    const recurringTaskResponse = await supabase
      .from('kan_recurring_tasks')
      .insert({
        ...task,
        updated_at: new Date()
      })
      .select('id')
    if (recurringTaskResponse.error) {
      console.error(recurringTaskResponse.error)
      throw new Error(recurringTaskResponse.error)
    }
    const recurringTaskId = recurringTaskResponse.data[0].id
    return recurringTaskId
  }
)

export const updateTask = createAsyncThunk('kanban/updateTask', async ({ task, labels, users, laneId }, thunkAPI) => {
  const { dispatch, getState } = thunkAPI

  const state = getState()?.kanban
  const originalTask = state.lanes.flatMap(lane => lane.cards).find(card => card.id === task.id)
  // const taskIndex = originalLane.cards.findIndex(card => card.id === task.id)

  // Optimistically update the task in the state
  dispatch(taskUpdated({ task, laneId, labels, users, laneId }))

  const taskResponse = await supabase
    .from('kan_tasks')
    .update({ ...task, updated_at: new Date() })
    .eq('id', task.id)
    .select('id')

  if (taskResponse.error) {
    console.error(taskResponse.error)
    // Rollback the optimistic update if the request failed
    dispatch(taskUpdateFailed({ task: originalTask, laneId }))
    throw new Error(taskResponse.error)
  }

  const taskId = taskResponse.data[0].id

  // Remove existing label associations
  const labelDeleteResponse = await supabase.from('kan_task_labels').delete().eq('task_id', taskId)

  if (labelDeleteResponse.error) {
    console.error(labelDeleteResponse.error)
    throw new Error(labelDeleteResponse.error)
  }

  // Remove existing user associations
  const userDeleteResponse = await supabase.from('kan_task_assignees').delete().eq('task_id', taskId)

  if (userDeleteResponse.error) {
    console.error(userDeleteResponse.error)
    throw new Error(userDeleteResponse.error)
  }

  if (labels && labels.length > 0) {
    const labelPromises = labels.map(label => {
      return supabase.from('kan_task_labels').insert({ task_id: taskId, label_id: label.id })
    })

    const labelResponses = await Promise.all(labelPromises)

    for (let response of labelResponses) {
      if (response.error) {
        console.error(response.error)
        throw new Error(response.error)
      }
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

  return { data: taskResponse.data, laneId }
})

export const updateRecurringTask = createAsyncThunk('kanban/updateRecurringTask', async ({ task }) => {
  // Update the recurring schedule in the kan_recurring_tasks table
  const recurringTaskResponse = await supabase
    .from('kan_recurring_tasks')
    .update({
      ...task,
      updated_at: new Date()
    })
    .eq('id', task.recurring_task_id)
    .select('id')

  if (recurringTaskResponse.error) {
    console.error(recurringTaskResponse.error)
    throw new Error(recurringTaskResponse.error)
  }

  // Return the recurring task ID
  return task.recurring_task_id
})

export const moveTask = createAsyncThunk('kanban/moveTask', async ({ taskId, toLaneId }, { getState, dispatch }) => {
  // Save the task to be moved and its original lane for possible rollback
  const state = getState()
  const originalLane = state.kanban.lanes.find(lane => lane.cards.find(card => card.id === taskId))
  const originalLaneId = originalLane.id
  const taskIndex = originalLane.cards.findIndex(card => card.id === taskId)
  const originalTask = originalLane.cards[taskIndex]
  const now = new Date()

  // Create a copy of the task with an updated 'updated_at' timestamp for optimistic update
  const updatedTask = { ...originalTask, updated_at: now }

  // Optimistic update: move the task in the state
  dispatch(taskMoved({ taskId, fromLaneId: originalLaneId, toLaneId, updatedTask }))

  const taskResponse = await supabase
    .from('kan_tasks')
    .update({ lane_id: toLaneId, updated_at: now })
    .eq('id', taskId)
    .select('id')

  if (taskResponse.error) {
    // If the backend update failed, rollback the optimistic update
    dispatch(taskMoveFailed({ originalTask, fromLaneId: originalLaneId, toLaneId, taskIndex }))

    console.error(taskResponse.error)
    throw new Error(taskResponse.error)
  }

  return { data: taskResponse.data, laneId: toLaneId }
})

export const deleteTask = createAsyncThunk('kanban/deleteTask', async ({ taskId, laneId }, { getState, dispatch }) => {
  // Save the task to be deleted and its index for possible rollback
  const state = getState()
  const originalLane = state.kanban.lanes.find(lane => lane.id === laneId)
  const taskIndex = originalLane.cards.findIndex(card => card.id === taskId)
  const originalTask = originalLane.cards[taskIndex]

  // Optimistic update: remove the task from the state
  dispatch(taskDeleted({ taskId, laneId }))
  const { data, error } = await supabase.from('kan_tasks').delete().eq('id', taskId)
  if (error) {
    // If the backend deletion failed, rollback the optimistic update
    dispatch(taskDeleteFailed({ originalTask, laneId, taskIndex }))
    console.log(error)
  }
  return { data, laneId }
})

export const deleteRecurringTask = createAsyncThunk('kanban/deleteRecurringTask', async ({ taskId }) => {
  const { error } = await supabase.from('kan_recurring_tasks').delete().eq('id', taskId)

  if (error) {
    console.error(error)
    throw new Error(error)
  }
})
//! Task Management end

//! Label management
export const addLabel = createAsyncThunk('kanban/addLabel', async ({ orgId, title, color }) => {
  const newLabel = { pharmacy_id: orgId, title: title, color: color }
  const { data, error } = await supabase.from('kan_labels').insert(newLabel)
  if (error) {
    console.log(error)
  }

  return data
})
//! Label management end

//! State
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
    snackbarMessage: null,
    previousState: null
  },
  reducers: {
    setSnackbarMessage: (state, action) => {
      state.snackbarMessage = action.payload
    },
    taskMoved: (state, action) => {
      const { taskId, fromLaneId, toLaneId, updatedTask } = action.payload

      // Remove the task from its original lane
      let fromLane = state.lanes.find(lane => lane.id === fromLaneId)
      if (fromLane) {
        console.log({ fromLane })
        fromLane.cards = fromLane.cards.filter(card => card.id !== taskId)
      }

      // Add the updated task to its new lane
      let toLane = state.lanes.find(lane => lane.id === toLaneId)
      if (toLane) {
        console.log({ toLane })
        toLane.cards.unshift(updatedTask)
      }
    },
    taskMoveFailed: (state, action) => {
      const { originalTask, fromLaneId, toLaneId, taskIndex } = action.payload

      // Remove the task from its new lane
      let toLane = state.lanes.find(lane => lane.id === toLaneId)
      if (toLane) {
        toLane.cards = toLane.cards.filter(card => card.id !== originalTask.id)
      }

      // Add the task back to its original lane at its original index
      let fromLane = state.lanes.find(lane => lane.id === fromLaneId)
      if (fromLane) {
        fromLane.cards.splice(taskIndex, 0, originalTask)
      }
    },
    taskAdded: (state, action) => {
      const { task, orgId, labels, users } = action.payload

      // Find the lane to add the task to
      const lane = state.lanes.find(lane => lane.id === task.lane_id)
      // using javascript sets, to get user details from the user ids
      const userSet = new Set(users)
      let usersInfo = state.users.filter(user => userSet.has(user.id))

      console.log({ usersInfo })
      if (lane) {
        // Add the task to the lane's cards
        lane.cards.push({
          id: task.id,
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          complete: task.complete,
          recurring_days: task.recurring_days,
          recurring_time: task.recurring_time,
          recurring_id: task.recurring_task_id,
          labels: labels,
          users: usersInfo
        })
      }
    },
    taskAddFailed: (state, action) => {
      const { task, orgId, labels, users } = action.payload
      // Remove the task from the state
      let lane = state.lanes.find(lane => lane.id === task.lane_id)
      if (lane) {
        let index = lane.cards.findIndex(card => card.id === task.id)
        if (index !== -1) {
          lane.cards.splice(index, 1)
        }
      }
      // Remove the users from the task
      if (users && users.length > 0) {
        let task = state.lanes.flatMap(lane => lane.cards).find(card => card.id === task.id)
        if (task) {
          task.users = task.users.filter(user => !users.includes(user))
        }
      }
    },
    taskUpdated: (state, action) => {
      const { task, labels, users, laneId } = action.payload
      // Find the lane to add the task to
      const lane = state.lanes.find(lane => lane.id === laneId)
      const taskIndex = lane ? lane.cards.findIndex(card => card.id === task.id) : -1

      // using javascript sets, to get user details from the user ids
      const userSet = new Set(users)
      let usersInfo = state.users.filter(user => userSet.has(user.id))

      if (taskIndex !== -1) {
        // Replace the task's current values with the new task values
        lane.cards[taskIndex] = {
          ...task,
          labels: labels,
          users: usersInfo
        }
      }
    },
    taskUpdateFailed: (state, action) => {
      const { task, laneId } = action.payload
      const lane = state.lanes.find(lane => lane.id === laneId)
      if (lane) {
        const taskIndex = lane.cards.findIndex(card => card.id === task.id)
        if (taskIndex !== -1) {
          lane.cards[taskIndex] = task // Replace the updated task with the original one
        }
      }
    },
    taskDeleted: (state, action) => {
      const { taskId, laneId } = action.payload

      // Remove the task from the state
      let lane = state.lanes.find(lane => lane.id === laneId)
      if (lane) {
        lane.cards = lane.cards.filter(card => card.id !== taskId)
      }
    },

    taskDeleteFailed: (state, action) => {
      const { originalTask, laneId, taskIndex } = action.payload

      // Add the task back to the state at its original index
      let lane = state.lanes.find(lane => lane.id === laneId)
      if (lane) {
        lane.cards.splice(taskIndex, 0, originalTask)
      }
    }
  },
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
              title: task.task_title || null,
              description: task.task_description || null,
              due_date: task.task_due_date,
              complete: task.task_complete,
              recurring_days: task.task_recurring_days || null,
              recurring_time: task.task_recurring_time || null,
              recurring_id: task.recurring_task_id || null,
              labels: task.labels || [],
              users: task.users || []
            })
          }
        }
      })

      state.board = tasks[0]?.board_id || 'none'
      state.lanes = Object.values(lanes)
      // state.users = tasks[0]?.users || []
      // state.labels = tasks[0]?.labels || []
      state.pending = false
      state.error = null
    })
    builder.addCase(fetchOrgData.fulfilled, (state, action) => {
      const orgData = action.payload
      const users = orgData.filter(item => item.type === 'user')
      const labels = orgData.filter(item => item.type === 'label')

      state.users = users
      state.labels = labels

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
        // state.tasks.push(action.payload.data)
      }
      console.log('databse task added successfully')
      const taskId = action.payload.data.id
      state.snackbarMessage = `Task ${taskId} added successfully`
    })
    builder.addCase(updateTask.fulfilled, (state, action) => {
      if (action.payload.laneId) {
        // state.tasks = state.tasks.map(task => (task.id === action.payload.data.id ? action.payload.data : task))
      }
      const taskId = action.payload.data.id
      state.snackbarMessage = `Task ${taskId} added successfully`
    })
    builder.addCase(moveTask.fulfilled, (state, action) => {
      const { data: updatedTask, laneId: newLaneId } = action.payload

      const oldLane = state.lanes.find(lane => lane.cards.find(card => card.id === updatedTask.id))

      // if (oldLane) {
      //   oldLane.cards = oldLane.cards.filter(card => card.id !== updatedTask.id)
      // }

      // const newLane = state.lanes.find(lane => lane.id === newLaneId)

      // if (newLane) {
      //   newLane.cards.push(updatedTask)
      // }
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
        // state.pending = true
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
        state.snackbarMessage = `An error has occured, nothing has been saved please try again. Detailse: ${action.error.message}`
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

export const {
  taskAdded,
  taskAddFailed,
  taskDeleteFailed,
  taskDeleted,
  taskMoved,
  taskMoveFailed,
  taskUpdated,
  taskUpdateFailed
} = kanbanSlice.actions
