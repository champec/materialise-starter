import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchGPs } from 'src/store/apps/services';

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const CustomApiSearch = ({
  onSelect,
  value,
  setValue,
  label,
  dispatch,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debounceSearch = useRef(debounce(nextValue => search(nextValue), 500)).current;

  const search = async searchValue => {
    console.log("SEARCH API: ", searchValue)
    if (!searchValue) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await dispatch(fetchGPs(searchValue));
      setOptions(response.payload || []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("USE EFFECT search term: ", searchTerm)
    debounceSearch(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (_, newInputValue) => {
    setSearchTerm(newInputValue);
  };

  const handleChange = (_, newValue) => {
    setValue(newValue);
    onSelect(newValue);
    // Construct the display string from the selected item's properties
    if (newValue) {
      setSearchTerm(`${newValue.OrganisationName}, ${newValue.Address1}, ${newValue.City}`);
    } else {
      setSearchTerm('');
    }
  };

  const getOptionLabel = (option) => {
    // Concatenate the OrganisationName with address details for display
    return `${option.OrganisationName}, ${option.Address1}, ${option.City}`;
  };

  return (
    <Autocomplete
      freeSolo
      clearOnBlur
      value={value}
      inputValue={searchTerm}
      onInputChange={handleInputChange}
      onChange={handleChange}
      fullWidth
      options={options}
      loading={loading}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          autoComplete="off"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default CustomApiSearch;
