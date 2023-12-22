import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const UserDetailsDialog = ({ open, user: item, onClose }) => {
  console.log({ item })
  const user = item?.profiles?.users
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='user-details-dialog-title'
      aria-describedby='user-details-dialog-description'
    >
      <DialogTitle id='user-details-dialog-title'>{user?.first_name}</DialogTitle>
      <DialogContent>
        <Typography variant='body1'>Username: {user?.username}</Typography>
        <Typography variant='body1'>Email: {user?.email}</Typography>
        <Typography variant='body1'>Role: {item?.role}</Typography>
        <Typography variant='body1'>Status: {item?.status}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsDialog
