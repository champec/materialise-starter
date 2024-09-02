const drugChoices = [
  {
    drugCode: '41876511000001101',
    drugDescription: 'Ethinylestradiol 20microgram / Desogestrel 150microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41876511000001101'
  },
  {
    drugCode: '41876611000001102',
    drugDescription: 'Ethinylestradiol 20microgram / Gestodene 75microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41876611000001102'
  },
  {
    drugCode: '41876811000001103',
    drugDescription: 'Ethinylestradiol 30microgram / Desogestrel 150microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41876811000001103'
  },
  {
    drugCode: '41876911000001108',
    drugDescription: 'Ethinylestradiol 30microgram / Drospirenone 3mg tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41876911000001108'
  },
  {
    drugCode: '41877011000001107',
    drugDescription: 'Ethinylestradiol 30microgram / Gestodene 75microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41877011000001107'
  },
  {
    drugCode: '41877111000001108',
    drugDescription: 'Ethinylestradiol 30microgram / Levonorgestrel 150microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41877111000001108'
  },
  {
    drugCode: '41877311000001105',
    drugDescription: 'Ethinylestradiol 35microgram / Norethisterone 1mg tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41877311000001105'
  },
  {
    drugCode: '41877411000001103',
    drugDescription: 'Ethinylestradiol 35microgram / Norethisterone 500microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41877411000001103'
  },
  {
    drugCode: '41877611000001100',
    drugDescription: 'Ethinylestradiol 35microgram / Norgestimate 250microgram tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41877611000001100'
  },
  {
    drugCode: '41880111000001102',
    drugDescription: 'Mestranol 50microgram / Norethisterone 1mg tablets',
    drugDose: '1 tablet daily for 21 days, followed by a 7-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41880111000001102'
  },
  {
    drugCode: '41095211000001102',
    drugDescription: 'Drospirenone 3mg / Estetrol 14.2mg tablets',
    drugDose: '1 tablet daily for 24 days, followed by a 4-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41095211000001102'
  },
  {
    drugCode: '22403311000001100',
    drugDescription: 'Estradiol 1.5mg / Nomegestrol 2.5mg tablets',
    drugDose: '1 tablet daily for 24 days, followed by a 4-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '22403311000001100'
  },
  {
    drugCode: '21711311000001107',
    drugDescription: 'Ethinylestradiol 20microgram / Drospirenone 3mg tablets',
    drugDose: '1 tablet daily for 24 days, followed by a 4-day break',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '21711311000001107'
  },
  {
    drugCode: '41874011000001104',
    drugDescription: 'Desogestrel 75microgram tablets',
    drugDose: '1 tablet daily, continuously',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41874011000001104'
  },
  {
    drugCode: '41878811000001100',
    drugDescription: 'Levonorgestrel 30microgram tablets',
    drugDose: '1 tablet daily, continuously',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41878811000001100'
  },
  {
    drugCode: '41880611000001100',
    drugDescription: 'Norethisterone 350microgram tablets',
    drugDose: '1 tablet daily, continuously',
    quantitySupplied: 3,
    medicationSupplyType: 'PGD',
    provisionDate: '2023-06-01',
    patientExemptCode: 'A',
    vpid: '41880611000001100'
  }
]

export default drugChoices
