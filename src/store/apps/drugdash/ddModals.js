import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const modalSlice = createSlice({
  name: 'modals',
  initialState: {
    openModals: [],
    modalProps: {}
  },
  reducers: {
    openModal: (state, action) => {
      // add the payload to the openModals array
      const modalName = action.payload.modalName || action.payload
      state.openModals.push(modalName)
      // Assign modal props, using an empty object if none provided
      state.modalProps[modalName] = action.payload.props || {}
    },
    closeModal: state => {
      // remove the last item from the openModals array
      const closedModal = state.openModals.pop()
      if (closedModal) {
        delete state.modalProps[closedModal]
      }
    },
    closeSpecificModal: (state, action) => {
      // filter out the modal with the specified name
      state.openModals = state.openModals.filter(modal => modal !== action.payload)
    },
    closeAllModals: state => {
      state.openModals = []
      state.modalProps = {}
    }
  }
})

export const { openModal, closeModal, closeSpecificModal, closeAllModals } = modalSlice.actions
export default modalSlice.reducer
