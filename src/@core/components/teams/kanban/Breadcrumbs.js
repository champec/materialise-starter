import React from 'react'
import Link from 'next/link'
import { Box, Typography, Breadcrumbs as MuiBreadcrumbs } from '@mui/material'

const Breadcrumb = ({ title, breadcrumbItems, t }) => {
  const itemsLength = breadcrumbItems.length

  return (
    <Box display='flex' justifyContent='space-between' alignItems='center' my={2}>
      <Typography variant='h4'>{title}</Typography>

      <MuiBreadcrumbs>
        {breadcrumbItems.map((item, key) =>
          key + 1 === itemsLength ? (
            <Typography color='textPrimary' key={key}>
              {item.title}
            </Typography>
          ) : (
            <Link href={item?.link ?? ''} key={key}>
              {item.title}
            </Link>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  )
}

export default Breadcrumb
