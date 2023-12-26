import React, { useState, useEffect } from 'react'
import { supabase } from 'src/configs/supabase'
import debounce from 'lodash/debounce'
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input
} from '@mui/material'

function PrescriptionWrite({ prescription, setPrescription }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [dose, setDose] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (searchTerm) {
      searchDrugs(searchTerm)
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const searchDrugs = debounce(async term => {
    const { data, error } = await supabase
      .from('bnf_medicinal_forms')
      .select('id, name, manufacturer, bnf_form_packs(id, size)')
      .ilike('name', `%${term}%`)

    if (error) {
      console.error('Error fetching drugs:', error)
    } else {
      setSearchResults(data)
    }
  }, 500)

  const handleDrugSelection = drug => {
    setSelectedDrug(drug)
    setOpenDialog(true)
  }

  const handleAddPrescription = () => {
    setPrescription([...prescription, { ...selectedDrug, dosage: dose, quantity: quantity }])
    setOpenDialog(false)
    setSearchTerm('')
    setDose('')
    setQuantity('')
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <TextField
        label='Search Drug'
        variant='outlined'
        type='search'
        autoComplete='off'
        fullWidth
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Display Search Results */}
      {searchResults.map(drug => (
        <div key={drug.id}>
          {drug.name} - {drug.manufacturer}
          <Button variant='outlined' onClick={() => handleDrugSelection(drug)}>
            Add to Prescription
          </Button>
        </div>
      ))}

      {/* Dialog for Dosage and Quantity */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Prescription Details</DialogTitle>
        <DialogContent>
          <Input
            autoFocus
            placeholder='Dosage'
            fullWidth
            value={dose}
            onChange={e => setDose(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Input placeholder='Quantity' fullWidth value={quantity} onChange={e => setQuantity(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPrescription}>Add to Prescription</Button>
        </DialogActions>
      </Dialog>

      {/* Display Current Prescription */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Drug</TableCell>
            <TableCell>Dosage</TableCell>
            <TableCell>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prescription.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.dosage}</TableCell>
              <TableCell>{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default PrescriptionWrite
