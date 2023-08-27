// ** React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'

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
import debounce from 'lodash/debounce'

// ** RTK imports
import { useSelector, useDispatch } from 'react-redux'
import { setFilters, setSearchTerm, setSort, fetchProducts } from 'src/store/apps/shop/productsSlice'
import { set } from 'nprogress'
import { addCartItem } from 'src/store/apps/shop/cartSlice'

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

function getColumns(setShow, setSelectedRow, addToCart, cart, getCartItem) {
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
        const cartItem = cart.items.find(i => i.product_id === item.id)
        return cartItem ? (
          <QuantityControl item={item} cartItem={cartItem} cart={cart} />
        ) : (
          <Button onClick={() => addToCart(item)}>Add</Button>
        )
      }
    }
  ]
}

function ShopTable({ handleCartClick, setCart, isSaving, isCartChanged, handleSaveCart, ...props }) {
  const productSlice = useSelector(state => state.productsSlice)
  const products = productSlice?.items
  const count = productSlice?.totalCount
  const cart = useSelector(state => state.cartSlice)
  console.log('cart', cart)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('asc')
  const [pageSize, setPageSize] = useState(7)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [show, setShow] = useState(false)
  const [showQC, setShowQC] = useState(false)
  const [selectedRow, setSelectedRow] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      fetchProducts({
        searchTerm: searchValue,
        page: page,
        pageSize: pageSize,
        sort: sortModel[0] ? { field: sortModel[0].field, order: sortModel[0].sort } : null
      })
    )
  }, [page, pageSize, dispatch, searchValue, sortModel])

  const getCartItem = useMemo(() => {
    return item => {
      const cartItems = cart.items
      const open = cartItems.find(i => i.product_id === item.id)
      return !!open
    }
  }, [cart])

  const debouncedHandleSearch = useCallback(
    debounce(search => {
      dispatch(
        fetchProducts({
          searchTerm: search,
          page: 0, // You might want to reset the page to 0 after a new search
          pageSize, // Use the local component state for pageSize
          sort: sortModel[0] ? { field: sortModel[0].field, order: sortModel[0].sort } : null, // Assumes sortModel is an array; use its first item
          filters: {} // No filters for now, but you can extend this in the future
        })
      )
    }, 1000),
    [dispatch, pageSize, sortModel]
  )

  // Dispatch search actions
  const handleSearch = search => {
    setSearchValue(search)
    debouncedHandleSearch(search)
  }

  const addToCart = item => {
    dispatch(addCartItem(item))
  }

  const updateCartItem = (item, quantity) => {
    setCart(prevCart => prevCart.map(i => (i.id === item.id ? { ...i, quantity } : i)))
  }

  const removeCartItem = item => {
    setCart(prevCart => prevCart.filter(i => i.id !== item.id))
  }

  const handleSortModel = newModel => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('name')
    }
  }

  const columns = useMemo(() => getColumns(setShow, setSelectedRow, addToCart, cart, getCartItem), [cart, getCartItem])

  return (
    <Card>
      <Box display='flex' justifyContent='space-between' alignItems='center' padding={1}>
        <CardHeader title='SHOP' />
        <Button
          variant='contained'
          onClick={handleCartClick}
          startIcon={
            <Box display='flex' alignItems='center'>
              <Badge badgeContent={cart.items?.length} sx={{ mr: 2 }} />
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
          fetchTableData={dispatch(fetchProducts)}
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
          rows={products}
          rowCount={count}
          columns={columns}
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
              fetchTableData: dispatch(fetchProducts),
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
