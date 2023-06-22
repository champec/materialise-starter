// ** MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { useState } from 'react'

const SidebarLeft = props => {
  const {
    store,
    mdAbove,
    dispatch,
    calendarsColor,
    leftSidebarOpen,
    leftSidebarWidth,
    handleSelectEvent,
    handleAllCalendars,
    handleSelectCalendar,
    handleCalendarsUpdate,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    handleAddCalendarSidebarToggle
  } = props
  const colorsArr = calendarsColor ? Object.entries(calendarsColor) : []

  const [isEditing, setIsEditing] = useState(false)

  const handleAddCalendarSidebarToggleSidebar = () => {
    handleAddCalendarSidebarToggle()
    setIsEditing(!isEditing)
    dispatch(handleSelectEvent(null))
  }

  const renderFilters = store.calendarTypes ? (
    <>
      <FormControlLabel
        label='View All'
        sx={{ mr: 0, mb: 0.5 }}
        control={
          <Checkbox
            color='secondary'
            checked={store.selectedCalendars.length === store.calendarTypes.length}
            onChange={e => dispatch(handleAllCalendars(e.target.checked))}
          />
        }
      />
      {store.calendarTypes.map(calendarType => (
        <FormControlLabel
          key={calendarType.id}
          label={calendarType.title}
          sx={{ mb: 0.5 }}
          control={
            isEditing ? (
              <IconButton onClick={() => handleEditCalendarItem(calendarType)}>
                <Icon icon='bx:edit' color='grey' fontSize={18} />
              </IconButton>
            ) : (
              <Checkbox
                color={calendarType.color}
                checked={store.selectedCalendars.includes(calendarType.id)}
                onChange={() => dispatch(handleCalendarsUpdate(calendarType.id))}
              />
            )
          }
        />
      ))}
      {isEditing && (
        <Box>
          <Button onClick={handleAddCalendarSidebarToggleSidebar}>Add New</Button>
        </Box>
      )}
    </>
  ) : null

  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
    dispatch(handleSelectEvent(null))
  }

  const handleEditCalendarItem = calendarType => {
    dispatch(handleSelectCalendar(calendarType))
    handleAddCalendarSidebarToggleSidebar()
  }

  const handleEventTypeEdit = () => {
    setIsEditing(!isEditing)
  }

  if (renderFilters) {
    return (
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          disableAutoFocus: true,
          disableScrollLock: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 2,
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            borderRadius: 1,
            boxShadow: 'none',
            width: leftSidebarWidth,
            borderTopRightRadius: 0,
            alignItems: 'flex-start',
            borderBottomRightRadius: 0,
            p: theme => theme.spacing(5),
            zIndex: mdAbove ? 2 : 'drawer',
            position: mdAbove ? 'static' : 'absolute'
          },
          '& .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute'
          }
        }}
      >
        <Button fullWidth variant='contained' onClick={handleSidebarToggleSidebar}>
          Add Event
        </Button>

        <Box sx={{ mt: 7, mb: 2.5, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography variant='body2' sx={{ textTransform: 'uppercase' }}>
            Calendars
          </Typography>
          <IconButton onClick={handleEventTypeEdit}>
            <Icon icon='bx:edit' color='grey' fontSize={18} />
          </IconButton>
        </Box>

        {renderFilters}
      </Drawer>
    )
  } else {
    return null
  }
}

export default SidebarLeft
