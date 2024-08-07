// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { format } from 'date-fns'

const CardStatsVertical = props => {
  // ** Props
  const { handleDrugClick, drug, title, color, icon, stats, chipText, trendNumber, trend = 'positive' } = props

  console.log('CDR', { drug })

  return (
    <Card onClick={() => handleDrugClick(drug)} sx={{ cursor: 'pointer', width: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 6, width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {drug.cdr_drugs?.pill_image ? (
            <img
              src={drug.cdr_drugs.pill_image}
              alt={`${drug.drug_brand} pill`}
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
          ) : (
            <CustomAvatar skin='light' variant='rounded' color={color}>
              {icon}
            </CustomAvatar>
          )}
          <Box
            sx={{ display: 'flex', alignItems: 'center', color: trend === 'positive' ? 'success.main' : 'error.main' }}
          >
            <Typography variant='subtitle2' sx={{ color: trend === 'positive' ? 'success.main' : 'error.main' }}>
              {trendNumber}
            </Typography>
            <Icon icon={trend === 'positive' ? 'mdi:chevron-up' : 'mdi:chevron-down'} fontSize='1.25rem' />
          </Box>
        </Box>
        <Typography variant='h6' sx={{ mb: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{`${drug?.drug_strength}`}</span>
            {drug.cdr_drugs?.box_image && (
              <img
                src={drug.cdr_drugs?.box_image}
                alt={`${drug.drug_brand} pill`}
                style={{ width: '48px', height: '48px', objectFit: 'contain', marginLeft: '8px' }}
              />
            )}
          </div>
        </Typography>
        <Typography variant='body2' sx={{ mb: 5 }}>
          {drug?.drug_brand}
        </Typography>
        <CustomChip
          skin='light'
          size='small'
          label={drug.date_modified ? format(new Date(drug.date_modified), 'dd MMM yyyy HH:mm:ss') : 'N/A'}
          color='secondary'
          sx={{ height: 20, fontWeight: 500, fontSize: '0.75rem', alignSelf: 'flex-start', color: 'text.secondary' }}
        />
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
