// ** React Imports
import { useEffect, useState, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/system'

// ** ThirdParty Components
import axios from 'axios'
import { supabaseOrg } from 'src/configs/supabase'
import Spinner from 'src/@core/components/spinner'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ServerSideToolbar from './ServerSideToolbar'
import EditProductForm from './EditProductForm'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { dummyData } from './dummyData'
import { CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'

// ** renders client column
const renderClient = params => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]
  if (row?.avatar?.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}>
        {getInitials(row.full_name ? row.full_name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const statusObj = {
  1: { title: 'current', color: 'primary' },
  2: { title: 'professional', color: 'success' },
  3: { title: 'rejected', color: 'error' },
  4: { title: 'resigned', color: 'warning' },
  5: { title: 'applied', color: 'info' }
}

function getColumns(setShow, setSelectedRow) {
  return [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'name',
      headerName: 'Name',
      cellClassName: 'clickableCell',
      renderCell: params => {
        const { row } = params

        return (
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation()
              // You may want to set the selected row in your state here
              setSelectedRow(row)
              setShow(true)
            }}
          >
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.name}
              </Typography>
              <Typography noWrap variant='caption'>
                {row.brand}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'Date',
      field: 'date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.date}
        </Typography>
      )
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'price',
      headerName: 'Salary',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.price}
        </Typography>
      )
    },
    {
      flex: 0.125,
      field: 'quantity',
      minWidth: 80,
      headerName: 'Age',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.quantity}
        </Typography>
      )
    },
    {
      flex: 0.175,
      minWidth: 140,
      field: 'status',
      headerName: 'Status',
      sortable: false,
      renderCell: params => {
        const status = statusObj[params.row.status]

        return (
          <CustomChip
            size='small'
            skin='light'
            color={status.color}
            label={status.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    }
  ]
}

function InventoryTable({ page, setPage }) {
  const props = useSelector(state => state.inventorySlice)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('asc')
  const [pageSize, setPageSize] = useState(7)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [show, setShow] = useState(false)
  const [selectedRow, setSelectedRow] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortModel, setSortModel] = useState([])
  function loadServerRows(currentPage, data) {
    return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  }
  const supabase = supabaseOrg
  // console.log('items', initialData)

  const handleSortModelChange = useCallback(newModel => {
    setSortModel(newModel)
    fetchTableData(newModel, searchValue, sortColumn)
  }, [])

  // const fetchTableData = useCallback(async (sortModel, searchValue, sortColumn) => {
  //   try {
  //     // Construct your query based on the sort model, search value, and sort column
  //     const query = supabase
  //       .from('items')
  //       .select('*', { count: 'exact' })
  //       .ilike(sortColumn, `%${searchValue}%`)
  //       .order(sortColumn, { ascending: sortModel[0]?.sort === 'asc' })

  //     // Execute the query to fetch the data
  //     const { data, count, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1)
  //     if (error) {
  //       console.log(error)
  //       return
  //     }

  //     // Update the rows and total state with the fetched data
  //     setRows(data)
  //     setTotal(count)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }, [])

  const handleSearch = value => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  return (
    <Card>
      <CardHeader title='Stock' />

      {show && (
        <EditProductForm
          show={show}
          setShow={setShow}
          row={selectedRow}
          fetchTableData={() => console.log('fetchTableData')}
          sort={sort}
          searchValue={searchValue}
          sortColumn={sortColumn}
        />
      )}
      <Box position='relative'>
        <Box
          display={loading ? 'flex' : 'none'}
          justifyContent='center'
          alignItems='center'
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
          // bgcolor='rgba(255,255,255,0.2)' // Optional: this gives a semi-transparent white background
        >
          <CircularProgress />
        </Box>
        <DataGrid
          autoHeight
          pagination
          rows={props.items}
          rowCount={total}
          columns={getColumns(setShow, setSelectedRow)}
          checkboxSelection
          pageSize={pageSize}
          sortingMode='server'
          paginationMode='server'
          onSortModelChange={handleSortModelChange}
          sortModel={sortModel}
          rowsPerPageOptions={[7, 10, 25, 50]}
          onPageChange={newPage => setPage(newPage)}
          components={{ Toolbar: ServerSideToolbar }}
          onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          onSelectionModelChange={newSelection => {
            setSelectedRow(newSelection)
          }}
          componentsProps={{
            baseButton: {
              variant: 'outlined'
            },
            toolbar: {
              value: searchValue,
              clearSearch: () => handleSearch(''),
              onChange: event => handleSearch(event.target.value),
              setShow: setShow,
              setSelectedRow: setSelectedRow,
              selectedRow: selectedRow,

              sort: sort,
              searchValue: searchValue,
              sortColumn: sortColumn,
              rows: rows
            }
          }}
        />
      </Box>
    </Card>
  )
}

export default InventoryTable
