import { useState, useEffect } from 'react'
import { supabaseOrg } from 'src/configs/supabase'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import OptionsMenu from 'src/@core/components/option-menu'
import AddMemberDialog from './AddMemberDialog'
import ConfirmationDialog from './ConfirmationDialog'
import UserDetailsDialog from './UserDetailsDialog'

const Teams = ({ data }) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    userId: null
  })
  const [userDetailsDialog, setUserDetailsDialog] = useState({
    open: false,
    user: null
  })
  const orgId = useOrgAuth().organisation?.id

  const fetchTeamMembers = async () => {
    const { data, error } = await supabaseOrg
      .from('users_organisation')
      .select(`*, profiles!users_organisation_user_fkey(*)`)
      .eq('organisation', orgId)
      .not('status', 'eq', 'Deleted')
    if (error) console.log(error)

    console.log({ data })
    setTeamMembers(data)
  }

  const openUserDetailsDialog = user => {
    setUserDetailsDialog({ open: true, user })
  }

  const closeUserDetailsDialog = () => {
    setUserDetailsDialog({ open: false, user: null })
  }

  const viewUserDetails = user => {
    console.log({ user })
    openUserDetailsDialog(user)
  }

  const openConfirmDialog = (title, message, action, userId) => {
    setConfirmDialog({ open: true, title, message, action, userId })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, title: '', message: '', action: null, userId: null })
  }

  const handleConfirmDialogAction = async () => {
    if (confirmDialog.action === 'suspend') {
      await updateUserStatus(confirmDialog.userId, 'Suspended')
    } else if (confirmDialog.action === 'delete') {
      await updateUserStatus(confirmDialog.userId, 'Deleted')
    }
    closeConfirmDialog()
  }

  const updateUserStatus = async (userId, status) => {
    const { error } = await supabaseOrg
      .from('users_organisation')
      .update({ status })
      .eq('user', userId)
      .eq('organisation', orgId)
    if (error) console.error(error)
    else fetchTeamMembers() // refetch the team members
  }

  const openAddMemberDialog = () => {
    setAddMemberDialogOpen(true)
  }

  const closeAddMemberDialog = () => {
    setAddMemberDialogOpen(false)
    fetchTeamMembers() // Refetch the team members
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            onClick={openAddMemberDialog}
            variant='contained'
            startIcon={<Icon icon='mdi:user-add-outline' fontSize={20} />}
          >
            Add Member
          </Button>
        </Box>
      </Grid>
      <AddMemberDialog
        open={addMemberDialogOpen}
        onClose={closeAddMemberDialog}
        orgId={orgId}
        teamMembers={teamMembers}
      />
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDialogAction}
        onCancel={closeConfirmDialog}
      />
      <UserDetailsDialog open={userDetailsDialog.open} user={userDetailsDialog.user} onClose={closeUserDetailsDialog} />
      {teamMembers &&
        Array.isArray(teamMembers) &&
        teamMembers.map((item, index) => {
          return (
            <Grid key={index} item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={item.profiles.avatar_url} sx={{ mr: 2, height: 32, width: 32 }} />
                      <Typography variant='h6' sx={{ fontSize: '1.125rem', color: 'text.secondary' }}>
                        {item?.profiles.full_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size='small' sx={{ color: 'text.secondary' }}>
                        <Icon icon='mdi:star-outline' />
                      </IconButton>
                      <OptionsMenu
                        iconButtonProps={{ size: 'small' }}
                        options={[
                          { text: 'View Details', menuItemProps: { onClick: () => viewUserDetails(item) } },
                          // 'Add to Favorites',
                          { divider: true },
                          {
                            text: 'Remove Member',
                            menuItemProps: {
                              sx: { color: 'error.main' },
                              onClick: () =>
                                openConfirmDialog(
                                  'Remove Member',
                                  `Are you sure you want to remove ${item.profiles.username}?`,
                                  'delete',
                                  item.profiles.id
                                )
                            }
                          },
                          {
                            text: 'Suspend Member',
                            menuItemProps: {
                              onClick: () =>
                                openConfirmDialog(
                                  'Suspend Member',
                                  `Are you sure you want to suspend ${item.profiles.username}?`,
                                  'suspend',
                                  item.profiles.id
                                )
                            }
                          }
                        ]}
                      />
                    </Box>
                  </Box>
                  <Typography sx={{ my: 4, color: 'text.secondary' }}>{item.profiles.username}</Typography>
                  <Typography sx={{ my: 4, color: 'text.secondary' }}>{item.descriptio}</Typography>
                  <Box sx={{ gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvatarGroup className='pull-up' sx={{ alignItems: 'center' }}>
                        {item?.avatarGroup?.map((person, index) => {
                          return (
                            <Tooltip key={index} title={person.name}>
                              <Avatar src={person.avatar} alt={person.name} sx={{ height: 32, width: 32 }} />
                            </Tooltip>
                          )
                        })}
                        <Typography variant='body2' sx={{ ml: 0.5, color: 'text.disabled' }}>
                          +{item.extraMembers}
                        </Typography>
                      </AvatarGroup>
                    </Box>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      {item.status && (
                        <Box
                          href='/'
                          key={index}
                          component={Link}
                          onClick={e => e.preventDefault()}
                          sx={{
                            textDecoration: 'none',
                            '&:not(:last-of-type)': { mr: 3 },
                            '& .MuiChip-root': { cursor: 'pointer' }
                          }}
                        >
                          <CustomChip
                            size='small'
                            skin='light'
                            color={item.status === 'Active' ? 'primary' : 'secondary'}
                            label={item.status}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
    </Grid>
  )
}

export default Teams
