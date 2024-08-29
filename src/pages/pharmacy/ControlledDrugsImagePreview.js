import React, { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'

const ImagePreview = ({ imageSource, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const handleBackdropClick = event => {
    if (event.target === event.currentTarget) {
      setIsExpanded(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1000
      }}
    >
      <Box
        onClick={handleBackdropClick}
        sx={{
          width: isExpanded ? '100vw' : 100,
          height: isExpanded ? '100vh' : 100,
          position: isExpanded ? 'fixed' : 'relative',
          top: isExpanded ? 0 : 'auto',
          left: isExpanded ? 0 : 'auto',
          right: isExpanded ? 0 : 'auto',
          bottom: isExpanded ? 0 : 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s ease-in-out',
          cursor: isExpanded ? 'pointer' : 'default'
        }}
      >
        <img
          src={imageSource}
          alt='Captured'
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        <IconButton
          onClick={toggleExpand}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <Icon icon={isExpanded ? 'mdi:close' : 'mdi:magnify'} />
        </IconButton>
        {isExpanded && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: 'white'
            }}
          >
            <Icon icon='mdi:arrow-left' />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default ImagePreview
