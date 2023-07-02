import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { addLabel } from 'src/store/apps/kanban'
import { Select, MenuItem, FormControl, InputLabel, Box, Checkbox } from '@mui/material'
import NewLabelDialog from './NewLabelDialog'

const LabelSelect = ({ selectedLabels, setSelectedLabels }) => {
  const dispatch = useDispatch()
  const labels = useSelector(state => state.kanban.labels)
  const [isNewLabelDialogOpen, setNewLabelDialogOpen] = useState(false)

  const handleDialogClose = () => {
    setNewLabelDialogOpen(false)
  }

  const handleChange = event => {
    setSelectedLabels(event.target.value.filter(value => value !== 'addNew'))
  }

  return (
    <FormControl fullWidth>
      <InputLabel id='label-select'>Select Labels</InputLabel>
      <Select
        label='label select'
        multiple
        value={selectedLabels}
        id='label-select'
        onChange={handleChange}
        renderValue={selected =>
          selected
            .filter(value => value !== 'addNew')
            .map(value => {
              const label = labels.find(label => label.title === value)

              return (
                <Box
                  key={label.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: label.color,
                      marginRight: 1
                    }}
                  />
                  {label.title}
                </Box>
              )
            })
        }
      >
        <MenuItem key='addNew' value='addNew' onClick={() => setNewLabelDialogOpen(true)}>
          Add new
        </MenuItem>
        {labels &&
          labels.map(label => (
            <MenuItem key={label.id} value={label}>
              <Checkbox checked={selectedLabels.indexOf(label.title) > -1} />
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: label.color,
                  marginRight: 2
                }}
              />
              <Box
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {label.title}
              </Box>
            </MenuItem>
          ))}
      </Select>
      <NewLabelDialog isOpen={isNewLabelDialogOpen} onClose={handleDialogClose} />
    </FormControl>
  )
}

export default LabelSelect
