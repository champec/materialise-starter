// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Step from '@mui/material/Step'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'

// ** Step Components
import StepPersonalInfo from 'src/views/pages/auth/register-multi-steps/StepPersonalInfo'
import StepAccountDetails from 'src/views/pages/auth/register-multi-steps/StepAccountDetails'
import StepBillingDetails from 'src/views/pages/auth/register-multi-steps/StepBillingDetails'
import StepOrganisationDetails from './StepOrganisationDetails'
import StepPersonalDetails from 'src/views/pages/auth/register-multi-steps/StepPersonalInfo'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { useAuth } from 'src/hooks/useAuth'

// ** Custom Component Import
import StepperCustomDot from 'src/views/forms/form-wizard/StepperCustomDot'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import { useEffect } from 'react'

const steps = [
  {
    title: 'Organisation',
    subtitle: 'You Pharmacy Details'
  },
  {
    title: 'Personal',
    subtitle: 'You Personal Details'
  }
  // {
  //   title: 'Billing',
  //   subtitle: 'Payment Details'
  // }
]

const RegisterMultiSteps = () => {
  const authOrg = useOrgAuth()
  const authUser = useAuth()
  // ** States
  const [activeStep, setActiveStep] = useState(authOrg.organisation ? 1 : 0)
  const [loading, setIsLoading] = useState(false)
  console.log('ORG', authOrg, 'USER', authUser)

  // Handle Stepper
  const handleNext = async data => {
    setIsLoading(true)
    setActiveStep(activeStep + 1)
    setIsLoading(false)
  }

  useEffect(() => {
    if (authOrg.organisation) {
      setActiveStep(1)
    } else if (!authOrg.organisation) {
      setActiveStep(0)
    }
  }, [authOrg.organisation])

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return <StepOrganisationDetails handleNext={handleNext} authOrg={authOrg} authUser={authUser} />
      case 1:
        return (
          <StepAccountDetails
            /*handleNext={handleNext}*/ handlePrev={handlePrev}
            authUser={authUser}
            authOrg={authOrg}
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
