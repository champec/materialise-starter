// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'

const ProjectAvatar = ({ project }) => {
  const { title, avatar, avatarColor = 'primary' } = project
  if (avatar.length) {
    return <CustomAvatar src={avatar} sx={{ width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar skin='light' color={avatarColor} sx={{ width: 38, height: 38 }}>
        {getInitials(title)}
      </CustomAvatar>
    )
  }
}

const Projects = ({ data }) => {
  return (
    <Box>
      <Typography variant='h6' className='mb-4'>
        Projects
      </Typography>
    </Box>
  )
}

export default Projects
