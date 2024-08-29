import React, { useRef, useState } from 'react'
import { Modal, Button, Box, Typography, Tab, Tabs } from '@mui/material'
import Webcam from 'react-webcam'

const ImageCaptureModal = ({ open, handleClose, handleCapture }) => {
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImage(imageSrc)
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const confirmCapture = () => {
    handleCapture(capturedImage)
    handleClose()
  }

  const retake = () => {
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant='h6' component='h2' gutterBottom>
          Capture or Upload Image
        </Typography>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label='Webcam' />
          <Tab label='Upload' />
        </Tabs>
        {!capturedImage ? (
          <>
            {activeTab === 0 && <Webcam audio={false} ref={webcamRef} screenshotFormat='image/jpeg' width='100%' />}
            {activeTab === 1 && <input type='file' accept='image/*' onChange={handleFileChange} ref={fileInputRef} />}
            <Box mt={2}>
              {activeTab === 0 && <Button onClick={capture}>Capture</Button>}
              {activeTab === 1 && <Button onClick={() => fileInputRef.current.click()}>Select File</Button>}
            </Box>
          </>
        ) : (
          <>
            <img src={capturedImage} alt='captured' style={{ width: '100%' }} />
            <Box mt={2}>
              <Button onClick={retake}>Retake</Button>
              <Button onClick={confirmCapture}>Confirm</Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}

export default ImageCaptureModal
