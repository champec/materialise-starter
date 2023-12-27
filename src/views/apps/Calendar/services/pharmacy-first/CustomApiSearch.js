import React, { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import { supabase } from 'src/configs/supabase'
import { fetchGPs } from 'src/store/apps/services'

function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

const CustomApiSearch = ({
  tableName,
  setSelectValue,
  displayField,
  onSelect,
  onAdd,
  value,
  setValue,
  placeholder,
  label,
  dispatch
}) => {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [noResults, setNoResults] = useState(false)
  const debounceSearch = useRef(debounce(nextValue => search(nextValue), 500)).current
  const filter = createFilterOptions()

  const search = async searchValue => {
    if (!searchValue) {
      setOptions([])
      setNoResults(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await dispatch(fetchGPs(searchValue))

      console.log('response', response.payload)
      setOptions(Array.isArray(response.payload) ? response.payload : [])
      setNoResults(response.payload?.length === 0) // Set noResults flag based on search results
    } catch (error) {
      setError('Failed to fetch data')
      console.error('Error fetching data: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    debounceSearch(value)
  }, [value])

  const filterOptions = (options, { inputValue }) => {
    if (inputValue === '' || !noResults) {
      return options;
    }
    // Return an array with a special object indicating no results
    // Adjust as needed for your UI
    return [{ OrganisationName: 'No results found', disabled: true }];
  }


  const displayOption = option => {
    if (option.isAddNew) {
      return option.inputValue
    }

    return (
      <ListItem>
        <ListItemText primary={option.OrganisationName} secondary={`${option?.Address1}, ${option?.City}`} />
      </ListItem>
    )
  }

  return (
    <React.Fragment>
      <Autocomplete
        freeSolo
        clearOnBlur
        value={value}
        fullWidth
        selectOnFocus
        handleHomeEndKeys
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            autoComplete='new-password'
            type='text'
            // value='Champe 3'
            onChange={setValue}
            label={label}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color='inherit' size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        renderOption={(props, option) => {
          // This renders the rich list item in the dropdown
          return (
            <li {...props}>
              <ListItemText primary={option.OrganisationName} secondary={`${option?.Address1}, ${option?.City}`} />
            </li>
          )
        }}
        getOptionLabel={option =>
          // This ensures only the name is displayed in the text field after selection
          typeof option === 'string' ? option : option.OrganisationName || ''
        }
        onChange={(event, newValue) => {
          console.log('newValue', newValue)
          // if (typeof newValue === 'string') {
          //   // Handle string input
          //   // setValue({ [displayField]: newValue })
          //   onSelect({ [displayField]: newValue })
          // }
          //else if (newValue && newValue.isAddNew) {
          //   // If the "Add new" option was selected
          //   console.log('ADD NEW PATIENT MODAL', newValue.inputValue)
          //   setValue(newValue.inputValue)
          //   onAdd()
          // else {
          // Set the entire selected object
          // onSelect(newValue)

          setValue(newValue?.OrganisationName)
          onSelect(newValue)
          // }
        }}
        filterOptions={filterOptions}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </React.Fragment>
  )
}

export default CustomApiSearch
