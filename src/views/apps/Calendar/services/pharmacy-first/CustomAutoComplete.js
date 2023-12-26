import React, { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import { supabase } from 'src/configs/supabase'

function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

const CustomAutoCompleteInput = ({
  tableName,
  setSelectValue,
  displayField,
  onSelect,
  onAdd,
  value,
  setValue,
  placeholder,
  label
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
      let { data, error } = await supabase.from(tableName).select('*').ilike(displayField, `%${searchValue}%`)
      if (error) throw error
      setOptions(data)
      setNoResults(data.length === 0) // Set noResults flag based on search results
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
      return options
    }
    return [{ [displayField]: `Add ${inputValue}`, isAddNew: true, inputValue }]
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
            value={value}
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
        getOptionLabel={option => {
          if (typeof option === 'string') {
            return option || ''
          }
          if (option.inputValue) {
            return option[displayField] || ''
          }

          return option[displayField] || ''
        }}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            // Handle string input
            // setValue({ [displayField]: newValue })
            onSelect({ [displayField]: newValue })
          } else if (newValue && newValue.isAddNew) {
            // If the "Add new" option was selected
            console.log('ADD NEW PATIENT MODAL', newValue.inputValue)
            setValue({ [displayField]: newValue.inputValue })
            onAdd()
          } else {
            // Set the entire selected object
            setValue(newValue)
            onSelect(newValue)
          }
        }}
        filterOptions={filterOptions}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </React.Fragment>
  )
}

export default CustomAutoCompleteInput
