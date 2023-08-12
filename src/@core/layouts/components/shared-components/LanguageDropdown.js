import React from 'react'
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Avatar } from '@mui/material'

const LanguageDropdown = ({ settings, saveSettings }) => {
  const organisation = useSelector(state => state.organisation.organisation)
  const { avatar_url, organisation_name } = organisation || {}
  const organisationName = organisation_name || null
  const avatarUrl = avatar_url || '/images/avatars/pharmacygeneric.com' // Replace with your placeholder image path

  const { i18n } = useTranslation()
  const { layout } = settings

  const handleLangItemClick = lang => {
    i18n.changeLanguage(lang)
  }

  return (
    <OptionsMenu
      icon={<Avatar alt={organisationName || 'Organisation'} src={avatarUrl} />}
      menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4, minWidth: 130 } } }}
      iconButtonProps={{ color: 'inherit', sx: { ...(layout === 'vertical' ? { mr: 0.75 } : { mx: 0.75 }) } }}
      options={[
        {
          text: organisationName || 'No Organisation',
          menuItemProps: { sx: { py: 2 } }
        }
      ]}
    />
  )
}

export default LanguageDropdown
