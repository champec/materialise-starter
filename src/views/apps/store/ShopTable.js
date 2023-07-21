// ** React Imports
import { useEffect, useState, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { Badge, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Button from '@mui/material/Button'

// ** ThirdParty Components
import axios from 'axios'
import { supabaseOrg } from 'src/configs/supabase'
import Spinner from 'src/@core/components/spinner'
import QuantityControl from './QuantityControl'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ShopToolBar from './ShopToolBar'
import EditProductForm from './EditProductForm'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { dummyData } from './dummyData'
import { CircularProgress } from '@mui/material'
import ChangeNotifier from 'src/@core/components/ChangeNotifier'
import { useDispatch } from 'react-redux'
import productsSlice from 'src/store/apps/shop/productsSlice'

export const getStaticProps = async () => {
  const dispatch = useDispatch()
  const { setProducts } = productsSlice.actions
  const { data: products } = await supabase.from('products').select()
  dispatch(setProducts(products))
  return {
    props: {}
  }
}

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

function getColumns(setShow, setSelectedRow, cart, addToCart, updateCartItem, removeCartItem) {
  return [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'name',
      headerName: 'Drug',
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
      headerName: 'Brand',
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
      headerName: 'Price',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.price}
        </Typography>
      )
    },
    {
      flex: 0.125,
      field: 'stock',
      minWidth: 80,
      headerName: 'stock',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.stock}
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
    },
    {
      flex: 0.175,
      minWidth: 140,
      field: 'actions',
      headerName: 'Actions',
      renderCell: params => {
        const item = params.row
        const cartItem = cart.find(i => i.id === item.id)

        return cartItem ? (
          <QuantityControl item={item} cartItem={cartItem} onUpdate={updateCartItem} onRemove={removeCartItem} />
        ) : (
          <Button onClick={() => addToCart(item)}>Add</Button>
        )
      }
    }
  ]
}

function ShopTable({ handleCartClick, cart, setCart, isSaving, isCartChanged, handleSaveCart, products, ...props }) {
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('asc')
  const [pageSize, setPageSize] = useState(7)
  const [rows, setRows] = useState(products || [])
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [show, setShow] = useState(false)
  const [selectedRow, setSelectedRow] = useState([])
  const [loading, setLoading] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(26)
  function loadServerRows(currentPage, data) {
    return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  }

  console.log({ isCartChanged, rows })

  const addToCart = item => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id)

      if (existingItemIndex > -1) {
        // Clone the cart array.
        const newCart = [...prevCart]
        // Increment the quantity of the existing item.
        newCart[existingItemIndex].quantity += 1

        return newCart
      } else {
        // If item isn't in the cart, add it with a quantity of 1.
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }
  useEffect(() => {
    console.log('cart', cart)
  }, [cart])
  const updateCartItem = (item, quantity) => {
    setCart(prevCart => prevCart.map(i => (i.id === item.id ? { ...i, quantity } : i)))
  }

  const removeCartItem = item => {
    setCart(prevCart => prevCart.filter(i => i.id !== item.id))
  }

  const supabase = supabaseOrg

  const fetchTableData = useCallback(
    async (sort, q, column) => {
      setLoading(true)

      let query

      // Add a condition for numeric columns
      if (column === 'date') {
        query = supabase
          .from('items')
          .select('*', { count: 'exact' })
          .order(column, { ascending: sort === 'asc' })
      } else if (column === 'price' || column === 'stock') {
        // Change this condition based on your requirement.
        query = supabase
          .from('items')
          .select('*', { count: 'exact' })
          .order(column, { ascending: sort === 'asc' })
      } else {
        query = supabase
          .from('items')
          .select('*', { count: 'exact' })
          .ilike(column, `%${q}%`)
          .order(column, { ascending: sort === 'asc' })
      }

      const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1)
      console.log(count)
      if (error) {
        setLoading(false)
        console.error('Error fetching data: ', error)
      } else {
        setLoading(false)
        console.log('Data fetched successfully!', data)
        setRows(data)
        setTotal(count)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn)
  }, [fetchTableData, searchValue, sort, sortColumn])

  const handleSortModel = newModel => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      fetchTableData(newModel[0].sort, searchValue, newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('name')
    }
  }

  const handleSearch = value => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  return (
    <Card>
      <Box display='flex' justifyContent='space-between' alignItems='center' padding={1}>
        <CardHeader title='SHOP' />
        <Button
          variant='contained'
          onClick={handleCartClick}
          startIcon={
            <Box display='flex' alignItems='center'>
              <Badge badgeContent={cart?.length} sx={{ mr: 2 }} />
              <Icon icon='mdi:cart' />
            </Box>
          }
        >
          Cart
        </Button>
      </Box>

      {show && (
        <EditProductForm
          show={show}
          setShow={setShow}
          row={selectedRow}
          fetchTableData={fetchTableData}
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
          rows={rows}
          rowCount={total}
          columns={getColumns(setShow, setSelectedRow, cart, addToCart, updateCartItem, removeCartItem)}
          // checkboxSelection
          disableSelectionOnClick
          pageSize={pageSize}
          sortingMode='server'
          paginationMode='server'
          onSortModelChange={handleSortModel}
          rowsPerPageOptions={[7, 10, 25, 50]}
          onPageChange={newPage => setPage(newPage)}
          components={{ Toolbar: ShopToolBar }}
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
              fetchTableData: fetchTableData,
              sort: sort,
              searchValue: searchValue,
              sortColumn: sortColumn,
              rows: rows,
              isSaving: isSaving,
              isCartChanged: isCartChanged,
              handleSaveCart: handleSaveCart
            }
          }}
        />
      </Box>
    </Card>
  )
}

export default ShopTable
