import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const modalSlice = createSlice({
  name: 'modals',
  initialState: {
    openModals: []
  },
  reducers: {
    openModal: (state, action) => {
      // add the payload to the openModals array
      state.openModals.push(action.payload)
    },
    closeModal: state => {
      // remove the last item from the openModals array
      state.openModals.pop()
    },
    closeSpecificModal: (state, action) => {
      // filter out the modal with the specified name
      state.openModals = state.openModals.filter(modal => modal !== action.payload)
    }
  }
})

export const { openModal, closeModal, closeSpecificModal } = modalSlice.actions
export default modalSlice.reducer
