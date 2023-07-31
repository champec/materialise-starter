import React, { useState, useEffect } from 'react'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import { supabaseOrg } from 'src/configs/supabase'

function AddMemberDialog({ open, onClose, orgId, teamMembers }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const fetchUsers = async () => {
    const { data, error } = await supabaseOrg.from('profiles').select('*').eq('type', 'user')

    if (error) console.error('error', error)
    else setAllUsers(data)
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const handleCheckboxChange = (event, id) => {
    setSelectedUsers(prev => (event.target.checked ? [...prev, id] : prev.filter(userId => userId !== id)))
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleAddMembers = async () => {
    for (let id of selectedUsers) {
      const { error } = await supabaseOrg
        .from('users_organisation')
        .insert([{ user: id, organisation: orgId, status: 'pending' }])

      if (error) console.error('error', error)
    }
    onClose()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = allUsers.filter(user =>
    (user.full_name + ' ' + user.username).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Add Members</DialogTitle>
      <TextField
        variant='outlined'
        label='Search'
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ margin: '16px' }}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name (Username)</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align='right'>Add</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.full_name} ({user.username})
                </TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell align='right'>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={event => handleCheckboxChange(event, user.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination count={Math.ceil(filteredUsers.length / rowsPerPage)} page={page} onChange={handlePageChange} />
      <Button onClick={handleAddMembers} variant='contained' color='primary' style={{ margin: '16px' }}>
        Add Selected Members
      </Button>
    </Dialog>
  )
}

export default AddMemberDialog
