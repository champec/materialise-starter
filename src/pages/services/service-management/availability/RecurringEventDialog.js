import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Typography,
  Grid
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { RRule } from 'rrule'
import dayjs from 'dayjs' // Import dayjs

const RecurringEventDialog = ({ open, onClose, onSave, services, eventData }) => {
  const [localEventData, setLocalEventData] = useState({
    id: null,
    serviceId: '',
    start: null,
    end: null,
    isRecurring: false,
    frequency: RRule.WEEKLY,
    interval: 1,
    byweekday: [],
    until: null
  })

  useEffect(() => {
    if (eventData) {
      // Initialize local state with incoming event data
      let updatedEventData = {
        id: eventData.id || null,
        serviceId: eventData.serviceId || '',
        start: eventData.start ? dayjs(eventData.start) : null, // Ensure dayjs object
        end: eventData.end ? dayjs(eventData.end) : null, // Ensure dayjs object
        isRecurring: !!eventData.recurrenceRule,
        frequency: RRule.WEEKLY, // Default value
        interval: 1,
        byweekday: [],
        until: eventData.until ? dayjs(eventData.until) : null // Ensure dayjs object
      }

      // Parse the recurrence rule if it exists
      if (eventData.recurrenceRule) {
        try {
          const ruleOptions = RRule.fromString(eventData.recurrenceRule).options

          updatedEventData.frequency = ruleOptions.freq || RRule.WEEKLY
          updatedEventData.interval = ruleOptions.interval || 1
          updatedEventData.byweekday = ruleOptions.byweekday || []
          updatedEventData.until = ruleOptions.until ? dayjs(ruleOptions.until) : null
        } catch (error) {
          console.error('Failed to parse RRule:', error)
        }
      }

      setLocalEventData(updatedEventData)
    }
  }, [eventData])

  const handleChange = (field, value) => {
    setLocalEventData({ ...localEventData, [field]: value })
  }

  const handleWeekdayChange = day => {
    const newByweekday = localEventData.byweekday.includes(day)
      ? localEventData.byweekday.filter(d => d !== day)
      : [...localEventData.byweekday, day]
    setLocalEventData({ ...localEventData, byweekday: newByweekday })
  }

  const handleSave = () => {
    let saveData = { ...localEventData }
    if (localEventData.isRecurring) {
      const rrule = new RRule({
        freq: localEventData.frequency,
        interval: localEventData.interval,
        byweekday: localEventData.byweekday,
        dtstart: localEventData.start.toDate(), // Convert dayjs to native Date
        until: localEventData.until ? localEventData.until.toDate() : null // Convert dayjs to native Date
      })
      saveData.rrule = rrule.toString()
    }

    onSave(saveData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{localEventData.id ? 'Edit Availability' : 'Create Availability'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <InputLabel>Service</InputLabel>
              <Select
                value={localEventData.serviceId}
                onChange={e => handleChange('serviceId', e.target.value)}
                label='Service'
              >
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <DateTimePicker
              label='Start Time'
              value={localEventData.start}
              onChange={date => handleChange('start', dayjs(date))} // Convert to dayjs
              renderInput={params => <TextField {...params} fullWidth margin='normal' />}
            />
          </Grid>
          <Grid item xs={6}>
            <DateTimePicker
              label='End Time'
              value={localEventData.end}
              onChange={date => handleChange('end', dayjs(date))} // Convert to dayjs
              renderInput={params => <TextField {...params} fullWidth margin='normal' />}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localEventData.isRecurring}
                  onChange={e => handleChange('isRecurring', e.target.checked)}
                />
              }
              label='Recurring Event'
            />
          </Grid>
          {localEventData.isRecurring && (
            <>
              <Grid item xs={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Repeat Every</InputLabel>
                  <Select
                    value={localEventData.frequency}
                    onChange={e => handleChange('frequency', e.target.value)}
                    label='Repeat Every'
                  >
                    <MenuItem value={RRule.DAILY}>Day</MenuItem>
                    <MenuItem value={RRule.WEEKLY}>Week</MenuItem>
                    <MenuItem value={RRule.MONTHLY}>Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label='Interval'
                  type='number'
                  value={localEventData.interval}
                  onChange={e => handleChange('interval', parseInt(e.target.value))}
                  fullWidth
                  margin='normal'
                />
              </Grid>
              {localEventData.frequency === RRule.WEEKLY && (
                <Grid item xs={12}>
                  <FormGroup row>
                    <Typography variant='subtitle1' style={{ width: '100%', marginTop: '16px' }}>
                      Repeat On:
                    </Typography>
                    {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={localEventData.byweekday.includes(RRule[day])}
                            onChange={() => handleWeekdayChange(RRule[day])}
                          />
                        }
                        label={day}
                      />
                    ))}
                  </FormGroup>
                </Grid>
              )}
              <Grid item xs={12}>
                <DateTimePicker
                  label='End Date'
                  value={localEventData.until}
                  onChange={date => handleChange('until', dayjs(date))} // Convert to dayjs
                  renderInput={params => <TextField {...params} fullWidth margin='normal' />}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color='primary'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RecurringEventDialog
