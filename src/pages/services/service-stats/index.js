import { Box, Grid, Typography, Card, CardContent } from '@mui/material'

function ServiceStats() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Service Stats
      </Typography>
      <Typography variant='p' color={'red'} gutterBottom>
        Please be aware that this page is still under construction and the data is not accurate
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                NMS
              </Typography>
              <Typography variant='body1'>
                <b>Completed:</b> 100
              </Typography>
              <Typography variant='body1'>
                <b>Cancelled:</b> 10
              </Typography>
              <Typography variant='body1'>
                <b>Pending:</b> 20
              </Typography>
              <Typography variant='body1'>
                <b>Projected Reimbursement:</b> £1000
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                HTN
              </Typography>
              <Typography variant='body1'>
                <b>Completed:</b> 50
              </Typography>
              <Typography variant='body1'>
                <b>Cancelled:</b> 5
              </Typography>
              <Typography variant='body1'>
                <b>Pending:</b> 10
              </Typography>
              <Typography variant='body1'>
                <b>Projected Reimbursement:</b> £500
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                DMS
              </Typography>
              <Typography variant='body1'>
                <b>Completed:</b> 80
              </Typography>
              <Typography variant='body1'>
                <b>Cancelled:</b> 15
              </Typography>
              <Typography variant='body1'>
                <b>Pending:</b> 30
              </Typography>
              <Typography variant='body1'>
                <b>Projected Reimbursement:</b> £200
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                PFS
              </Typography>
              <Typography variant='body1'>
                <b>Completed:</b> 60
              </Typography>
              <Typography variant='body1'>
                <b>Cancelled:</b> 20
              </Typography>
              <Typography variant='body1'>
                <b>Pending:</b> 15
              </Typography>
              <Typography variant='body1'>
                <b>Projected Reimbursement:</b> £100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ServiceStats
