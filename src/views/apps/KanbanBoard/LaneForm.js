import React, { useEffect, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { IconButton, Drawer, Box, TextField, Typography, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import { addLane, updateLane, deleteLane, fetchBoardByOrg } from 'src/store/apps/kanban' // adjust this to match your actual action imports

function LaneForm({ boardId, open, toggle, selectedLane, numberOfLanes, orgId }) {
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    if (selectedLane) {
      setValue('title', selectedLane.title)
      setValue('position', selectedLane.position)
    } else {
      reset()
    }
  }, [selectedLane, setValue, reset])

  const onSubmit = async data => {
    if (selectedLane) {
      const updatedLane = { id: selectedLane.id, ...data }
      await dispatch(updateLane({ lane: updatedLane, boardId }))
    } else {
      const newLane = { ...data, position: numberOfLanes + 1, board_id: boardId }
      await dispatch(addLane({ lane: newLane, boardId }))
    }

    dispatch(fetchBoardByOrg(orgId))
    reset()
    toggle()
  }

  const onDelete = () => {
    if (selectedLane) {
      dispatch(deleteLane({ laneId: selectedLane.id, boardId })).then(() => {
        dispatch(fetchBoardByOrg(orgId))
      })
    }
    toggle()
  }

  const formTitle = selectedLane ? 'Edit Lane' : 'New Lane'

  return (
    <Drawer
      open={open}
      anchor='left'
      onClose={toggle}
      variant='temporary'
      sx={{ '& .MuiDrawer-paper': { width: [300, 400] } }}
    >
      <Box sx={{ p: 5 }}>
        <Grid container direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{formTitle}</Typography>

          <Box>
            {selectedLane && (
              <IconButton size='small' onClick={onDelete} sx={{ color: 'text.primary', mr: 2 }}>
                <Icon icon='mdi:delete' fontSize={20} />
              </IconButton>
            )}
            <IconButton size='small' onClick={toggle} sx={{ color: 'text.primary' }}>
              <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
          </Box>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('title', { required: 'Title is required' })}
            label='Title'
            margin='normal'
            variant='outlined'
            fullWidth
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
          />
          {selectedLane && (
            <TextField
              {...register('position', {
                required: 'Position is required',
                min: { value: 1, message: 'Position must be at least 1' },
                max: {
                  value: numberOfLanes,
                  message: `Position must be no more than ${numberOfLanes} as you only have ${numberOfLanes} lanes`
                }
              })}
              label='Position'
              margin='normal'
              variant='outlined'
              fullWidth
              error={Boolean(errors.position)}
              helperText={errors.position?.message}
              type='number'
            />
          )}

          <Button type='submit' variant='contained' color='primary' fullWidth sx={{ marginTop: 2 }}>
            {selectedLane ? 'Update Lane' : 'Add Lane'}
          </Button>
        </form>
      </Box>
    </Drawer>
  )
}

export default LaneForm
