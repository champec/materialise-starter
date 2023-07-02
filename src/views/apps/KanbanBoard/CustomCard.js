import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Typography } from '@mui/material'
import { IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import { styled } from '@mui/material/styles'

const CardContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2)
}))

const CustomCard = card => {
  const dispatch = useDispatch()
  const { title, description, id, assignees, done } = card

  const handleMarkDone = () => {
    // Dispatch action to mark task as done
  }

  const handleEdit = () => {
    // Dispatch action to start editing task
  }

  const handleDelete = () => {
    // Dispatch action to delete task
  }

  return (
    <CardContainer>
      <div>
        <Typography>{title}</Typography>
        <Typography variant='body2'>{description}</Typography>
      </div>
      <div>{/* Avatars of assignees */}</div>
      <div>
        <IconButton onClick={handleMarkDone}>
          <Icon icon='mdi:check-outline' fontSize={16} />
        </IconButton>
        <IconButton onClick={handleEdit}>
          <Icon icon='mdi:pencil-outline' fontSize={16} />
        </IconButton>
        <IconButton onClick={handleDelete}>
          <Icon icon='mdi:delete-outline' fontSize={16} />
        </IconButton>
      </div>
    </CardContainer>
  )
}

export default CustomCard
