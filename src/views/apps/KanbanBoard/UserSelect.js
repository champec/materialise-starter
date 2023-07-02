import { useState } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import ListItemText from '@mui/material/ListItemText'
import Select from '@mui/material/Select'
import { useSelector } from 'react-redux'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

const getInitials = name => {
  let initials = name.match(/\b\w/g) || []

  return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()
}

const UserSelect = props => {
  const { selectedUsers, setSelectedUsers } = props

  const users = useSelector(state => state.kanban.users)

  const handleChange = event => {
    setSelectedUsers(event.target.value)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', '& > *': { mt: 4, maxWidth: 500 } }}>
      <div>
        <Typography sx={{ mb: 2, fontWeight: 500 }}>Assign Users</Typography>
        <FormControl fullWidth>
          <InputLabel id='demo-multiple-checkbox-label'>Users</InputLabel>
          <Select
            multiple
            label='Users'
            value={selectedUsers}
            MenuProps={MenuProps}
            onChange={handleChange}
            id='demo-multiple-checkbox'
            renderValue={selected =>
              selected
                .map(value => {
                  const user = users.find(user => user.id === value)

                  return user ? user.username : null
                })
                .join(', ')
            }
          >
            {users &&
              users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  <Checkbox checked={selectedUsers.indexOf(user.id) > -1} />
                  <Avatar sx={{ mx: 1, width: 24, height: 24 }} src={user.avatar_url || ''}>
                    {!user.avatar_url && getInitials(user.username)}
                  </Avatar>
                  <ListItemText primary={user.username} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
    </Box>
  )
}

export default UserSelect
