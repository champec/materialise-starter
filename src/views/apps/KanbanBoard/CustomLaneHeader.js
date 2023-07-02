import React from 'react'
import { IconButton, Typography, Menu, MenuItem } from '@mui/material'
import { useDispatch } from 'react-redux'
import { deleteLane, fetchBoardByOrg } from 'src/store/apps/kanban'
import { Icon } from '@iconify/react'

function CustomLaneHeader({ title, id, position, taskCount, onEdit, onDelete, boardId, setSelectedLane, orgId }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const dispatch = useDispatch()

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onEdit(id, title, position)
    handleClose()
  }

  const handleDelete = () => {
    dispatch(deleteLane({ laneId: id, boardId })).then(() => {
      dispatch(fetchBoardByOrg(orgId))
    })
    setSelectedLane(null)
    handleClose()
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant='h6'>{title}</Typography>
        <Typography variant='subtitle1' style={{ marginLeft: '8px' }}>
          {taskCount}
        </Typography>
      </div>
      <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={handleClick}>
        <Icon icon='eva:more-vertical-fill' />
      </IconButton>
      <Menu id='long-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  )
}

export default CustomLaneHeader
