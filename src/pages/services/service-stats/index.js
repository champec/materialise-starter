import React, { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import Icon from 'src/@core/components/icon'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tab,
  Tabs,
  Paper
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de'

function Stats() {
  const [selectedService, setSelectedService] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [services, setServices] = useState([])
  const [stats, setStats] = useState([])
  const [topProviders, setTopProviders] = useState([])
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    fetchServices()
    fetchStats()
    fetchTopProviders()
  }, [selectedService, selectedDate])

  const fetchServices = async () => {
    const { data, error } = await supabase.from('ps_services').select('id, name')
    if (error) console.error('Error fetching services:', error)
    else setServices(data)
  }

  const fetchStats = async () => {
    const startDate = startOfMonth(selectedDate)
    const endDate = endOfMonth(selectedDate)

    let query = supabase
      .from('ps_service_delivery')
      .select(
        `
        id,
        completed_at,
        ps_services(name),
        ps_service_stages(reimbursement),
        profiles(full_name, avatar_url),
        status,
        outcome
      `
      )
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())

    if (selectedService !== 'all') {
      query = query.eq('service_id', selectedService)
    }

    const { data, error } = await query

    if (error) console.error('Error fetching stats:', error)
    else setStats(data)
  }

  const fetchTopProviders = async () => {
    const startDate = startOfMonth(selectedDate)
    const endDate = endOfMonth(selectedDate)

    let query = supabase
      .from('ps_service_delivery')
      .select(
        `
        profiles(id, full_name, avatar_url),
        ps_services(name),
        ps_service_stages(reimbursement)
      `
      )
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())

    if (selectedService !== 'all') {
      query = query.eq('service_id', selectedService)
    }

    const { data, error } = await query

    console.log('service stats data', data)

    if (error) console.error('Error fetching top providers:', error)
    else {
      const providersMap = data.reduce((acc, curr) => {
        const { profiles, ps_services, ps_service_stages } = curr
        if (!acc[profiles?.id]) {
          acc[profiles?.id] = {
            ...profiles,
            servicesProvided: 0,
            estimatedEarning: 0,
            services: new Set()
          }
        }
        acc[profiles?.id].servicesProvided++
        acc[profiles?.id].estimatedEarning += ps_service_stages?.reimbursement || 0
        acc[profiles?.id].services.add(ps_services?.name)
        return acc
      }, {})

      setTopProviders(
        Object.values(providersMap)
          .map(provider => ({
            ...provider,
            services: Array.from(provider.services).join(', ')
          }))
          .sort((a, b) => b.servicesProvided - a.servicesProvided)
      )
    }
  }

  const totalEstimatedEarning = stats.reduce((sum, stat) => sum + (stat.ps_service_stages.reimbursement || 0), 0)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Service Statistics
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ mr: 2, minWidth: 120 }}>
            <InputLabel>Service</InputLabel>
            <Select value={selectedService} onChange={e => setSelectedService(e.target.value)} label='Service'>
              <MenuItem value='all'>All Services</MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            label='Month'
            value={selectedDate}
            onChange={newDate => setSelectedDate(newDate)}
            renderInput={params => <TextField {...params} />}
            views={['year', 'month']}
          />
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6'>Estimated Income for {format(selectedDate, 'MMMM yyyy')}</Typography>
            <Typography variant='h4'>£{totalEstimatedEarning.toFixed(2)}</Typography>
          </CardContent>
        </Card>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Services Completed' />
            <Tab label='Top Providers' />
          </Tabs>

          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Completed By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Outcome</TableCell>
                    <TableCell>Estimated Earning</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map(stat => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.ps_services.name}</TableCell>
                      <TableCell>{format(new Date(stat.completed_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={stat.profiles?.avatar_url} sx={{ mr: 2 }} />
                          {stat.profiles?.full_name}
                        </Box>
                      </TableCell>
                      <TableCell>{stat.status}</TableCell>
                      <TableCell>{stat.outcome}</TableCell>
                      <TableCell>£{(stat.ps_service_stages.reimbursement || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Services Provided</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Estimated Earning</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProviders.map(provider => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={provider.avatar_url} sx={{ mr: 2 }} />
                          {provider.full_name}
                        </Box>
                      </TableCell>
                      <TableCell>{provider.servicesProvided}</TableCell>
                      <TableCell>{provider.services}</TableCell>
                      <TableCell>£{provider.estimatedEarning.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Typography variant='caption' color='text.secondary'>
          Note: These figures are estimates and may not reflect the exact reimbursement. Please refer to the official
          MYS website for accurate payment information.
        </Typography>
      </Box>
    </LocalizationProvider>
  )
}

export default Stats
