// ** React Imports
import { useState, forwardRef } from 'react'
import { supabaseOrg } from 'src/configs/supabase'
import PickersBasic from 'src/@core/components/store/PickerBasic'
import drugForms from 'src/@core/components/store/DrugForms'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import Fade from '@mui/material/Fade'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const defaultProduct = {
  name: '',
  brand: '',
  description: '',
  price: 0,
  status: 1,
  quantity: 0,
  strength: '',
  pack: '',
  trade_reason: [],
  form: '',
  image: '',
  batch_number: '',
  expiry_date: new Date()
}

const statusObj = {
  1: { title: 'Active', color: 'primary' },
  2: { title: 'Inactive', color: 'success' },
  3: { title: 'Out of Stock', color: 'error' },
  4: { title: 'Damaged', color: 'warning' },
  5: { title: 'Expired', color: 'info' }
}

const EditProductForm = ({ show, setShow, row, fetchTableData, sort, searchValue, sortColumn }) => {
  // ** States
  const [languages, setLanguages] = useState([])
  const [product, setProduct] = useState(row ? row : defaultProduct)
  const supabase = supabaseOrg

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const handleChange = event => {
    const {
      target: { value }
    } = event
    setLanguages(typeof value === 'string' ? value.split(',') : value)
  }

  const handleInputChange = event => {
    let { name, value } = event.target

    // If the input change is from the "status" select input, convert the value to a number
    if (name === 'status') {
      value = Number(value)
    }
    setProduct({
      ...product,
      [event.target.name]: event.target.value
    })
  }

  function DividerWithText({ children }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 3 }}>
        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
        <Box px={2}>{children}</Box>
        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>
    )
  }

  const handleSubmit = async event => {
    event.preventDefault()
    console.log(product)
    try {
      // Perform an upsert operation
      const { data, error } = await supabase
        .from('items')
        .upsert({ ...product, date: new Date().toISOString() }, { onConflict: ['id'] }) // using the 'id' column as the conflict resolver

      if (error) {
        console.error('Failed to update or create:', error)
      } else {
        console.log('Operation successful:', data)
        fetchTableData(sort, searchValue, sortColumn)
        setShow(false)
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
    }
  }

  return (
    <Card>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
      >
        <DialogContent sx={{ pb: 6, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
          <IconButton
            size='small'
            onClick={() => setShow(false)}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
              {row ? `Edit ${row.name}` : 'Add Item'}
            </Typography>
            <Typography variant='body2'>Updating product details will receive a privacy audit.</Typography>
          </Box>
          <Grid container spacing={6}>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                value={product.name || ''}
                label='Product Name'
                placeholder='Product Name'
                name='name'
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label='Brand'
                placeholder='Teva'
                value={product.brand || ''}
                name='brand'
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                placeholder='Press enter to go to a new line'
                value={product.description || ''}
                name='description'
                onChange={handleInputChange}
                multiline
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label='Price'
                placeholder='£23'
                value={`${product.price || ''}`}
                type='number'
                name='price'
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id='status-select'>Status</InputLabel>
                <Select
                  value={product.status}
                  fullWidth
                  labelId='status-select'
                  label='Status'
                  name='status'
                  onChange={handleInputChange}
                >
                  {Object.keys(statusObj).map(key => (
                    <MenuItem key={key} value={key}>
                      {statusObj[key].title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label='Quantity'
                placeholder='10'
                value={product.quantity}
                name='quantity'
                onChange={handleInputChange}
                type='number'
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label='Strength'
                placeholder='dont forget units mg, ml etc'
                name='strength'
                onChange={handleInputChange}
                value={product.strength || ''}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id='pack-select'>Pack</InputLabel>
                <Select
                  fullWidth
                  label='Pack type'
                  onChange={handleInputChange}
                  name='pack'
                  labelId='pack-select'
                  value={product.pack}
                  placeholder='Pack type'
                >
                  <MenuItem value='Full'>Full</MenuItem>
                  <MenuItem value='Split'>Split</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id='trade-reason'>Trade Reason</InputLabel>
                <Select
                  multiple
                  fullWidth
                  label='Trade Reason'
                  name='trade_reason'
                  onChange={handleInputChange}
                  value={product.trade_reason || []}
                  labelId='trade-reason'
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value='Stock Clearance'>Stock Clearance</MenuItem>
                  <MenuItem value='Short-Dated'>Short Dated</MenuItem>
                  <MenuItem value='Error'>Ordered in error</MenuItem>
                  <MenuItem value='Not required'>Not required</MenuItem>
                  <MenuItem value='Other'>Other see desription</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id='Drug Form'>Form</InputLabel>
                <Select
                  fullWidth
                  label='Drug Form'
                  placeholder='Drug Form'
                  labelId='Drug Form'
                  value={product.form || ''}
                  onChange={handleInputChange}
                  name='form'
                >
                  <MenuItem value=''>Select Form</MenuItem>
                  {drugForms.map(form => (
                    <MenuItem key={form} value={form}>
                      {form}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id='country-select'>Image</InputLabel>
              </FormControl>
            </Grid>
            <DividerWithText>Optional</DividerWithText>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  value={product.batch_number || ''}
                  label='Batch Number'
                  placeholder='Batch Number'
                  name='batch_number'
                  onChange={handleInputChange}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <DatePickerWrapper>
                  <PickersBasic
                    popperPlacement={popperPlacement}
                    label='Expiry Date'
                    name='expiry_date'
                    onChange={handleInputChange}
                    date={product.expiry_date || new Date()}
                  />
                </DatePickerWrapper>
              </FormControl>
            </Grid>
            {!row && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label='Add another Product'
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: 'text.secondary'
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
          <Button variant='contained' sx={{ mr: 2 }} onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => setShow(false)}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default EditProductForm
