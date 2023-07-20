import React, { useEffect, useState, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import {
  IconButton,
  Drawer,
  Box,
  TextField,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Grid
} from '@mui/material'
import { Icon } from '@iconify/react'
import 'react-datepicker/dist/react-datepicker.css'
import { addTask, updateTask, addRecurringTask, deleteRecurringTask, updateRecurringTask } from 'src/store/apps/kanban' // adjust this to match your actual action imports
import UserSelect from './UserSelect'
import LabelSelect from './LabelSelect'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField inputRef={ref} label='Date' {...props} />
})

function CardForm({ selectedLane, open, toggle, selectedCard, orgId, users, labels, refetch }) {
  const dispatch = useDispatch()
  const [selectedDays, setSelectedDays] = useState([false, false, false, false, false, false, false])
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedLabels, setSelectedLabels] = useState([])
  const [showRecurring, setShowRecurring] = useState(false)
  const [applyToAllInstances, setApplyToAllInstances] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    // Inside the useEffect hook
    console.log({ selectedCard })
    if (selectedCard) {
      setValue('title', selectedCard.title)
      setValue('description', selectedCard.description)
      setValue('due_date', new Date(selectedCard.dueDate))
      setValue('labels', selectedCard.labels || [])
      setValue('users', selectedCard.assignees ? selectedCard.assignees.map(user => user.id) : []) // reset selected labels when editing an existing card

      if (selectedCard.recurring_days && selectedCard.recurring_time) {
        const recurringDaysArray = selectedCard.recurring_days.split(', ')
        const selectedDays = daysOfWeek.map(day => recurringDaysArray.includes(day))
        setSelectedDays(selectedDays)
        setSelectedTime(new Date(selectedCard.recurring_time))
        setShowRecurring(true)
      } else {
        setSelectedDays([false, false, false, false, false, false, false])
        setSelectedTime(new Date())
        setShowRecurring(false)
      }
    } else {
      reset()
      setSelectedDays([false, false, false, false, false, false, false])
      setSelectedTime(new Date())
      setSelectedUsers([])
      setSelectedLabels([]) // reset selected labels when adding a new card
      setShowRecurring(false)
    }
  }, [selectedCard, setValue, reset])

  useEffect(() => {
    register('labels')
    register('users')
  }, [register])

  const onSubmit = async data => {
    let taskRecurringDays = selectedDays
      .map((isSelected, index) => (isSelected ? daysOfWeek[index] : null))
      .filter(item => item !== null)
      .join(', ')
    let taskRecurringTime = showRecurring ? selectedTime : null

    const taskData = {
      recurring_days: taskRecurringDays,
      recurring_time: taskRecurringTime
    }

    if (selectedCard) {
      const updatedTask = {
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        complete: data.complete,
        id: selectedCard.id,
        ...taskData
      }

      // Dispatch different actions depending on whether the task is recurring ** tasks will always be updated or created as usual, thi
      //conditional logic is only determining if to update the base task in the recurring table or not
      if (showRecurring) {
        // above says if we are looking at a recurring task and the selectedCard is recurring, update the base recurring able only if the user wants to update all future tasks else
        // just leave as is, and will only update the current task by default
        if (selectedCard.recurring_days && selectedCard.recurring_time) {
          if (applyToAllInstances) {
            // The task was already recurring, and the user wants to apply changes to all instances
            dispatch(
              updateRecurringTask({
                task: updatedTask,
                laneId: selectedLane,
                labels: data.labels,
                users: data.users,
                orgId
              })
            )
          }
        } else {
          // The task has become recurring, create a new recurring task
          const { payload: recurringTaskId } = await dispatch(
            addRecurringTask({
              task: updatedTask,
              laneId: selectedLane,
              labels: data.labels,
              users: data.users,
              orgId
            })
          )
          updatedTask.recurring_task_id = recurringTaskId
        }
      } else {
        // this else statement is in contrast to showing above, if the recurring swith is off and the selected card is recurring, then delete the recurring task
        if (
          selectedCard.recurring_days &&
          selectedCard.recurring_time
          // && applyToAllInstances removing this condition becuase it redundant, also impossible to click as its nested in the recurring switch
        ) {
          // The task was recurring but is not anymore, delete the recurring task
          dispatch(deleteRecurringTask({ taskId: selectedCard.id, orgId }))
        }
      }

      dispatch(updateTask({ task: updatedTask, laneId: selectedLane, labels: data.labels, users: data.users, orgId }))
      reset()
      toggle()
    } else {
      const newTask = {
        id: uuidv4(),
        ...taskData,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        lane_id: selectedLane
      }

      // Dispatch different actions depending on whether the task is recurring
      if (showRecurring) {
        const { payload: recurringTaskId } = await dispatch(
          addRecurringTask({ task: newTask, orgId, labels: data.labels, users: data.users })
        )
        newTask.recurring_task_id = recurringTaskId
      }

      dispatch(addTask({ task: newTask, orgId, labels: data.labels, users: data.users }))
    }
    reset()
    toggle()
  }

  const formTitle = selectedCard ? 'Edit Task' : 'New Task'

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={toggle}
      variant='temporary'
      sx={{ '& .MuiDrawer-paper': { width: [300, 400] } }}
    >
      <Box sx={{ p: 5 }}>
        <Grid container direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{formTitle}</Typography>

          <IconButton size='small' onClick={toggle} sx={{ color: 'text.primary' }}>
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
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

          <TextField
            {...register('description')}
            label='Description'
            margin='normal'
            variant='outlined'
            fullWidth
            multiline
            rows={4}
          />

          <Typography variant='body1'>Due Date</Typography>
          <Controller
            name='due_date'
            control={control}
            defaultValue={new Date()}
            render={({ field }) => (
              <DatePickerWrapper sx={{ '& .MuiFormControl-root': { width: '100%', marginTop: 2, marginBottom: 2 } }}>
                <DatePicker
                  selected={field.value}
                  onChange={date => field.onChange(date)}
                  customInput={<CustomInput />}
                />
              </DatePickerWrapper>
            )}
          />
          <Box sx={{ mb: 4 }}>
            <Controller
              name='users'
              control={control}
              defaultValue={[]}
              render={({ field }) => <UserSelect selectedUsers={field.value} setSelectedUsers={field.onChange} />}
            />
          </Box>
          <Box>
            <Controller
              name='labels'
              control={control}
              defaultValue={[]}
              render={({ field }) => <LabelSelect selectedLabels={field.value} setSelectedLabels={field.onChange} />}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showRecurring}
                onChange={() => setShowRecurring(!showRecurring)}
                name='checkedRecurring'
                color='primary'
              />
            }
            label='Recurring'
          />

          {showRecurring && (
            <>
              {selectedCard && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyToAllInstances}
                      onChange={event => setApplyToAllInstances(event.target.checked)}
                      name='applyToAllInstances'
                      color='primary'
                    />
                  }
                  label='Apply changes to all instances'
                />
              )}
              <Typography variant='body1'>Days of Recurrence</Typography>
              <FormGroup row>
                {daysOfWeek.map((day, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selectedDays[index]}
                        onChange={() => {
                          let newSelectedDays = [...selectedDays]
                          newSelectedDays[index] = !newSelectedDays[index]
                          setSelectedDays(newSelectedDays)
                        }}
                        name={day}
                        color='primary'
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>

              <Typography variant='body1'>Time of Recurrence</Typography>
              <Controller
                name='taskRecurringTime'
                control={control}
                defaultValue={new Date()}
                render={({ field }) => (
                  <DatePickerWrapper
                    sx={{ '& .MuiFormControl-root': { width: '100%', marginTop: 2, marginBottom: 2 } }}
                  >
                    <DatePicker
                      selected={field.value}
                      onChange={date => {
                        field.onChange(date)
                        setSelectedTime(date)
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption='Time'
                      dateFormat='h:mm aa'
                      customInput={<CustomInput />}
                    />
                  </DatePickerWrapper>
                )}
              />
            </>
          )}

          <Button type='submit' variant='contained' color='primary' fullWidth sx={{ marginTop: 2 }}>
            {selectedCard ? 'Update Task' : 'Add Task'}
          </Button>
        </form>
      </Box>
    </Drawer>
  )
}

export default CardForm
