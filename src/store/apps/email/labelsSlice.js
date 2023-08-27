import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Initial state for the labels slice
const initialState = {
  labels: [],
  status: 'idle', // can be 'idle', 'loading', 'succeeded', 'failed'
  error: null
}

// Thunks for CRUD operations on email_labels

export const fetchLabels = createAsyncThunk('labels/fetchLabels', async (_, { getState }) => {
  const orgId = getState().organisation.organisation.id

  // Fetching both predefined and organization-specific labels
  const { data, error } = await supabase
    .from('email_labels')
    .select('*')
    .or(`organisation_id.eq.${orgId},organisation_id.is.null`)

  if (error) throw error
  return data
})

export const createLabel = createAsyncThunk('labels/createLabel', async (newLabel, { getState }) => {
  const orgId = getState().organisation.organisation.id
  const userId = getState().user.id

  const labelWithOrgUser = {
    ...newLabel,
    organisation_id: orgId,
    user_id: userId
  }

  const { data, error } = await supabase.from('email_labels').insert(labelWithOrgUser)
  if (error) throw error
  return data
})

export const updateLabel = createAsyncThunk('labels/updateLabel', async updatedLabel => {
  const { data, error } = await supabase.from('email_labels').update(updatedLabel).eq('id', updatedLabel.id)
  if (error) throw error
  return data
})

export const deleteLabel = createAsyncThunk('labels/deleteLabel', async labelId => {
  const { data, error } = await supabase.from('email_labels').delete().eq('id', labelId)
  if (error) throw error
  return data
})

// The labels slice

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchLabels.pending]: state => {
      state.status = 'loading'
    },
    [fetchLabels.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.labels = action.payload
    },
    [fetchLabels.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },

    [createLabel.fulfilled]: (state, action) => {
      state.labels.push(action.payload)
    },

    [updateLabel.fulfilled]: (state, action) => {
      const index = state.labels.findIndex(label => label.id === action.payload.id)
      if (index !== -1) {
        state.labels[index] = action.payload
      }
    },

    [deleteLabel.fulfilled]: (state, action) => {
      const index = state.labels.findIndex(label => label.id === action.payload.id)
      if (index !== -1) {
        state.labels.splice(index, 1)
      }
    }
  }
})

// Selectors

export const selectAllLabels = state => state.labels.labels
export const selectLabelById = (state, labelId) => state.labels.labels.find(label => label.id === labelId)

export default labelsSlice.reducer
