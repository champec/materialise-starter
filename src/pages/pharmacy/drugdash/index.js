import React, { useState } from 'react'
import { Container, AppBar, Toolbar, Typography, Button, Paper, Box } from '@mui/material'
import Lane from './lowerdashboard/ddlanes'
import Card from './lowerdashboard/ddCards'
import dummyCards from './dummyData'

const Settings = () => {
  return (
    <div>
      <h2>Settings</h2>
    </div>
  )
}

const Index = () => {
  const [showSettings, setShowSettings] = useState(false)

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  return (
    <Container>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>DrugDash</Typography>
          <Button color='inherit' onClick={toggleSettings}>
            {showSettings ? 'Dashboard' : 'Settings'}
          </Button>
          <Button color='inherit'>Add New Bag</Button>
          <Button color='inherit'>Add New Delivery</Button>
        </Toolbar>
      </AppBar>
      <Paper
        elevation={3}
        sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 64px)', overflow: 'hidden' }}
      >
        {showSettings ? (
          <Settings />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
            <Lane title='Bags Lane'>
              {dummyCards.map((title, index) => (
                <Card key={index.id} title={title.id} data={title} />
              ))}
            </Lane>
            <Lane title='Delivery Lane'>
              {dummyCards.map((title, index) => (
                <Card key={index.id} title={title.id} data={title} />
              ))}
            </Lane>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default Index
