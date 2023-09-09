import React, { useState, useEffect } from 'react'
import { debounce } from 'lodash'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedPatient, setSearchTerm } from 'src/store/apps/drugdash/ddPatients'
import { openModal } from 'src/store/apps/drugdash/ddModals'

function PatientSearch({ inputData, setInputData }) {
  const [options, setOptions] = useState([])
  const dispatch = useDispatch()
  const searchedPatients = useSelector(state => state.ddPatients.searchedPatients)
  const patients = useSelector(state => state.ddPatients.patients)

  useEffect(() => {
    if (inputData.first_name) {
      setOptions([
        ...searchedPatients,
        { inputValue: `Add new: ${inputData.first_name}`, first_name: inputData.first_name, last_name: '', isNew: true }
      ])
    } else {
      setOptions([])
    }
  }, [searchedPatients, inputData.first_name])

  const handleOptionClick = option => {
    dispatch(setSelectedPatient(option))
  }

  const openAddPatientModal = () => {
    dispatch(openModal('addEditPatient'))
  }

  const debouncedSearch = debounce(newValue => {
    dispatch(setSearchTerm(newValue))
  }, 300)

  const handleSearch = newValue => {
    debouncedSearch(newValue)
  }

  return (
    <div>
      <Autocomplete
        freeSolo
        clearOnBlur
        value={inputData.first_name}
        selectOnFocus
        handleHomeEndKeys
        id='patient-search'
        options={options}
        onInputChange={(event, newValue) => {
          setInputData({ ...inputData, first_name: newValue })
          handleSearch(newValue)
        }}
        onBlur={() => {
          setOptions([])
          setInputData({ first_name: '', last_name: '' })
        }}
        renderInput={params => <TextField {...params} label='Search Patients' variant='outlined' fullWidth />}
        getOptionLabel={option => {
          console.log('OPTION', option)
          if (typeof option === 'string') {
            return option
          }
          if (option.inputValue) {
            return option.inputValue
          }
          return `${option.first_name} ${option.last_name}`
        }}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setInputData({ first_name: newValue, last_name: '' })
          } else if (newValue?.inputValue) {
            openAddPatientModal()
          } else {
            setInputData({ first_name: newValue.first_name, last_name: newValue.last_name })
            handleOptionClick(newValue)
          }
        }}
        renderOption={(props, option) => (
          <div {...props}>
            {option.isNew ? (
              <>
                {option.first_name}
                <Button
                  color='primary'
                  size='small'
                  style={{ marginLeft: '10px' }}
                  onClick={e => {
                    e.stopPropagation()
                    openAddPatientModal()
                  }}
                >
                  Add New
                </Button>
              </>
            ) : (
              <>
                <span style={{ verticalAlign: 'middle' }}>
                  {option.first_name} {option.last_name}
                </span>
                <span style={{ fontStyle: 'italic', fontSize: '0.8em', marginLeft: '5px', verticalAlign: 'bottom' }}>
                  {option.address}
                </span>
              </>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default PatientSearch
