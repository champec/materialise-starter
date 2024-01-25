import React from 'react'
import { Card, Dialog, DialogActions, MenuItem, MenuList, Typography } from '@mui/material'
import { setSelectedService } from 'src/store/apps/services'
import { fetchCalendarTypes } from 'src/store/apps/calendar'
import { useDispatch, useSelector } from 'react-redux'

function ServiceSelectorModal({ open, onClose, handleAddBookingSidebarToggle }) {
  // console.log('calendarTypes', calendarTypes)
  const dispatch = useDispatch()
  const calendarTypes = useSelector(state => state.bookingsCalendar.calendarTypes)

  console.log('calendarTypes', calendarTypes)

  React.useEffect(() => {
    dispatch(fetchCalendarTypes())
  }, [])

  const onMenuItemClick = item => {
    dispatch(setSelectedService(item))
    handleAddBookingSidebarToggle()
    onClose()
  }

  return (
    <Dialog hideBackdrop={true} open={open} onClose={onClose}>
      <Card sx={{ p: 2, minWidth: 300, minHeight: '50vh' }}>
        <Typography variant='h6' gutterBottom>
          Select a service
        </Typography>
        {calendarTypes &&
          calendarTypes.map(calendarType => (
            <MenuList sx={{ mb: 2 }}>
              <MenuItem onClick={() => onMenuItemClick(calendarType)}>{calendarType.title}</MenuItem>
            </MenuList>
          ))}
      </Card>
    </Dialog>
  )
}

export default ServiceSelectorModal
