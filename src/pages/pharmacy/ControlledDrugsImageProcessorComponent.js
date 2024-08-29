import React, { useState, useRef } from 'react'
import {
  Modal,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
  Alert,
  AlertTitle
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import Webcam from 'react-webcam'
import Entries from './ControlledDrugsImageEntries'
import ImagePreview from './ControlledDrugsImagePreview'
import { supabaseOrg } from 'src/configs/supabase'
import { v4 as uuidv4 } from 'uuid'

const ControlledDrugImageProcessor = ({ open, handleClose, processImage, registers, onConfirm }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImage(imageSrc)
  }

  const handleFileUpload = async event => {
    const file = event.target.files[0]
    if (file) {
      try {
        setIsProcessing(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error } = await supabaseOrg.storage.from('temp_cd').upload(filePath, file)

        if (error) throw error

        const { data: urlData } = supabaseOrg.storage.from('temp_cd').getPublicUrl(filePath)

        setCapturedImage(urlData.publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        // Handle error (show error message to user)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const result = await processImage(capturedImage)

      console.log('PROCESSED DATA', result)
      setProcessedData(result)
    } catch (error) {
      console.error('Error processing image:', error)
      setProcessedData([{ type: 'error', reason: 'Failed to process image' }])
    }
    setIsProcessing(false)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setProcessedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEdit = (index, field, value) => {
    const updatedData = [...processedData]
    updatedData[index] = { ...updatedData[index], [field]: value }
    setProcessedData(updatedData)
  }

  const handleConfirm = entry => {
    onConfirm(entry)
    setProcessedData(processedData.filter(item => item !== entry))
  }

  const getDrugInfo = drugId => {
    const register = registers.find(r => r.id === drugId)
    return register ? `${register.drug_name} ${register.strength} ${register.form}` : 'Unknown Drug'
  }

  const handleReturnToCapture = () => {
    setProcessedData(null)
  }
  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 800,
          height: '90vh',
          p: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant='h6' gutterBottom>
          Controlled Drug Image Processor
        </Typography>
        {!processedData ? (
          <>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label='Webcam' />
              <Tab label='Upload' />
            </Tabs>
            <Box flex={1} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
              {!capturedImage ? (
                activeTab === 0 ? (
                  <Webcam audio={false} ref={webcamRef} screenshotFormat='image/jpeg' width='100%' />
                ) : (
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                )
              ) : (
                <img
                  src={capturedImage}
                  alt='captured'
                  style={{ maxWidth: '600px', maxHeight: '400px', objectFit: 'contain' }}
                />
              )}
            </Box>
            <Box mt={2} display='flex' justifyContent='space-between'>
              {!capturedImage ? (
                activeTab === 0 ? (
                  <Button onClick={handleCapture} startIcon={<Icon icon='mdi:camera' />}>
                    Capture Image
                  </Button>
                ) : (
                  <Button onClick={() => fileInputRef.current.click()} startIcon={<Icon icon='mdi:upload' />}>
                    Upload Image
                  </Button>
                )
              ) : (
                <>
                  <Button onClick={handleRetake} startIcon={<Icon icon='mdi:refresh' />}>
                    Retake
                  </Button>
                  <Button
                    onClick={handleProcess}
                    variant='contained'
                    color='primary'
                    startIcon={<Icon icon='mdi:file-document-edit' />}
                  >
                    Process Image
                  </Button>
                </>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            <ImagePreview imageSource={capturedImage} />
            <Box sx={{ height: '100%', overflow: 'auto', paddingRight: 2 }}>
              <Entries
                processedData={processedData}
                handleEdit={handleEdit}
                handleConfirm={handleConfirm}
                getDrugInfo={getDrugInfo}
              />
              <Button onClick={handleReturnToCapture} startIcon={<Icon icon='mdi:arrow-left' />}>
                Return to Capture
              </Button>
            </Box>
          </Box>
        )}
        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography variant='h6' gutterBottom>
              Processing Image
            </Typography>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Modal>
  )
}

export default ControlledDrugImageProcessor
