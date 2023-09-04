import React, { useState } from 'react'
import { Paper, Typography, IconButton, Box } from '@mui/material'
import styled from '@emotion/styled'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import Icon from 'src/@core/components/icon' // Import your custom icon component

// Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '100%'
})

const ScrollWrapper = ({ children }) => {
  return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
}

const Lane = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: isExpanded ? '300px' : '50px',
        height: '100%',
        margin: '0.5em',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isExpanded ? 'row' : 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '56px',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Box
          sx={{
            display: isExpanded ? 'block' : 'none',
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <Typography>{title}</Typography>
          {/* Add other elements like counters here */}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '56px'
          }}
        >
          <IconButton onClick={handleToggle}>
            <Icon icon={isExpanded ? 'ri:contract-left-line' : 'ri:contract-right-line'} fontSize={20} />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: isExpanded ? 'none' : 'block',
            opacity: isExpanded ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            whiteSpace: 'nowrap',
            transform: 'rotate(-90deg)',
            marginTop: '30px'
          }}
        >
          <Typography>{title}</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          padding: '8px',
          height: 'calc(100% - 56px)',
          overflowY: 'auto',
          overflowX: 'hidden' // Prevent horizontal scrolling
        }}
      >
        {isExpanded && <ScrollWrapper>{children}</ScrollWrapper>}
      </Box>
    </Paper>
  )
}

export default Lane
