import React from 'react'
import { supabaseOrg } from 'src/configs/supabase'

// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { GridToolbarExport } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const ServerSideToolbar = props => {
  const { setShow, setSelectedRow } = props
  const [open, setOpen] = React.useState(false)
  const [itemsToDelete, setItemsToDelete] = React.useState([])

  const handleDelete = async () => {
    const { data, error } = await supabaseOrg.from('items').delete().in('id', props.selectedRow)

    if (error) {
      console.error('Error deleting rows:', error)
    } else {
      console.log('Rows deleted successfully:', data)
      props.fetchTableData(props.sort, props.searchValue, props.sortColumn)
      handleClose()
    }
  }

  const handleOpen = () => {
    const items = props.rows.filter(row => props.selectedRow.includes(row.id))
    console.log(items)
    setItemsToDelete(items)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  console.log(props.isCartChanged)

  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={() => {
            setSelectedRow(null)
            setShow(true)
          }}
        >
          Refresh
        </Button>
        <Button
          size='small'
          title='Delete'
          aria-label='Delete'
          variant='contained'
          onClick={handleOpen}
          style={{ display: props.selectedRow?.length > 0 ? 'inline-flex' : 'none' }}
        >
          <Icon icon='basil:save-outline' fontSize={20} />
          Delete
        </Button>
        <Button
          size='small'
          title='Delete'
          aria-label='Delete'
          variant='contained'
          disabled={!props.isCartChanged || props.isSaving}
          onClick={props.handleSaveCart}
          style={{ display: props.selectedRow?.length <= 0 ? 'inline-flex' : 'none' }}
        >
          <Icon icon='basil:save-outline' fontSize={20} />
          {props.isSaving ? 'Saving...' : 'Save Cart'}
        </Button>
      </Box>

      <TextField
        size='small'
        value={props.value}
        onChange={props.onChange}
        placeholder='Search…'
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon icon='mdi:magnify' fontSize={20} />
            </Box>
          ),
          endAdornment: (
            <IconButton size='small' title='Clear' aria-label='Clear' onClick={props.clearSearch}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete the following items?'}</DialogTitle>
        <DialogContent>
          <div id='alert-dialog-description'>
            <List>
              {itemsToDelete.map(item => (
                <ListItem key={item.id}>{item.name}</ListItem>
              ))}
            </List>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ServerSideToolbar
