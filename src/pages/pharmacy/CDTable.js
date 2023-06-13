// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { CircularProgress } from '@mui/material'
import { styled } from '@mui/system'

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

const columns = [
  {
    flex: 0.2,
    minWidth: 100,
    field: 'date',
    headerName: 'Date',
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
    headerName: 'Quantity',
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
    field: 'entrymadeby',
    headerName: 'Entered By',
    renderCell: params => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.entrymadeby}
      </Typography>
    )
  }
]

const TableColumns = ({ entries }) => {
  // ** States
  const [data, setData] = useState(entries)
  const [pageSize, setPageSize] = useState(7)
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [page, setPage] = useState(0)

  useEffect(() => {
    setData(entries)
    setPage(Math.ceil(entries?.length / pageSize) - 1)
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
        pageSize={pageSize}
        page={page}
        onPageChange={newPage => setPage(newPage)}
        getRowHeight={() => 'auto'}
        rowsPerPageOptions={[7, 10, 25, 50]}
        components={{ Toolbar: QuickSearchToolbar }}
        rows={filteredData.length ? filteredData : data}
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
    </Card>
  )
}

export default TableColumns
