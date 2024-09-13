// ** React Imports
import { useState, useCallback, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/system'
import _ from 'lodash'

// ** ThirdParty Components
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
import dayjs from 'dayjs'

// ** RTK imports

import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts, setSearchTerm } from 'src/store/apps/shop/productsSlice'
import { fetchInventory } from 'src/store/apps/shop/inventorySlice'

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
      sortable: true,
      field: 'name',
      headerName: 'Drug Name and Brand',
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
            {/* {renderClient(params)} */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {`${row.name}, ${row.strength} ${row.form}`}
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
      sortable: true,
      headerName: 'Expiry Date',
      field: 'expiry_date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {dayjs(params.row.expiry_date).format('DD MMM YYYY')}
        </Typography>
      )
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'price',
      sortable: true,
      headerName: 'Drug Price',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.price}
        </Typography>
      )
    },
    {
      flex: 0.125,
      field: 'stock',
      sortable: true,
      minWidth: 80,
      headerName: 'Quantity',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.stock}
        </Typography>
      )
    },
    {
      flex: 0.175,
      minWidth: 140,
      field: 'trade_reason',
      headerName: 'Status & Reason',
      sortable: false,
      renderCell: params => {
        const status = statusObj[params.row.status]
        const reason = params.row.trade_reason
        // console.log('reason', reason)
        return (
          <>
            <CustomChip
              size='small'
              skin='light'
              color={status.color}
              label={status.title}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
            />
            <br />
            {reason &&
              (reason.length > 0 ? (
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', margin: '2px', wordWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  {reason + ' '}
                </Typography>
              ) : (
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  No reason provided
                </Typography>
              ))}
          </>
        )
      }
    }
  ]
}

function InventoryTable({ items }) {
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('asc')
  const [pageSize, setPageSize] = useState(7)
  const [rows, setRows] = useState([])
  // const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [show, setShow] = useState(false)
  const [selectedRow, setSelectedRow] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortModel, setSortModel] = useState([])
  const [searchValue, setSearchValue] = useState('')

  const dispatch = useDispatch()

  const debouncedSearch = useCallback(
    _.debounce(searchTerm => {
      dispatch(
        fetchInventory({
          searchValue: searchTerm
          // ...rest of your arguments
        })
      )
    }, 1000),
    [] // Dependency array
  )

  const handleSortModelChange = useCallback(
    newModel => {
      setSortModel(newModel)
      const sortField = newModel[0]?.field || 'name'
      const sortOrder = newModel[0]?.sort || 'asc'
      dispatch(fetchInventory({ sortModel: newModel, searchValue, sortColumn: sortField, sort: sortOrder }))
    },
    [dispatch, searchValue]
  )

  const handleSearch = event => {
    setSearchValue(event.target.value) // Update the searchValue state immediately with each keystroke
  }
  useEffect(() => {
    if (searchValue) {
      debouncedSearch(searchValue) // Call the debounced search function
    }
  }, [searchValue, debouncedSearch])

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
          rows={items}
          rowCount={total}
          columns={getColumns(setShow, setSelectedRow)}
          checkboxSelection
          pageSize={pageSize}
          sortingMode='server'
          rowsPerPageOptions={[7, 10, 25, 50]}
          onSortModelChange={handleSortModelChange}
          sortModel={sortModel}
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
              clearSearch: () => {
                setSearchValue('')
                dispatch(fetchInventory(''))
              },
              onChange: handleSearch,
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
