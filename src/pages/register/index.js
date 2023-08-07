import { useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Icon from 'src/@core/components/icon'
import themeConfig from 'src/configs/themeConfig'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustrationsV1'
import Logo from 'src/@core/components/logo/Logo'
import Grid from '@mui/material/Grid'
import CustomRadioIcons from 'src/@core/components/custom-radio/icons'

// ** Next Import
import Link from 'next/link'

import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const options = [
  { value: 'user', title: 'User Sign up', content: 'Create a new user account', icon: 'user' },
  {
    value: 'organisation',
    title: 'Organisation Sign up',
    content: 'Create a new organisation account',
    icon: 'briefcase'
  }
]

const icons = [
  { icon: 'ic:round-man-2', iconProps: { fontSize: '2rem', style: { marginBottom: 8 } } },
  { icon: 'pepicons-print:building', iconProps: { fontSize: '2rem', style: { marginBottom: 8 } } }
]

const CustomRadioWithIcons = ({ options, onSelect }) => {
  const initialSelected = options[0].value
  const [selected, setSelected] = useState(initialSelected)

  const handleChange = value => {
    setSelected(value)
    onSelect(value)
  }

  return (
    <Grid container spacing={4}>
      {options.map((option, index) => (
        <CustomRadioIcons
          key={index}
          data={option}
          selected={selected}
          icon={icons[index].icon}
          handleChange={handleChange}
          gridProps={{ sm: 6, xs: 12 }} // Adjust gridProps according to your design requirements
          iconProps={icons[index].iconProps}
        />
      ))}
    </Grid>
  )
}

const RegisterV1 = () => {
  const router = useRouter()
  const [signupType, setSignupType] = useState('user')

  const theme = useTheme()

  const handleSignupTypeChange = value => {
    setSignupType(value)
  }

  const handleNextClick = () => {
    if (signupType === 'user') {
      router.push('/register/usersignup')
    } else if (signupType === 'organisation') {
      router.push('/register/organisationsignup')
    }
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ p: theme => `${theme.spacing(15.5, 7, 6.5)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Logo />
            <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ mb: 1.5, letterSpacing: '0.18px', fontWeight: 600 }}>
              Adventure starts here 🚀
            </Typography>
            <Typography variant='body2'>Make your app management easy and fun!</Typography>
          </Box>

          <CustomRadioWithIcons options={options} onSelect={handleSignupTypeChange} />

          <Box sx={{ mt: 4 }}>
            <Typography variant='h6' sx={{ mb: 1.5, fontWeight: 600 }}>
              {signupType === 'user' ? 'Sign up as a User' : 'Sign up as an Organisation'}
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              {signupType === 'user' ? 'Create a new user account' : 'Create a new organisation account'}
            </Typography>
            <Button variant='contained' onClick={handleNextClick}>
              Next
            </Button>
          </Box>
          <Box sx={{ mt: 4 }}></Box>

          <Divider
            sx={{
              '& .MuiDivider-wrapper': { px: 4 },
              mt: theme => `${theme.spacing(5)} !important`,
              mb: theme => `${theme.spacing(7.5)} !important`
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Typography sx={{ mr: 2, color: 'text.secondary' }}>Already have an account?</Typography>
            <Typography href='/login' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
              Sign in instead
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 image={`/images/pages/auth-v1-register-mask-${theme.palette.mode}.png`} />
    </Box>
  )
}

RegisterV1.getLayout = page => <BlankLayout>{page}</BlankLayout>
RegisterV1.authGuard = false
RegisterV1.orgGuard = false

export default RegisterV1

// // ** React Imports
// import { useState, Fragment } from 'react'

// // ** Next Import
// import Link from 'next/link'

// // ** MUI Components
// import Box from '@mui/material/Box'
// import Button from '@mui/material/Button'
// import Divider from '@mui/material/Divider'
// import Checkbox from '@mui/material/Checkbox'
// import TextField from '@mui/material/TextField'
// import Typography from '@mui/material/Typography'
// import InputLabel from '@mui/material/InputLabel'
// import IconButton from '@mui/material/IconButton'
// import CardContent from '@mui/material/CardContent'
// import FormControl from '@mui/material/FormControl'
// import OutlinedInput from '@mui/material/OutlinedInput'
// import { styled, useTheme } from '@mui/material/styles'
// import MuiCard from '@mui/material/Card'
// import InputAdornment from '@mui/material/InputAdornment'
// import MuiFormControlLabel from '@mui/material/FormControlLabel'

// // ** Icon Imports
// import Icon from 'src/@core/components/icon'

// // ** Configs
// import themeConfig from 'src/configs/themeConfig'

// // ** Layout Import
// import BlankLayout from 'src/@core/layouts/BlankLayout'

// // ** Demo Imports
// import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustrationsV1'
// import Logo from 'src/@core/components/logo/Logo'

// // ** Styled Components
// const Card = styled(MuiCard)(({ theme }) => ({
//   [theme.breakpoints.up('sm')]: { width: '28rem' }
// }))

// const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
//   marginBottom: theme.spacing(4),
//   '& .MuiFormControlLabel-label': {
//     fontSize: '0.875rem',
//     color: theme.palette.text.secondary
//   }
// }))

// const RegisterV1 = () => {
//   // ** States
//   const [values, setValues] = useState({
//     password: '',
//     showPassword: false
//   })

//   // ** Hook
//   const theme = useTheme()

//   const handleChange = prop => event => {
//     setValues({ ...values, [prop]: event.target.value })
//   }

//   const handleClickShowPassword = () => {
//     setValues({ ...values, showPassword: !values.showPassword })
//   }

//   const handleMouseDownPassword = event => {
//     event.preventDefault()
//   }

//   return (
//     <Box className='content-center'>
//       <Card sx={{ zIndex: 1 }}>
//         <CardContent sx={{ p: theme => `${theme.spacing(15.5, 7, 6.5)} !important` }}>
//           <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <Logo />
//             <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
//               {themeConfig.templateName}
//             </Typography>
//           </Box>
//           <Box sx={{ mb: 6 }}>
//             <Typography variant='h5' sx={{ mb: 1.5, letterSpacing: '0.18px', fontWeight: 600 }}>
//               Adventure starts here 🚀
//             </Typography>
//             <Typography variant='body2'>Make your app management easy and fun!</Typography>
//           </Box>

//           {/*content to be added here*/}
//         </CardContent>
//       </Card>
//       <FooterIllustrationsV1 image={`/images/pages/auth-v1-register-mask-${theme.palette.mode}.png`} />
//     </Box>
//   )
// }

// RegisterV1.getLayout = page => <BlankLayout>{page}</BlankLayout>
// RegisterV1.authGuard = false
// // LoginPage.authGuard = false
// RegisterV1.orgGuard = false

// export default RegisterV1
