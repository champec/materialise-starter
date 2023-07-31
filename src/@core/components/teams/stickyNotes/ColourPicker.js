import { Popover, Button, Box } from '@mui/material'

const ColorPicker = ({ anchorEl, open, onClose, onColorChange }) => {
  const colors = ['not important', 'average', 'important', 'very important']

  const handleClick = color => {
    onColorChange(color)
    onClose()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <Box display='flex' flexDirection='column'>
        {colors.map((color, index) => (
          <Button key={index} onClick={() => handleClick(color)}>
            {color}
          </Button>
        ))}
      </Box>
    </Popover>
  )
}

export default ColorPicker
