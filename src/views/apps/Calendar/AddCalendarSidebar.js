import React, { useState, useEffect, forwardRef, useCallback } from 'react'
import { useUserAuth } from 'src/hooks/useAuth'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useForm, Controller } from 'react-hook-form'

import {
  Box,
  Drawer,
  Button,
  TextField,
  IconButton,
  Typography,
  FormHelperText,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { useTheme } from '@mui/system'

const defaultState = {
  title: '',
  color: '',
  description: ''
}

const colors = [
  { muiName: 'secondary', displayName: 'Grey' },
  { muiName: 'primary', displayName: 'Purple' },
  { muiName: 'error', displayName: 'Red' },
  { muiName: 'warning', displayName: 'Yellow' },
  { muiName: 'info', displayName: 'Light Blue' },
  { muiName: 'success', displayName: 'Green' }
]

const ColorOption = ({ color }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ width: 24, height: 24, backgroundColor: theme.palette[color.muiName].main, mr: 1 }} />
      <Typography variant='body1'>{color.displayName}</Typography>
    </Box>
  )
}

const AddCalendarSidebar = ({
  addCalendarSidebarOpen,
  handleAddCalendarSidebarToggle,
  drawerWidth,
  addCalendarType,
  updateCalendarType,
  deleteCalendarType,
  handleSelectCalendar,
  store,
  dispatch
}) => {
  const [values, setValues] = useState(defaultState)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const orgId = useOrgAuth()?.organisation?.id
  const userId = useUserAuth()?.user?.id

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectCalendar(null))
    handleAddCalendarSidebarToggle()
  }

  const onSubmit = data => {
    const modifiedCalendar = {
      title: data.title,
      color: data.color,
      description: values.description,
      created_by: userId,
      company_id: orgId
    }
    if (store.selectedCalendar === null) {
      dispatch(addCalendarType(modifiedCalendar))
    } else {
      dispatch(updateCalendarType({ id: store.selectedCalendar.id, ...modifiedCalendar }))
    }
    handleSidebarClose()
    reset({ title: '', color: colors[0].muiName, description: '' })
  }

  const handleDelete = () => {
    // open the confirmation dialog when delete button is clicked
    setConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    // when user confirms the delete action
    if (store.selectedCalendar) {
      dispatch(deleteCalendarType(store.selectedCalendar.id))
    }
    handleSidebarClose()
    // close the confirmation dialog
    setConfirmOpen(false)
  }

  const handleCancelDelete = () => {
    // when user cancels the delete action
    setConfirmOpen(false)
  }

  useEffect(() => {
    if (store.selectedCalendar !== null) {
      const calendarType = store.selectedCalendar
      setValue('title', calendarType.title || '')
      setValue('color', calendarType.color || colors[0].muiName)
      setValues({
        title: calendarType.title || '',
        color: calendarType.color || '',
        description: calendarType.description || ''
      })
    } else {
      setValue('title', '')
      setValues(defaultState)
    }
  }, [addCalendarSidebarOpen, setValue, store.selectedCalendar])

  return (
    <>
      {/* Confirmation dialog for deleting calendar type */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>{'Delete Calendar Type'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this calendar type? All events associated with this calendar will be
            deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color='primary' autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor='right'
        open={addCalendarSidebarOpen}
        onClose={handleSidebarClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'background.default',
            p: theme => theme.spacing(3, 3.255, 3, 5.255)
          }}
        >
          <Typography variant='h6'>
            {store.selectedCalendar !== null ? 'Update Calendar Type' : 'Add Calendar Type'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {store.selectedCalendar !== null && (
              <IconButton size='small' onClick={handleDelete} sx={{ color: 'text.primary', mr: 1 }}>
                <Icon icon='mdi:delete-outline' fontSize={20} />
              </IconButton>
            )}
            <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ p: theme => theme.spacing(5, 6) }}>
          <DatePickerWrapper>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label='Title' error={Boolean(errors.title)} fullWidth sx={{ mb: 3 }} />
                )}
              />
              {errors.title && <FormHelperText error>This field is required</FormHelperText>}
              <Controller
                name='color'
                control={control}
                defaultValue={values?.color || colors[0].muiName} // Default color
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id='color-label'>Color</InputLabel>
                    <Select label='Color' value={field.value} labelId='color-label' onChange={field.onChange}>
                      {colors.map(color => (
                        <MenuItem key={color.muiName} value={color.muiName}>
                          <ColorOption color={color} />
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.color && <FormHelperText error>This field is required</FormHelperText>}
                  </FormControl>
                )}
              />

              <TextField
                rows={4}
                multiline
                label='Description'
                value={values.description}
                onChange={e => setValues({ ...values, description: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
                {store.selectedCalendar !== null ? 'Update' : 'Add'}
              </Button>
            </form>
          </DatePickerWrapper>
        </Box>
      </Drawer>
    </>
  )
}

export default AddCalendarSidebar
