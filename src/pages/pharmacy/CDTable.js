// ** React Imports
import { useRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Drawer,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material'
import { styled } from '@mui/system'
import Button from '@mui/material/Button'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import QuickSearchToolbar from './QuickSearchToolbar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Data Import
import { dummyData } from 'src/views/apps/store/dummyData'

const rows = dummyData

const GridHeader = styled('div')({
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflow: 'hidden'
})

const createEmptyRow = () => {
  const today = new Date()
  const formattedDate = today.toISOString().split('T')[0] // Formats the date as 'YYYY-MM-DD'
  return {
    // ... define the structure with empty values or placeholders
    // Ensure this matches the structure of your other rows
    id: 'new', // unique identifier for the new row
    date: formattedDate,
    supplier: '',
    patient: '',
    prescriber: '',
    collected_by: '',
    id_requested: null,
    id_provided: null,
    quantity: '',
    running_total: '',
    entrymadeby: ''
    // ... other fields as needed
  }
}

const testData = [
  {
    id: 1,
    date: '2021-10-01',
    supplier: 'Phoenix Pharmacy, 123 Fake Street, London, E1 4AB',
    patient: 'Jane Smith, 123 Fake Street, London, E1 4AB',
    prescriber: 'Dr. John Doe (GMC 1234567)',
    collected_by: 'Anne Smith (sister)',
    id_requested: true,
    id_provided: true,
    quantity: 10,
    running_total: 10,
    entrymadeby: 'Lukas'
  },
  {
    id: 2,
    date: '2021-10-02',
    supplier: 'Phoenix Pharmacy, 123 Fake Street, London, E1 4AB',
    patient: 'John Doe, 456 Real Street, London, E1 4AB',
    prescriber: 'Dr. Jane Smith (GMC 7654321)',
    collected_by: 'John Smith (brother)',
    id_requested: true,
    id_provided: false,
    quantity: 5,
    running_total: 15,
    entrymadeby: 'Lukas'
  },
  {
    id: 3,
    date: '2021-10-03',
    supplier: 'Phoenix Pharmacy, 123 Fake Street, London, E1 4AB',
    patient: 'Alice Johnson, 789 Real Street, London, E1 4AB',
    prescriber: 'Dr. John Doe (GMC 1234567)',
    collected_by: 'Bob Johnson (husband)',
    id_requested: false,
    id_provided: false,
    quantity: 7,
    running_total: 22,
    entrymadeby: 'Lukas'
  },
  {
    id: 4,
    date: '2021-10-04',
    supplier: 'Phoenix Pharmacy, 123 Fake Street, London, E1 4AB',
    patient: 'Bob Johnson, 789 Real Street, London, E1 4AB',
    prescriber: 'Dr. Jane Smith (GMC 7654321)',
    collected_by: 'Alice Johnson (wife)',
    id_requested: true,
    id_provided: true,
    quantity: 3,
    running_total: 25,
    entrymadeby: 'Lukas'
  }
]

const dummyPatient = [
  {
    id: 1,
    name: 'Jane Smith',
    address: '123 Fake Street, London, E1 4AB',
    dob: '01/01/1970'
  },
  {
    id: 2,
    name: 'John Doe',
    address: '456 Real Street, London, E1 4AB',
    dob: '01/01/1970'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    address: '789 Real Street, London, E1 4AB',
    dob: '01/01/1970'
  },
  {
    id: 4,
    name: 'Bob Johnson',
    address: '789 Real Street, London, E1 4AB',
    dob: '01/01/1970'
  }
]

const dummyPrescribers = [
  {
    id: 1,
    name: 'Dr. John Doe',
    registration: 'GMC 1234567'
  },
  {
    id: 2,
    name: 'Dr. Jane Smith',
    registration: 'GMC 7654321'
  },
  {
    id: 3,
    name: 'Dr. Bob Johnson',
    registration: 'GMC 1234567'
  },
  {
    id: 4,
    name: 'Dr. Alice Johnson',
    registration: 'GMC 7654321'
  }
]

const dummySuppliers = [
  {
    id: 1,
    name: 'Phoenix Pharmacy',
    address: '123 Fake Street, London, E1 4AB'
  },
  {
    id: 2,
    name: 'Boots Pharmacy',
    address: '456 Real Street, London, E1 4AB'
  },
  {
    id: 3,
    name: 'Lloyds Pharmacy',
    address: '789 Real Street, London, E1 4AB'
  },
  {
    id: 4,
    name: 'Superdrug Pharmacy',
    address: '789 Real Street, London, E1 4AB'
  }
]

const dummyCollectors = [
  {
    id: 1,
    name: 'Anne Smith',
    relationship: 'sister'
  },
  {
    id: 2,
    name: 'John Smith',
    relationship: 'brother'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    relationship: 'husband'
  },
  {
    id: 4,
    name: 'Alice Johnson',
    relationship: 'wife'
  }
]

// This will create a random color avatar if no avatar exists
const renderClient = params => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]

  if (row?.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {
    const name = row.receiving ? row.patient.split(',')[0] : row.supplier.split(',')[0]
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}>
        {getInitials(name)}
      </CustomAvatar>
    )
  }
}

