// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Step from '@mui/material/Step'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

// ** Step Components

import OrganisationLoginForm from 'src/views/pages/auth/pharmexsigninwizard/OrganisationLogin'
import UserLoginForm from './UserLogin'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useUserAuth } from 'src/hooks/useAuth'
import { useAuth } from 'src/hooks/useAuth'

// ** Custom Component Import
import StepperCustomDot from 'src/views/forms/form-wizard/StepperCustomDot'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import { useEffect } from 'react'

//** RTK user management */
import { useDispatch, useSelector } from 'react-redux'

const steps = [
  {
    title: 'Personal',
    subtitle: 'You Personal Details'
  },
  {
    title: 'Organisation',
    subtitle: 'You Pharmacy Details'
  }
]

const RegisterMultiSteps = () => {
  const user = useSelector(state => state.user.user)
  const organisaiton = useSelector(state => state.organisation.organisaiton)
  const authOrg = useOrgAuth()
  const authUser = useUserAuth()
  const auth = useAuth()
  // ** States
  const [activeStep, setActiveStep] = useState(user ? 1 : 0)
  const [loading, setIsLoading] = useState(false)
  // console.log('ORG', authOrg, 'USER', authUser, 'AUTH', auth)
  console.log(user)
  console.log(organisaiton)

  // Handle Stepper
  const handleNext = async data => {
    setIsLoading(true)
    setActiveStep(activeStep + 1)
    setIsLoading(false)
  }
  console.log(authOrg.organisation?.id)

  useEffect(() => {
    if (user) {
      setActiveStep(1)
    } else {
      setActiveStep(0)
    }
  }, [user])

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return <UserLoginForm handleNext={handleNext} authOrg={authOrg} authUser={authUser} auth={auth} />
      case 1:
        return (
          <OrganisationLoginForm
            /*handleNext={handleNext}*/ handlePrev={handlePrev}
            authUser={authUser}
            authOrg={authOrg}
            auth={auth}
          />
        )
      // case 2:
      //   return <StepBillingDetails handlePrev={handlePrev} />
      default:
        return null
    }
  }

  const renderContent = () => {
    return getStepContent(activeStep)
  }

  return (
    <>
      <StepperWrapper sx={{ mb: 10 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((step, index) => {
            return (
              <Step key={index}>
                <StepLabel StepIconComponent={StepperCustomDot}>
                  <div className='step-label'>
                    <Typography className='step-number'>{`0${index + 1}`}</Typography>
                    <div>
                      <Typography className='step-title'>{step.title}</Typography>
                      <Typography className='step-subtitle'>{step.subtitle}</Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            )
          })}
        </Stepper>
      </StepperWrapper>
      {renderContent()}
    </>
  )
}

export default RegisterMultiSteps
