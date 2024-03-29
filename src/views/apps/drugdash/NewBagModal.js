import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PatientSearch from './NewBagComponents/PatientSearch'
import PatientDetails from './NewBagComponents/PatientDetails'
import { fetchPatients } from 'src/store/apps/drugdash/ddPatients'
import { openModal } from 'src/store/apps/drugdash/ddModals'

function NewBagModal() {
  const dispatch = useDispatch()
  const selectedPatient = useSelector(state => state.ddPatients.selectedPatient)

  // This state will hold the input data
  const [inputData, setInputData] = useState('')

  const handleBackClick = () => {
    dispatch({ type: 'ddPatients/removeSelectedPatient' })
  }

  useEffect(() => {
    dispatch(fetchPatients())
  }, [dispatch])

  // useEffect(() => {
  //   if (selectedPatient) {
  //     dispatch(openModal('patientDetails'))
  //   }
  //   dispatch(fetchPatients())
  // }, [selectedPatient, dispatch])

  return (
    <div>
      <PatientSearch inputData={inputData} setInputData={setInputData} />
    </div>
  )
}

export default NewBagModal
