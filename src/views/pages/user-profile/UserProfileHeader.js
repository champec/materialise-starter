// ** React Imports
import { useState, useEffect } from 'react'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// ** MUI Components
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  TextField,
  ButtonBase
} from '@mui/material'

// ** Third Party Imports
import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const ProfilePicture = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: theme.shape.borderRadius,
  border: `5px solid ${theme.palette.common.white}`,
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4)
  }
}))

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(5),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const UserProfileHeader = ({ data, nhsData }) => {
  // ** State
  // const [data, setData] = useState([])
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState('')
  const [imgSrc, setImgSrc] = useState(() => {
    if (editing === 'header') {
      return data?.header_url || '/images/pages/profile-banner.png'
    } else {
      return data?.avatar_url || '/images/avatars/1.png'
    }
  })
  const [inputValue, setInputValue] = useState('')
  const [bucket, setBucket] = useState('')
  const [urlField, setUrlField] = useState('')

  const { refreshOrgData } = useOrgAuth()

  useEffect(() => {
    if (editing === 'header') {
      setImgSrc(data?.header_url || '/images/pages/profile-banner.png')
    } else {
      setImgSrc(data?.avatar_url || '/images/avatars/1.png')
    }
  }, [data, editing])

  useEffect(() => {
    // axios.get('/pages/profile-header').then(response => {
    //   setData([])
    // })
  }, [])

  console.log({ data, nhsData })

  const handleEditOpen = () => setOpenEdit(true)
  const handleEditClose = () => setOpenEdit(false)

  const handleEditProfileClick = arg => {
    setEditing(arg)
    setOpenEdit(true)
    if (arg === 'header') {
      setBucket('headers')
      setUrlField('header_url')
    } else {
      setBucket('avatars')
      setUrlField('avatar_url')
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setImgSrc('/images/avatars/1.png')
  }

  const handleInputImageChange = event => {
    const reader = new FileReader()
    const file = event.target.files[0]

    reader.onload = () => {
      setImgSrc(reader.result)
      setInputValue(reader.result) // Set inputValue state here.
    }

    if (file) {
      reader.readAsDataURL(file)
    }
  }
  const getPublicUrlFromPath = async filePath => {
    const { data, error } = await supabase.storage.from(bucket).getPublicUrl(filePath)

    if (error) {
      console.error(error)
      return filePath
    }
    return data.publicUrl
  }

  const uploadDataUrlAsFile = async (dataUrl, fileName) => {
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob)

    if (error) throw error

    return data
  }

  const handleSubmit = async e => {
    e.preventDefault()

    let imageKey = urlField
    let currentImage = data[imageKey]

    let currentImagePath = ''
    if (currentImage) {
      currentImagePath = currentImage.split('/').pop()
    }

    if (inputValue) {
      const fileName = `${bucket}-${Date.now()}`
      const newImageData = await uploadDataUrlAsFile(inputValue, fileName)
      const signedURL = await getPublicUrlFromPath(newImageData.path)
      currentImagePath = signedURL

      // Delete the old profile image from the storage bucket
      if (currentImage) {
        const oldImageKey = currentImage.split('/').pop()
        const { error: deleteImageError } = await supabase.storage.from(bucket).remove([oldImageKey])

        if (deleteImageError) {
          console.log(deleteImageError)
        }
      }
    }

    const updateObject = { updated_at: new Date() }
    updateObject[imageKey] = currentImagePath

    const { data: updateData, error } = await supabase
      .from('profiles')
      .update(updateObject)
      .eq('id', data.id)
      .select('*')

    if (error) {
      console.log(error)
    } else {
      console.log(updateData)
      refreshOrgData()
      handleEditClose()
    }
  }

  const designationIcon = data?.designationIcon || 'mdi:briefcase-outline'

  return data !== null ? (
    <Card>
      <ButtonBase onClick={() => handleEditProfileClick('header')}>
        <CardMedia
          component='img'
          alt='profile-header'
          image={data.header_url || '/images/pages/profile-banner.png'}
          sx={{
            height: { xs: 150, md: 250 }
          }}
        />
      </ButtonBase>
      <CardContent
        sx={{
          pt: 0,
          mt: -8,
          display: 'flex',
          alignItems: 'flex-end',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          justifyContent: { xs: 'center', md: 'flex-start' }
        }}
      >
        <ButtonBase onClick={() => handleEditProfileClick('profile')}>
          <ProfilePicture src={data.avatar_url || '/images/avatars/1.png'} alt='profile-picture' />
        </ButtonBase>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            ml: { xs: 0, md: 6 },
            alignItems: 'flex-end',
            flexWrap: ['wrap', 'nowrap'],
            justifyContent: ['center', 'space-between']
          }}
        >
          <Box sx={{ mb: [6, 0], display: 'flex', flexDirection: 'column', alignItems: ['center', 'flex-start'] }}>
            <Typography variant='h5' sx={{ mb: 4, fontSize: '1.375rem' }}>
              {data.organisation_name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: ['center', 'flex-start']
              }}
            >
              <Box sx={{ mr: 4, display: 'flex', alignItems: 'center', '& svg': { mr: 1, color: 'text.secondary' } }}>
                <Icon icon={designationIcon} />
                <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>{data.ODS}</Typography>
              </Box>
              <Box
                sx={{
                  mr: 4,
                  display: 'flex',
                  alignItems: 'center',
                  '& svg': { mr: 1, color: 'text.secondary' },
                  maxWidth: '300px'
                }}
              >
                <Icon icon='mdi:map-marker-outline' />
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`${nhsData?.address1}, ${nhsData?.city} `.replace(
                    /\w\S*/g,
                    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 1, color: 'text.secondary' } }}>
                <Icon icon='mdi:calendar-blank-outline' />
                <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Joined {new Date(data.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button variant='contained' startIcon={<Icon icon='mdi:account-check-outline' fontSize={20} />}>
            Connected
          </Button>
        </Box>
      </CardContent>
      <Dialog
        open={openEdit}
        onClose={handleEditClose}
        aria-labelledby='user-view-edit'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, p: [2, 10] } }}
        aria-describedby='user-view-edit-description'
      >
        <DialogTitle id='user-view-edit' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
          {editing === 'header' ? 'Edit Header Image' : 'Edit Logo'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
            Updating user details will receive a privacy audit.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ImgStyled src={imgSrc} alt='Profile Pic' />
                  <div>
                    <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                      Upload New Photo
                      <input
                        hidden
                        type='file'
                        accept='image/png, image/jpeg'
                        onChange={handleInputImageChange}
                        id='account-settings-upload-image'
                        name='newProfileImage'
                      />
                    </ButtonStyled>
                    <ResetButtonStyled color='secondary' variant='outlined' onClick={handleInputImageReset}>
                      Reset
                    </ResetButtonStyled>
                    <Typography sx={{ mt: 5, color: 'text.disabled' }}>
                      Allowed PNG or JPEG. Max size of 800K.
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Grid>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button variant='contained' type='submit' sx={{ mr: 1 }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleEditClose}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  ) : null
}

export default UserProfileHeader
