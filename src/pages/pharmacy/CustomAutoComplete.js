import React, { useState, useEffect } from 'react'

// app imports
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg } from 'src/configs/supabase'
import DialogForm from './DialogForm'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { getBottomNavigationActionUtilityClass } from '@mui/material'

const filter = createFilterOptions()

const AutocompleteCreatable = ({
  table,
  handleNewItemMain,
  labelText,
  mainValue,
  setMainValue,
  handlePatientChange,
  selectedPatient,
  ...props
}) => {
  const [value, setValue] = useState(null)
  const [open, toggleOpen] = useState(false)
  const [openAutoComplete, setOpenAutoComplete] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [data, setData] = useState(props?.data)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [collectors, setCollectors] = useState(null)
  const organisationId = useOrgAuth()?.organisation?.id
  const supabase = supabaseOrg

  // console.log({ mainValue, table, value })

  useEffect(() => {
    setData(props?.data)
  }, [props?.data])

  useEffect(() => {
    const fetchCollectors = async () => {
      const { data: collectorsData, error: collectorsError } = await supabase
        .from('cdr_collectors')
        .select('*')
        .eq('organisation_id', organisationId)
        .eq('patient', selectedPatient?.id)
      if (collectorsError) throw collectorsError
      setData(collectorsData)
      console.log('collectorsData', collectorsData)
    }
    if (selectedPatient && table === 'cdr_collectors') {
      fetchCollectors()
    }
  }, [selectedPatient])

  useEffect(() => {
    if (mainValue) {
      console.log('Setting value to: ', table, mainValue)
      setValue(mainValue)
    }
  }, [mainValue, setValue])

  const [dialogValue, setDialogValue] = useState({
    name: '',
    registration: '',
    address: '',
    patient_address: ''
  })

  const getOptionValue = (table, option) => {
    //** this method is used to get the value of the option selected in the autocomplete from the object return on selection
    console.log('getOptionValue', table, option)
    switch (table) {
      case 'cdr_patients':
        return option?.patient_name
      case 'cdr_collectors':
        return option?.name
      case 'cdr_suppliers':
        return option.name
      case 'cdr_prescribers':
        return option.name
      default:
        return option.title
    }
  }

  const getOptionTitle = (table, inputValue) => {
    //** becuase we are filtering different tables we need to return the correct title for the option selected this allows the title to be dynamic depending on the table
    switch (table) {
      case 'cdr_patients':
        return { patient_name: `Save ${inputValue}` }
      case 'cdr_suppliers':
        return { name: `Save ${inputValue}` }
      case 'cdr_collectors':
        return { name: `Save ${inputValue}` }
      case 'cdr_prescribers':
        return { name: `Save ${inputValue}` }
      default:
        return { title: `Save ${inputValue}` }
    }
  }

  const handleNewItem = async event => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    console.log('STARING handleNewItem')

    // Depending on the table, the dialogValue object might need to be reshaped
    const values = {
      organisation_id: organisationId,
      ...(table === 'cdr_patients' && {
        patient_name: dialogValue.name,
        address: dialogValue.address
      }),
      ...(table === 'cdr_suppliers' && {
        name: dialogValue.name,
        address: dialogValue.address
      }),
      ...(table === 'cdr_prescribers' && {
        name: dialogValue.name,
        registration: dialogValue.registration,
        address: dialogValue.address
      }),
      ...(table === 'cdr_collectors' && {
        name: dialogValue.name,
        relationship: dialogValue.relationship,
        patient: selectedPatient?.id
      })
    }

    console.log('VALUES prepared ', values)

    const error = await handleNewItemMain(values, table)

    if (error) {
      console.error('There was an error inserting the new item:', error.message)
      setError(error.message)
    } else {
      // reset dialogValue and close the dialog
      setDialogValue({
        name: '',
        registration: '',
        address: ''
      })
      toggleOpen(false)

      const getOptionTitle = (table, dialogvalue) => {
        console.log(dialogvalue, 'dialogvalue')
        switch (table) {
          case 'cdr_patients':
            return dialogvalue?.name ? `${dialogvalue.name}, ${dialogvalue.address}` : ''
          case 'cdr_collectors':
            return dialogvalue?.name ? `${dialogvalue.name}, ${dialogvalue.relationship}` : ''
          case 'cdr_suppliers':
          case 'cdr_prescribers':
            return dialogvalue?.name ? `${dialogvalue.name}, ${dialogvalue.address}` : ''
          default:
            return dialogvalue.title ? `${dialogvalue.title}, ${dialogvalue.address}` : ''
        }
      }

      // set the new value in Autocomplete
      setMainValue(getOptionTitle(table, dialogValue))
    }
    setLoading(false)
  }

  const handleSubmit = event => {
    event.preventDefault()
    setValue({
      title: dialogValue.title
    })

    // call your API to add to supabase table here...

    toggleOpen(false)
  }

  return (
    <div>
      <Autocomplete
        freeSolo
        clearOnBlur
        value={value}
        selectOnFocus
        handleHomeEndKeys
        options={data}
        onInputChange={(event, newInputValue, reason) => {
          //* this function fired on text input change or when selection is changed
          if (reason === 'input') {
            setUserInput(newInputValue)
            setOpenAutoComplete(true) // Open the options list when the user types something
          } else if (reason === 'reset' || reason === 'clear') {
            setOpenAutoComplete(false) // Close the options list when the input is cleared or reset
          }
        }}
        id='autocomplete-free-solo-with-text'
        //* renderOption allows you to customise the look of the dropdown list. Also render the options in the dropdown list
        renderOption={(props, option) => <li {...props}>{getOptionValue(table, option)}</li>}
        //* renderInPut allows you to customise the input field
        renderInput={params => <TextField multiline minRows={2} {...params} label={labelText} />}
        getOptionLabel={option => {
          //* This renders the text into the Inputfield
          // Treat `option` as an object with a `title` property,
          if (typeof option === 'string') {
            return option
          }
          if (option.inputValue) {
            return option.inputValue
          }
          // console.log(option)
          const getOptionTitle = (table, option) => {
            switch (table) {
              case 'cdr_patients':
                return option?.patient_name ? `${option.patient_name}, ${option.address}` : ''
              case 'cdr_collectors':
                return option?.name ? `${option.name}, ${option.relationship}` : ''
              case 'cdr_suppliers':
              case 'cdr_prescribers':
                return option?.name ? `${option.name}, ${option.address}` : ''
              default:
                return option.title ? `${option.title}, ${option.address}` : ''
            }
          }
          console.log('GET OPTION LABEL', getOptionTitle(table, option))
          return getOptionTitle(table, option)
        }}
        onChange={(event, newValue) => {
          if (newValue && newValue.inputValue) {
            // Treat `newValue` as an object with a `title` property
            if (newValue.inputValue.startsWith('save')) {
              const [name, address] = newValue.inputValue.slice(5).split(',')

              setDialogValue(prevState => ({
                ...prevState,
                name: name.trim(),
                ...(address && { address: address.trim() }) // add address only if it's defined
              }))

              toggleOpen(true)
            }
            setValue(userInput)
          } else if (typeof newValue === 'string') {
            setValue({ title: newValue })
          } else {
            setValue(newValue)

            const getOptionTitle = (table, option) => {
              switch (table) {
                case 'cdr_patients':
                  return option?.patient_name
                    ? `${option.patient_name}${option.address ? ', ' + option.address : ''}`
                    : ''
                case 'cdr_collectors':
                  return option?.name ? `${option.name}${option.relationship ? ', ' + option.relationship : ''}` : ''
                case 'cdr_suppliers':
                case 'cdr_prescribers':
                  return option?.name ? `${option.name}${option.address ? ', ' + option.address : ''}` : ''
                default:
                  return option?.title ? `${option.title}${option.address ? ', ' + option.address : ''}` : ''
              }
            }
            if (handlePatientChange) {
              handlePatientChange(newValue)
              //   console.log('newValue', newValue)
            }
            setMainValue(getOptionTitle(table, newValue))
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params)
          const { inputValue } = params
          const isExisting = options.some(option => inputValue === getOptionValue(table, option))
          if (inputValue !== '' && !isExisting && openAutoComplete) {
            filtered.push({
              inputValue: `save ${inputValue}`,
              ...getOptionTitle(table, inputValue)
            })
          }

          return filtered
        }}
      />
      <DialogForm
        table={table}
        dialogValue={dialogValue}
        setDialogValue={setDialogValue}
        handleNewItem={handleNewItem}
        open={open}
        handleClose={() => toggleOpen(false)}
      />
    </div>
  )
}

export default AutocompleteCreatable
