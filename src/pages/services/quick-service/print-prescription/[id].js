import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Grid, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { supabase } from 'src/configs/supabase'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const MUITableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: `${theme.spacing(1, 0)} !important`
}))

const PrintPrescription = () => {
  const [prescription, setPrescription] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { id } = router.query
  const theme = useTheme()

  useEffect(() => {
    const fetchPrescription = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('ps_prescriptions')
          .select('*, ps_service_delivery(*)')
          .eq('id', id)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setPrescription(data)
        }
      }
    }

    fetchPrescription()
  }, [id])

  useEffect(() => {
    if (prescription) {
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }, [prescription])

  if (error) {
    return <Typography color='error'>{error}</Typography>
  }

  if (!prescription) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box sx={{ p: 12, pb: 6 }}>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <Typography variant='h6'>Prescription</Typography>
          <Typography variant='body2'>Prescription ID: {prescription.id}</Typography>
          <Typography variant='body2'>Date: {new Date(prescription.created_at).toLocaleDateString()}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant='h6'>Patient Information</Typography>
          <Typography variant='body2'>Name: {prescription?.patient_object?.full_name || 'not provided'}</Typography>
          <Typography variant='body2'>DOB: {prescription?.patient_object?.date_of_birth || 'not provided'}</Typography>
          <Typography variant='body2'>
            NHS Number: {prescription?.patient_object?.nhs_number || 'not provided'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Drug</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Dose</TableCell>
            <TableCell>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <MUITableCell>{prescription.drug_code}</MUITableCell>
            <MUITableCell>{prescription.drug_desc}</MUITableCell>
            <MUITableCell>{prescription.drug_dose}</MUITableCell>
            <MUITableCell>
              {prescription.drug_qty} {prescription.drug_unit}
            </MUITableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box sx={{ mt: 4 }}>
        <Typography variant='body1'>Prescription Details:</Typography>
        <Typography variant='body2'>{prescription.prescription_particulars}</Typography>
      </Box>

      <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

      <Grid container spacing={6}>
        <Grid item xs={6}>
          <Typography variant='body2'>Prescriber: {prescription.written_by}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='body2'>Pharmacy: {prescription.ps_service_delivery.pharmacy_name}</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

PrintPrescription.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default PrintPrescription
