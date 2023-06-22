import { useState, useEffect } from 'react'
// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Switch from '@mui/material/Switch'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import TimelineContent from '@mui/lab/TimelineContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { supabaseOrg } from 'src/configs/supabase'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomTimelineDot from 'src/@core/components/mui/timeline-dot'

// Styled Timeline component
const Timeline = styled(MuiTimeline)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root:nth-of-type(even) .MuiTimelineContent-root': {
    textAlign: 'left'
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiTimelineItem-root': {
      width: '100%',
      '&:before': {
        display: 'none'
      }
    }
  }
}))

const supabase = supabaseOrg

// Styled component for the image of a shoe
const ImgShoe = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius
}))

const TimelineCenter = ({ orderData, tasks }) => {
  // ** Vars
  const hiddenMD = useMediaQuery(theme => theme.breakpoints.down('md'))

  const [timelineData, setTimelineData] = useState([])

  const getDotColor = taskStatus => {
    if (taskStatus === 'Complete') {
      return 'success'
    } else if (taskStatus === 'In Progress') {
      return 'warning'
    } else {
      return 'primary'
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: jobPipelineData, error: jobPipelineError } = await supabase
          .from('job_pipeline')
          .select('*')
          .eq('transaction_type_id', 1) // Adjust the filter based on your requirements
          .order('steps')

        if (jobPipelineError) {
          console.error('Error fetching job pipeline data:', jobPipelineError)
          return
        }

        const timelineItems = jobPipelineData.map(item => {
          const completedTasks = tasks.filter(task => task.job_pipeline_id === item.id && task.completed)
          const currentTask = tasks.find(task => task.job_pipeline_id === item.id && !task.completed)
          const dotColor = currentTask ? 'warning' : completedTasks.length ? 'success' : 'primary'

          const timelineItem = {
            icon: item.icon,
            dotSkin: 'light',
            dotColor: dotColor,
            title:
              item.role === 'Seller' ? orderData.seller_id.organisation_name : orderData.buyer_id.organisation_name,
            caption: item.action,
            description: item.description,
            completedTasks: completedTasks.length,
            totalTasks: tasks.filter(task => task.job_pipeline_id === item.id).length,
            itemData: null,
            completedTasksDetails: [] // Add this line
          }

          if (completedTasks.length > 0) {
            timelineItem.completedTasksDetails = completedTasks.map(task => ({
              taskStatus: 'Complete',
              timestamp: task.updated_at
            }))
          }

          if (currentTask) {
            timelineItem.completedTasksDetails.push({
              taskStatus: 'In Progress',
              timestamp: null
            })
          }

          switch (item.steps) {
            case 1:
              timelineItem.imageSrc = '/materialize-nextjs-admin-template/demo-1/images/icons/file-icons/pdf.png'
              timelineItem.imageName = 'bookingCard.pdf'
              timelineItem.itemData = orderData
              break

            // Add more cases for other steps

            default:
              break
          }

          return timelineItem
        })

        setTimelineData(timelineItems)
      } catch (error) {
        console.error('Error fetching timeline data:', error)
      }
    }

    fetchData()
  }, [orderData, tasks])

  return (
    <Timeline position={hiddenMD ? 'right' : 'alternate'}>
      {timelineData.map((item, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <CustomTimelineDot skin={item.dotSkin} color={item.dotColor}>
              <Icon icon={item.icon} fontSize={20} />
            </CustomTimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ '& svg': { verticalAlign: 'bottom', mx: 4 } }}>
            <Box
              sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant='body2' sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
                {item.title}
              </Typography>
              <Typography variant='caption'>{item.caption}</Typography>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              <span dangerouslySetInnerHTML={{ __html: item.description }}></span>
            </Typography>
            <Typography variant='caption'>{item.completedTasksDetails?.timestamp}</Typography>
            {item.imageSrc && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <img width={28} height={28} alt={item.imageName} src={item.imageSrc} />
                <Typography variant='subtitle2' sx={{ ml: 2, fontWeight: 600 }}>
                  {item.imageName}
                </Typography>
              </Box>
            )}
            {item.completedTasks > 0 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2' sx={{ mr: 1 }}>
                  {`${item.completedTasks} / ${item.totalTasks} tasks completed`}
                </Typography>
                <CustomChip label='Completed' color='success' size='small' />
              </Box>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

const timelineData = [
  {
    icon: 'mdi:airplane',
    dotSkin: 'light',
    dotColor: 'error',
    title: 'Get on the flight',
    caption: 'Wednesday',
    description:
      '<span>Charles de Gaulle Airport, Paris</span> <Icon icon="mdi:arrow-right" fontSize={20} /> <span>Heathrow Airport, London</span>',
    time: '6:30 AM',
    imageSrc: '/materialize-nextjs-admin-template/demo-1/images/icons/file-icons/pdf.png',
    imageName: 'bookingCard.pdf'
  },
  {
    icon: 'mdi:clock-outline',
    dotSkin: 'light',
    dotColor: 'primary',
    title: 'Interview Schedule',
    caption: '6th October',
    description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus quos, voluptates voluptas rem.',
    avatarSrc: '/materialize-nextjs-admin-template/demo-1/images/avatars/2.png',
    avatarName: 'Rebecca Godman',
    avatarTitle: 'Javascript Developer'
  },
  {
    icon: 'mdi:cart-outline',
    dotSkin: 'light',
    dotColor: 'warning',
    title: 'Sold Puma POPX Blue Color',
    caption: '4th October',
    description:
      'PUMA presents the latest shoes from its collection. Light & comfortable made with highly durable material.',
    imageSrc: '/materialize-nextjs-admin-template/demo-1/images/misc/shoe.jpeg',
    customerName: 'Micheal Scott',
    price: '375.00',
    quantity: '1'
  },
  {
    icon: 'mdi:file-edit-outline',
    dotSkin: 'light',
    dotColor: 'success',
    title: 'Design Review',
    caption: '4th October',
    description: 'Weekly review of freshly prepared design for our new application.',
    clientAvatarSrc: '/materialize-nextjs-admin-template/demo-1/images/avatars/1.png',
    clientName: 'John Doe (Client)'
  },
  {
    icon: 'mdi:server',
    dotSkin: 'light',
    dotColor: 'error',
    title: 'Ubuntu Server',
    caption: null,
    ipAddress: '192.654.8.566',
    cpu: '4 Cores',
    memory: '2 GB',
    switchState: false
  },
  {
    icon: 'mdi:map-marker-outline',
    dotSkin: 'light',
    dotColor: 'success',
    title: 'Location',
    caption: null,
    priorityLabel: 'High',
    description: 'Final location for the company celebration.',
    dueDate: '15th Jan',
    linkIcon: 'mdi:link-variant',
    messageIcon: 'mdi:message-outline',
    accountIcon: 'mdi:account-outline'
  }
]

export default TimelineCenter
