import { useState } from 'react'
// ** Next Import
import Link from 'next/link'
import FallbackSpinner from 'src/@core/components/spinner'
// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { IconButton, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CircularProgress from '@mui/material/CircularProgress'
import BookCalendarSidebar from '../../Calendar/BookCalendarSidebar'

//custom components
import ServiceSelectorModal from '../../services/ServiceSelectorModal'

const ConsultationHeader = props => {
  // ** Props
  const { value, selectedRows, handleFilter, onBook, handleBatchAction, reFetching, reFetchAppointments } = props
  const [openServiceSelectorModal, setOpenServiceSelectorModal] = useState(false)
  const [openBookCalendarSidebar, setOpenBookCalendarSidebar] = useState(false)

  const handleAddBookingSidebarToggle = () => {
    setOpenBookCalendarSidebar(!openBookCalendarSidebar)
  }

  console.log({ reFetching })
  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Select
        size='small'
        displayEmpty
        sx={{ mr: 4, mb: 2 }}
        disabled={selectedRows && selectedRows.length === 0}
        defaultValue='Actions'
        value={'Actions'}
        onChange={e => handleBatchAction(e.target.value)}
      >
        <MenuItem disabled value='Actions'>
          Actions
        </MenuItem>
        <MenuItem value='Cancel'>Cancel</MenuItem>
        <MenuItem value='Message'>Message</MenuItem>
        <MenuItem value='MYS'>MYS Submit</MenuItem>
        <MenuItem value='GP'>GP Submit</MenuItem>
      </Select>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <IconButton size='small' sx={{ mr: 4, mb: 2 }} onClick={reFetchAppointments}>
          <Tooltip title='Refresh'>{reFetching ? <CircularProgress /> : <Icon icon='zondicons:refresh' />}</Tooltip>
        </IconButton>
        <TextField
          size='small'
          value={value}
          placeholder='Search Consultations'
          sx={{ mr: 4, mb: 2, maxWidth: '180px' }}
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => setOpenServiceSelectorModal(true)}>
          New Consultation
        </Button>
      </Box>
      <ServiceSelectorModal
        open={openServiceSelectorModal}
        onClose={() => setOpenServiceSelectorModal(false)}
        handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
      />
      <BookCalendarSidebar
        addBookingSidebarOpen={openBookCalendarSidebar}
        handleAddBookingSidebarToggle={handleAddBookingSidebarToggle}
      />
    </Box>
  )
}

export default ConsultationHeader
