import React from 'react'
import Link from 'next/link'
import { Card, CardContent, Tooltip, Avatar, LinearProgress, Typography } from '@mui/material'

const CardBox = ({ data }) => {
  return (
    <Card className='task-box'>
      <LinearProgress variant='determinate' value={data.progressValue} />
      <CardContent>
        <div className='float-end ms-2'>{data.date}</div>
        <div className='mb-3'>
          <Link href='#'>{data.id}</Link>
        </div>
        <h5>
          <Link href='#'>{data.title}</Link>
        </h5>
        <Typography variant='body1' color='textSecondary'>
          {data.subtitle}
        </Typography>
        <div className='d-inline-flex team mb-0'>
          <div className='me-3 align-self-center'>Team :</div>
          {data.team.map((member, key) => (
            <Tooltip key={key} title={member.name} placement='top'>
              <Link href='#'>
                {member.img === 'Null' ? (
                  <Avatar className='avatar-xs'>{member.name.charAt(0)}</Avatar>
                ) : (
                  <Avatar className='avatar-xs' src={member.img} alt='member' />
                )}
              </Link>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CardBox
