import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List
} from '@mui/material'
import { Icon } from '@iconify/react'
import { styled } from '@mui/material/styles'
import { deleteTask, fetchBoardByOrg, updateTask, deleteRecurringTask } from 'src/store/apps/kanban'

const CardContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2)
}))

const Assignee = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(3),
  height: theme.spacing(3),
  marginRight: theme.spacing(0.5)
}))

const Label = styled(Box)(({ theme }) => ({
  width: theme.spacing(2),
  height: theme.spacing(2),
  marginRight: theme.spacing(0.5)
}))

const CustomCard = card => {
  const dispatch = useDispatch()
  const { title, description, id, assignees, complete, orgId, onSelect, labels } = card
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [markDoneDialogOpen, setMarkDoneDialogOpen] = useState(false)
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false)
  const [assigneesDialogOpen, setAssigneesDialogOpen] = useState(false)
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  const handleMarkDone = () => {
    setMarkDoneDialogOpen(false)
    // Dispatch action to mark task as done
    const updatedTask = { complete: !complete, id: card.id }
    dispatch(updateTask({ task: updatedTask, laneId: card.laneId }))
  }

  const handleEdit = () => {
    onSelect(card)
  }

  const handleRecurringIconClick = () => {
    setRecurringDialogOpen(true)
  }

  const handleRecurringDialogClose = () => {
    setRecurringDialogOpen(false)
  }

  const handleRemoveRecurring = () => {
    // Close the confirmation dialog
    setConfirmationDialogOpen(false)
    setRecurringDialogOpen(false)
    // Dispatch action to remove the reocurrence of the task
    dispatch(deleteRecurringTask({ taskId: card.recurring_id })).then(() => {
      dispatch(fetchBoardByOrg(orgId))
    })
  }

  const handleConfirmationOpen = () => {
    setConfirmationDialogOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(false)
    dispatch(deleteTask({ taskId: card.id, laneId: card.laneId }))
  }

  const handleDeleteConfirmation = () => {
    setDeleteDialogOpen(true)
  }

  const handleMarkDoneConfirmation = () => {
    setMarkDoneDialogOpen(true)
  }

  const handleClose = () => {
    setDeleteDialogOpen(false)
    setMarkDoneDialogOpen(false)
  }

  const handleLabelClick = () => {
    setLabelsDialogOpen(true)
  }

  const handleAssigneeClick = () => {
    setAssigneesDialogOpen(true)
  }

  return (
    <CardContainer>
      <div>
        <Box display='flex' mt={0} mb={0} alignItems='center'>
          {labels &&
            labels.map(label => (
              <Tooltip key={label.id} title={label.title}>
                <IconButton sx={{ marginRight: -3 }} onClick={handleLabelClick}>
                  <Label style={{ backgroundColor: label.color }} />
                </IconButton>
              </Tooltip>
            ))}
          {card.recurring_days && card.recurring_time && (
            <Tooltip title='This is a recurring task'>
              <IconButton onClick={handleRecurringIconClick} size='small' style={{ marginLeft: 'auto' }}>
                <Icon icon='mdi:repeat' color='blue' fontSize={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography>{title}</Typography>
        <Typography variant='body2'>{description}</Typography>
      </div>
      <div>
        <IconButton onClick={handleMarkDoneConfirmation}>
          <Icon icon='mdi:check-outline' fontSize={16} />
        </IconButton>
        <IconButton onClick={handleEdit}>
          <Icon icon='mdi:pencil-outline' fontSize={16} />
        </IconButton>
        <IconButton onClick={handleDeleteConfirmation}>
          <Icon icon='mdi:delete-outline' fontSize={16} />
        </IconButton>
        <Box display='flex' mt={1} justifyContent='flex-end'>
          {assignees &&
            assignees.map(assignee => (
              <Tooltip key={assignee.id} title={assignee.username}>
                <Assignee onClick={handleAssigneeClick}>{assignee.username[0]}</Assignee>
              </Tooltip>
            ))}
        </Box>
      </div>
      <Dialog open={deleteDialogOpen} onClose={handleClose}>
        <DialogTitle>{'Confirm Deletion'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This operation cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color='primary' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={markDoneDialogOpen} onClose={handleClose}>
        <DialogTitle>{'Confirm Completion'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to mark this task as completed?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleMarkDone} color='primary' autoFocus>
            Complete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={labelsDialogOpen} onClose={() => setLabelsDialogOpen(false)}>
        <DialogTitle>{'Labels'}</DialogTitle>
        <DialogContent>
          <List>
            {labels &&
              labels.map(label => (
                <ListItem key={label.id}>
                  <ListItemAvatar>
                    <Box style={{ backgroundColor: label.color, width: 36, height: 36 }} />
                  </ListItemAvatar>
                  <ListItemText primary={label.title} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
      </Dialog>
      <Dialog open={assigneesDialogOpen} onClose={() => setAssigneesDialogOpen(false)}>
        <DialogTitle>{'Assignees'}</DialogTitle>
        <DialogContent>
          <List>
            {assignees &&
              assignees.map(assignee => (
                <ListItem key={assignee.id}>
                  <ListItemAvatar>
                    <Avatar>{assignee.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={assignee.username} secondary={assignee.email} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
      </Dialog>
      <Dialog open={recurringDialogOpen} onClose={handleRecurringDialogClose}>
        <DialogTitle>{'Recurring Details'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Recurring Days: {card.recurring_days}</DialogContentText>
          <DialogContentText>Recurring Time: {card.recurring_time}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecurringDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmationOpen} color='primary' autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmationDialogOpen} onClose={handleConfirmationClose}>
        <DialogTitle>{'Confirm Removal'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the reocurrence of this task? All instances of this task, including future
            ones, will be non-recurring and the action cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button onClick={handleRemoveRecurring} color='primary' autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </CardContainer>
  )
}

export default CustomCard
