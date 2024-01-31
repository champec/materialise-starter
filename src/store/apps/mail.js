
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import { supabase } from 'src/configs/supabase'

// ** Fetch Mails
// ** Fetch Mails
export const fetchMails = createAsyncThunk('appEmail/fetchMails', async params => {
  let query = supabase
    .from('emails')
    .select('*')

  // Add any filters to the query based on params
  if (params.folder) {
    query = query.eq('folder', params.folder)
  }
  if (params.label) {
    query = query.eq('label', params.label)
  }
  if (params.q) {
    query = query.ilike('subject', `%${params.q}%`)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return { emails: data, filter: params } // Assuming your emails table structure matches what your components expect
})


// ** Get Current Mail
export const getCurrentMail = createAsyncThunk('appEmail/selectMail', async id => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data // Assuming your emails table structure matches what your components expect
})

// ** Update Mail
export const updateMail = createAsyncThunk('appEmail/updateMail', async (params, { dispatch, getState }) => {
  const { data, error } = await supabase
    .from('emails')
    .update(params.dataToUpdate)
    .in('id', params.emailIds)

  if (error) throw new Error(error.message)

  // Refetch mails and possibly the current mail
  await dispatch(fetchMails(getState().email.filter))
  if (Array.isArray(params.emailIds)) {
    await dispatch(getCurrentMail(params.emailIds[0]))
  }

  return data
})


// ** Update Mail Label
export const updateMailLabel = createAsyncThunk('appEmail/updateMailLabel', async (params, { dispatch, getState }) => {
  const { data, error } = await supabase
    .from('emails')
    .update({ label: params.label })
    .in('id', params.emailIds)

  if (error) throw new Error(error.message)

  // Refetch mails to reflect the label change
  await dispatch(fetchMails(getState().email.filter))
  if (Array.isArray(params.emailIds)) {
    await dispatch(getCurrentMail(params.emailIds[0]))
  }

  return data
})


// ** Prev/Next Mails
// ** Prev/Next Mails
export const paginateMail = createAsyncThunk('appEmail/paginateMail', async (params, { getState }) => {
  let query = supabase
    .from('emails')
    .select('*')
    .order('createdAt', { ascending: false }) // Assuming 'createdAt' is your timestamp column

  // Adjust the query based on the pagination direction and the last loaded email's timestamp or ID
  if (params.direction === 'next') {
    query = query.gt('createdAt', params.lastLoadedEmailTimestamp)
  } else if (params.direction === 'prev') {
    query = query.lt('createdAt', params.firstLoadedEmailTimestamp)
  }

  // Limit the number of emails fetched for pagination
  query = query.limit(params.limit || 10)

  const { data, error } = await query

  if (error) throw new Error(error.message)

  // Return the paginated set of emails
  return data
})


export const appMailSlice = createSlice({
  name: 'appEmail',
  initialState: {
    mails: null,
    mailMeta: null,
    filter: {
      q: '',
      label: '',
      folder: 'inbox'
    },
    currentMail: null,
    selectedMails: []
  },
  reducers: {
    handleSelectMail: (state, action) => {
      const mails = state.selectedMails
      if (!mails.includes(action.payload)) {
        mails.push(action.payload)
      } else {
        mails.splice(mails.indexOf(action.payload), 1)
      }
      state.selectedMails = mails
    },
    handleSelectAllMail: (state, action) => {
      const selectAllMails = []
      if (action.payload && state.mails !== null) {
        selectAllMails.length = 0

        // @ts-ignore
        state.mails.forEach(mail => selectAllMails.push(mail.id))
      } else {
        selectAllMails.length = 0
      }
      state.selectedMails = selectAllMails
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchMails.fulfilled, (state, action) => {
      state.mails = action.payload.emails
      state.filter = action.payload.filter
      state.mailMeta = action.payload.emailsMeta
    })
    builder.addCase(getCurrentMail.fulfilled, (state, action) => {
      state.currentMail = action.payload
    })
    builder.addCase(paginateMail.fulfilled, (state, action) => {
      state.currentMail = action.payload
    })
  }
})

export const { handleSelectMail, handleSelectAllMail } = appMailSlice.actions

export default appMailSlice.reducer