// Status object represents the status of ID Requested or Provided
const statusObj = {
  true: { title: 'Yes', color: 'success' },
  false: { title: 'No', color: 'error' }
}

const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const renderDetails = params => {
  const { row } = params
  if (row.receiving) {
    const name = row.patient ? row.patient.split(',')[0] : ''
    const address = row.patient ? row.patient.split(',')[1] : 'No address provided'
    const registration = row.prescriber_registration || 'No registration provided'

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography noWrap variant='caption'>
          {address}
        </Typography>
        <Typography noWrap variant='caption'>
          {registration}
        </Typography>
      </Box>
    )
  } else {
    const supplier = row.supplier ? row.supplier.split(',')[0] : 'No supplier'
    const supplierAddress = row.supplier ? row.supplier.split(',')[1] : 'No address provided'

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {supplier}
        </Typography>
        <Typography noWrap variant='caption'>
          {supplierAddress}
        </Typography>
      </Box>
    )
  }
}

const isNewRow = id => id === 'new'

const getRowClassName = params => {
  return isNewRow(params.id) ? 'new-row-cell' : ''
}

const TableColumns = ({ entries, isSupply, setIsSupply }) => {
  // ** States
  const [data, setData] = useState([...testData, createEmptyRow()])
  const [pageSize, setPageSize] = useState(7)
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [page, setPage] = useState(0)
  const [selectedCell, setSelectedCell] = useState(null)
  const [openEntryDialog, setOpenEntryDialog] = useState(false)
  const [scrollDialog, setScrollDialog] = useState('paper')
  const [openEditDrawer, setOpenEditDrawer] = useState(false)
  const [currentData, setCurrentData] = useState(null) // Data to display in the dialog
  const [editData, setEditData] = useState(null) // Data to edit in the drawer
  const [currentTitle, setCurrentTitle] = useState(null) // Title of the dialog
  const [currentDataSearchTerm, setCurrentDataSearchTerm] = useState('')

  const filteredCurrentData = currentDataSearchTerm
    ? currentData.filter(item => item.name.toLowerCase().includes(currentDataSearchTerm.toLowerCase()))
    : currentData

  // ** Ref
  const scrollDialogElementRef = useRef(null)

  const handleEntryDialogOpen = scrollType => () => {
    setOpenEntryDialog(true)
    setScrollDialog(scrollType)
  }

  const handleEditDrawerOpen = item => {
    setEditData(item)
    setOpenEditDrawer(true)
  }

  const handleSelectCurrentItem = item => {
    // Logic to update the DataGrid's data with the selected item
    const updatedData = data.map(row => {
      if (row.id === selectedCell.id) {
        return { ...row, [selectedCell.field]: item.name }
      }
      return row
    })

    setData(updatedData)
    setOpenEntryDialog(false)
  }

  // Function to handle removal of selected value
  const handleRemoveCurrentItem = () => {
    const updatedData = data.map(row => {
      if (row.id === 'new') {
        return { ...row, [selectedCell.field]: '' } // Clears the value for the selected column
      }
      return row
    })

    setData(updatedData)
    setOpenEntryDialog(false)
  }

  const handleEditDrawerClose = () => {
    setOpenEditDrawer(false)
  }

  const handleEntryDialogClose = () => {
    setOpenEntryDialog(false)
  }

  useEffect(() => {
    if (openEntryDialog) {
      const { current: scrollDialogElement } = scrollDialogElementRef
      if (scrollDialogElement !== null) {
        scrollDialogElement.scrollTop = 0
      }
    }
  }, [openEntryDialog])

  // Add a new state to track the last entry type
  const [lastEntryType, setLastEntryType] = useState('default')

  useEffect(() => {
    // Find the new row
    const newRow = data.find(row => row.id === 'new')

    if (newRow) {
      // Determine the current entry type
      const currentEntryType = newRow.supplier
        ? true
        : newRow.patient || newRow.prescriber || newRow.collected_by
        ? false
        : 'default'

      setIsSupply(currentEntryType)

      // Check if the entry type has changed
      if (currentEntryType !== lastEntryType) {
        // Reset the quantity and running total if the entry type changed to default
        if (currentEntryType === 'default') {
          const updatedRow = { ...newRow, quantity: '', running_total: '' }
          setData(prevData => prevData.map(row => (row.id === 'new' ? updatedRow : row)))
        }

        // Update the last entry type
        setLastEntryType(currentEntryType)
      }
    }
  }, [data, lastEntryType])

  const getCellClassName = params => {
    let classNames = params.row.id === 'new' ? 'new-cells' : ''

    // Exclude certain fields from being disabled
    const excludeFields = ['date', 'entrymadeby', 'running_total', 'quantity']

    if (params.row.id === 'new' && !excludeFields.includes(params.field)) {
      const disableCondition =
        (isSupply === true && params.field !== 'supplier') || (isSupply === false && params.field === 'supplier')

      if (disableCondition) classNames += ' disabled-cell'
    }

    // Add selected cell class
    if (selectedCell && selectedCell.id === params.id && selectedCell.field === params.field) {
      classNames += ' selected-cell'
    }

    return classNames.trim()
  }

  const columns = [
    {
      flex: 0.2,
      minWidth: 100,
      field: 'date',
      headerName: 'Date',
      cellClassName: getCellClassName,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {new Date(params.row.date).toLocaleDateString()}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'supplier',
      cellClassName: getCellClassName,
      headerName: 'Supplier',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.supplier || '-'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'patient',
      cellClassName: getCellClassName,
      headerName: 'Patient',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.patient || '-'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'prescriber',
      cellClassName: getCellClassName,
      headerName: 'Prescriber',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.prescriber || '-'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      cellClassName: getCellClassName,
      headerName: 'Collected By',
      field: 'collected_by',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {`${params.row.collected_by || '-'}`}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      cellClassName: getCellClassName,
      headerName: <GridHeader>ID requested / provided</GridHeader>,
      field: 'id_requested',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.id_requested !== null
            ? `${params.row.id_requested ? 'Yes' : 'No'} / ${params.row.id_provided ? 'Yes' : 'No'}`
            : '-'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'quantity',
      cellClassName: getCellClassName,
      headerName: 'Quantity',
      type: 'number',
      editable: true,
      align: 'left',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.quantity}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,

      field: 'running_total',
      headerName: 'Total',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.running_total}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      cellClassName: getCellClassName,
      field: 'entrymadeby',
      headerName: 'Entered By',
      editable: true,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.entrymadeby}
        </Typography>
      )
    }
  ]

  const handleCellClick = params => {
    const { field, row, id } = params

    if (field === 'quantity' || field === 'running_total' || field === 'entrymadeby') {
      setSelectedCell({ id, field })
      return
    }
    // Check if the clicked row is the new row
    if (row.id === 'new') {
      // Logic for when a cell in the new row is clicked
      setSelectedCell({ id, field })
      const data =
        field === 'patient'
          ? dummyPatient
          : field === 'prescriber'
          ? dummyPrescribers
          : field === 'supplier'
          ? dummySuppliers
          : field === 'collected_by'
          ? dummyCollectors
          : null
      setCurrentData(data)
      setCurrentTitle(field)
      console.log('New row clicked', field, id)
      setOpenEntryDialog(true)
      // if (field === 'columnName') {
      //   // Perform actions specific to this column in the new row
      //   showAppropriateForm(field, row);
      // }
    }
  }

  // Function to calculate running total
  const calculateRunningTotal = (row, isAddition) => {
    const prevTotal = row.id === 'new' ? getLastRunningTotal() : row.running_total
    return isAddition ? prevTotal + parseInt(row.quantity, 10) : prevTotal - parseInt(row.quantity, 10)
  }

  // Function to get the last running total from the data
  const getLastRunningTotal = () => {
    const lastRow = data[data.length - 2] // Assuming the last row is the new empty row
    return lastRow ? lastRow.running_total : 0
  }

  const handleCellEditCommit = params => {
    let updatedData = data.map(row => {
      if (row.id === params.id) {
        const newRow = { ...row, [params.field]: params.value }

        // Calculate running total if necessary
        if (params.field === 'quantity') {
          newRow.running_total = calculateRunningTotal(newRow, isSupply)
        }

        return newRow
      }
      return row
    })

    setData(updatedData)
  }

  useEffect(() => {
    setData([...testData, createEmptyRow()])
    setPage(Math.ceil(entries?.length + 1 / pageSize) - 1)
  }, [entries, pageSize])

  const handleSearch = searchValue => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')

    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        // @ts-ignore
        return searchRegex.test(row[field].toString())
      })
    })
    if (searchValue.length) {
      setFilteredData(filteredRows)
    } else {
      setFilteredData([])
    }
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant='h6' component='div' gutterBottom>
          Preparing table...
        </Typography>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader title='Quick Filter' />
      <DataGrid
        autoHeight
        headerHeight={86}
        columns={columns}
        onCellClick={handleCellClick}
        isCellEditable={params => params.row.id === 'new' && isSupply != 'default'}
        pageSize={pageSize}
        page={page}
        onCellEditCommit={handleCellEditCommit}
        onPageChange={newPage => setPage(newPage)}
        getRowHeight={() => 'auto'}
        rowsPerPageOptions={[7, 10, 25, 50]}
        components={{ Toolbar: QuickSearchToolbar }}
        rows={filteredData.length ? filteredData : data}
        disableSelectionOnClick
        getRowClassName={getRowClassName}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
        componentsProps={{
          baseButton: {
            variant: 'outlined'
          },
          toolbar: {
            value: searchText,
            clearSearch: () => handleSearch(''),
            onChange: event => handleSearch(event.target.value)
          }
        }}
      />
      <Dialog
        open={openEntryDialog}
        scroll={scrollDialog}
        onClose={handleEntryDialogClose}
        aria-labelledby='scroll-dialog-title'
        aria-describedby='scroll-dialog-description'
      >
        <DialogTitle id='scroll-dialog-title'>
          {currentTitle}
          <TextField
            value={currentDataSearchTerm}
            onChange={e => setCurrentDataSearchTerm(e.target.value)}
            label='Search'
            variant='outlined'
            fullWidth
            margin='normal'
          />
        </DialogTitle>
        <DialogContent
          dividers={scroll === 'paper'}
          sx={{
            height: '400px', // Set a fixed height
            overflowY: 'auto' // Enable vertical scrolling
          }}
        >
          <DialogContentText id='scroll-dialog-description' ref={scrollDialogElementRef} tabIndex={-1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCurrentData?.length &&
                    filteredCurrentData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleSelectCurrentItem(item)}>Select</Button>
                          <Button onClick={() => handleEditDrawerOpen(item)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {selectedCell && data.find(row => row.id === 'new')[selectedCell.field] && (
              <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {`Current value: ${data.find(row => row.id === 'new')[selectedCell.field]}`}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{}}>
          {selectedCell && data.find(row => row.id === 'new')[selectedCell.field] && (
            <Button onClick={handleRemoveCurrentItem}>Remove</Button>
          )}
          <Button onClick={handleEntryDialogClose}>Cancel</Button>
          <Button onClick={() => handleEditDrawerOpen('new')}>Add New</Button>
        </DialogActions>
      </Dialog>
      <Drawer
        sx={{ zIndex: theme => theme.zIndex.modal + 1 }}
        anchor='right'
        open={openEditDrawer}
        onClose={handleEditDrawerClose}
      >
        <Box sx={{ width: 400 }}>
          <CardHeader title='Edit Entry' />
        </Box>
      </Drawer>
    </Card>
  )
}

export default TableColumns
