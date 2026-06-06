// ─── T1134 Mock Data ─────────────────────────────────────────────────────────
// 20 foreign affiliates across 5 countries for Northstar Inc.
// Reflects CRA T1134 (2021+) form structure: Part I Summary + Part II Supplement

export type AffiliateTier = 'CFA' | 'NCFA';
export type YesNo = 'Yes' | 'No' | '';

export interface ForeignAffiliate {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: string;
  shortName: string;
  legalName: string;
  country: string;
  countryCode: string;
  flag: string;
  tin: string;                       // Taxpayer ID for Non-Resident
  naicsCodes: string[];
  businessCountries: string[];       // Countries where business carried on
  taxCountries: string[];            // Countries where tax paid
  tier: AffiliateTier;
  firstTimeFiling: YesNo;
  multipleTaxYears: YesNo;
  taxYearFrom: string;
  taxYearTo: string;
  functionalCurrency: string;

  // ── Section 1B — Capital Stock ────────────────────────────────────────────
  directOwnershipPct: number;        // %
  commonSharesACB: number;           // CAD
  acbIncrease: YesNo;
  acbDecrease: YesNo;
  preferredSharesOwnershipPct: number;
  preferredSharesACB: number;
  prefAcbIncrease: YesNo;
  prefAcbDecrease: YesNo;
  isIndirect: boolean;               // indirectly owned through another FA

  // ── Section 1C — Other Information ───────────────────────────────────────
  equityPctBeginning: number;
  equityPctEnd: number;
  debtOwedToFA: number;              // CAD — Northstar owes to FA
  debtOwedToFAOnT106: YesNo;
  debtOwedFromFA: number;            // CAD — FA owes to Northstar
  debtOwedFromFAOnT106: YesNo;
  trackingInterest: YesNo;
  cfaBecauseSS95_11: YesNo;
  cfaBecauseSS95_12: YesNo;
  jointElectionSS91_1_4: YesNo;

  // ── Section 1D — FA Dumping (ss.212.3) ───────────────────────────────────
  faDumping_212_3_2_applied: YesNo;
  faDumping_75pctFMV: YesNo;
  faDumping_businessActivities: YesNo;
  faDumping_corpReorg: YesNo;
  faDumping_filedInfo: YesNo;
  faDumping_deemedDividend: YesNo;
  faDumping_PUCIncrease: YesNo;
  faDumping_preferredShares212_3_19: YesNo;

  // ── Section 2 — Financial Information ────────────────────────────────────
  financialStatementsAvailable: YesNo;
  financialStatementsIncluded: YesNo;
  hasAtLeast20pctVoting: YesNo;

  // ── Section 3A — Surplus Accounts ────────────────────────────────────────
  dividendReceived: YesNo;
  exemptSurplusDividend: number;     // CAD — 🔗 linked to Surplus WS
  hybridSurplusDividend: number;
  taxableSurplusDividend: number;
  preAcquisitionSurplusDividend: number;
  reg5900_2Election: YesNo;
  reg5901_1_1Election: YesNo;
  reg5901_2bElection: YesNo;
  qrocElection: YesNo;
  totalDividendsCash: number;
  totalDividendsStock: number;
  dividendCurrency: string;
  ss93_1_11Transaction: YesNo;
  upstreamLoan_4_1: YesNo;
  upstreamLoan_4_2: YesNo;
  upstreamLoan_4_3: YesNo;
  upstreamLoan_4_4: YesNo;
  upstreamLoan_deduction90_9: YesNo;
  upstreamLoan_90_8_1: YesNo;
  upstreamLoan_90_12: YesNo;

  // ── Section 3B — Surplus & Share Transactions (CFA only) ─────────────────
  ss88_3Liquidation: YesNo;
  ss88_3_1Election: YesNo;
  ss51Exchange: YesNo;
  shareAcquisitionDisposition: YesNo;
  ss91_1_2Applicable: YesNo;
  ss95_2cApplicable: YesNo;
  surplusEntitlementPctChange: YesNo;
  equityPctFAChange: YesNo;
  disposedExcludedProperty: YesNo;
  disposedNonExcludedCapProp: YesNo;
  otherReorgAffectingSurplus: YesNo;

  // ── Part III Section 1 — Employees (CFA only) ────────────────────────────
  employeeCount: '0' | '1-5' | '6-15' | '16-25' | '26-100' | '100+';
  reliesOnSubcontractors: YesNo;

  // ── Part III Section 2 — Revenue Composition (CFA only, CAD thousands) ───
  revInterestNonArmLength: number;
  revInterestArmLength: number;
  revDividendsNonArmLength: number;
  revDividendsArmLength: number;
  revRoyaltiesNonArmLength: number;
  revRoyaltiesArmLength: number;
  revRentalNonArmLength: number;
  revRentalArmLength: number;
  revLoansNonArmLength: number;
  revLoansArmLength: number;
  revInsuranceNonArmLength: number;
  revInsuranceArmLength: number;
  revFactoringNonArmLength: number;
  revFactoringArmLength: number;
  revDispositionsNonArmLength: number;
  revDispositionsArmLength: number;
  revCurrencyCode: string;

  // ── Part III Section 3 — FAPI (CFA only, 🔗 linked to FAPI WS) ───────────
  fapiEarned: YesNo;
  faplIncurred: YesNo;
  faclIncurred: YesNo;
  participatingPct: number;
  fapiAmount: number;                // 🔗 pulled from FAPI worksheet
  faplAmount: number;
  faclAmount: number;
  fapi_a_property: number;
  fapi_b_sale: number;
  fapi_c_insurance: number;
  fapi_d_indebtedness_a3: number;
  fapi_e_indebtedness_a4: number;
  fapi_f_services: number;
  fapi_g_property_l: number;
  fapi_h1_shares: number;
  fapi_h2_other: number;
  fapi_i_descC: number;
  ss95_2_44Election: YesNo;

  // ── Part III Section 4 — ABI Inclusions (CFA only) ───────────────────────
  propertyIncomeInABI: YesNo;
  abi_ss95_2a: YesNo;
  abi_investmentBusiness: YesNo;
  abi_ss95_2l: YesNo;
  otherIncomeInABI: YesNo;
  abi_90pctTest: YesNo;
  abi_ss95_2_3: YesNo;
  abi_ss95_2_4: YesNo;
  abi_ss95_3: YesNo;
  abi_ss95_3_01: YesNo;

  // ── Part IV — Disclosure ──────────────────────────────────────────────────
  infoNotAvailable: YesNo;
  infoNotAvailableDetails: string;

  // ── UI State ──────────────────────────────────────────────────────────────
  completionPct: number;             // 0-100
  flags: string[];                   // validation warnings
  linkedToFapi: boolean;
}

// ─── 20 Foreign Affiliates ───────────────────────────────────────────────────

export const FOREIGN_AFFILIATES: ForeignAffiliate[] = [
  // ── 🇫🇷 France (4) ────────────────────────────────────────────────────────
  {
    id: 'fa-fr-01', shortName: 'SAS Paris', legalName: 'Northstar SAS Paris', country: 'France', countryCode: 'FRA', flag: '🇫🇷',
    tin: 'FR-84-123456789', naicsCodes: ['523110'], businessCountries: ['FRA'], taxCountries: ['FRA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 100, commonSharesACB: 4200000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 1500000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'Yes', exemptSurplusDividend: 320000, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 320000, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '16-25', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 180, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 180000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 180000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 88, flags: ['FAPI > 0: confirm FAPIT entry'], linkedToFapi: true,
  },
  {
    id: 'fa-fr-02', shortName: 'SAS Lyon', legalName: 'Northstar SAS Lyon', country: 'France', countryCode: 'FRA', flag: '🇫🇷',
    tin: 'FR-84-987654321', naicsCodes: ['523110'], businessCountries: ['FRA'], taxCountries: ['FRA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 100, commonSharesACB: 1800000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 500000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 45, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 45000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 45000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 72, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-fr-03', shortName: 'SAS Bordeaux', legalName: 'Northstar SAS Bordeaux', country: 'France', countryCode: 'FRA', flag: '🇫🇷',
    tin: 'FR-84-456789123', naicsCodes: ['551114'], businessCountries: ['FRA', 'BEL'], taxCountries: ['FRA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 75, commonSharesACB: 2100000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 75, equityPctEnd: 75,
    debtOwedToFA: 250000, debtOwedToFAOnT106: 'Yes', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 120, revRoyaltiesArmLength: 80, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 75,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 65, flags: ['Financial statements not included'], linkedToFapi: false,
  },
  {
    id: 'fa-fr-04', shortName: 'SCI Riviera', legalName: 'SCI Riviera Northstar', country: 'France', countryCode: 'FRA', flag: '🇫🇷',
    tin: 'FR-84-321654987', naicsCodes: ['531110'], businessCountries: ['FRA'], taxCountries: ['FRA'],
    tier: 'NCFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 30, commonSharesACB: 890000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 30, equityPctEnd: 30,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'No',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '0', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 95, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 30,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 55, flags: [], linkedToFapi: false,
  },

  // ── 🇩🇪 Germany (4) ───────────────────────────────────────────────────────
  {
    id: 'fa-de-01', shortName: 'GmbH Berlin', legalName: 'Northstar GmbH Berlin', country: 'Germany', countryCode: 'DEU', flag: '🇩🇪',
    tin: 'DE-811234567', naicsCodes: ['523110', '522110'], businessCountries: ['DEU', 'AUT'], taxCountries: ['DEU'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 100, commonSharesACB: 6500000, acbIncrease: 'Yes', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 3200000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'Yes', exemptSurplusDividend: 580000, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 580000, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'Yes', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '26-100', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 320, revInterestArmLength: 150, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 470000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 320000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 150000, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 92, flags: ['ACB increased — confirm capital contribution details'], linkedToFapi: true,
  },
  {
    id: 'fa-de-02', shortName: 'GmbH Munich', legalName: 'Northstar GmbH München', country: 'Germany', countryCode: 'DEU', flag: '🇩🇪',
    tin: 'DE-819876543', naicsCodes: ['523110'], businessCountries: ['DEU'], taxCountries: ['DEU'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 100, commonSharesACB: 3100000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 800000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '16-25', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 80, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 80000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 80000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 80, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-de-03', shortName: 'GmbH Hamburg', legalName: 'Northstar GmbH Hamburg', country: 'Germany', countryCode: 'DEU', flag: '🇩🇪',
    tin: 'DE-812345678', naicsCodes: ['551114'], businessCountries: ['DEU', 'NLD'], taxCountries: ['DEU'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 60, commonSharesACB: 1450000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 60, equityPctEnd: 60,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 60, revRoyaltiesArmLength: 40, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 60,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 70, flags: [], linkedToFapi: false,
  },
  {
    id: 'fa-de-04', shortName: 'AG Frankfurt', legalName: 'Northstar AG Frankfurt', country: 'Germany', countryCode: 'DEU', flag: '🇩🇪',
    tin: 'DE-815678901', naicsCodes: ['522110'], businessCountries: ['DEU', 'CHE'], taxCountries: ['DEU'],
    tier: 'NCFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'EUR',
    directOwnershipPct: 25, commonSharesACB: 2200000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 10, preferredSharesACB: 400000, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 25, equityPctEnd: 25,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'No', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'No',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'EUR',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '0', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'EUR',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 25,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 40, flags: ['Financial statements not available — IRL required'], linkedToFapi: false,
  },

  // ── 🇬🇧 UK (4) ────────────────────────────────────────────────────────────
  {
    id: 'fa-gb-01', shortName: 'Ltd London', legalName: 'Northstar Ltd London', country: 'United Kingdom', countryCode: 'GBR', flag: '🇬🇧',
    tin: 'GB-123456789', naicsCodes: ['523110'], businessCountries: ['GBR'], taxCountries: ['GBR'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'GBP',
    directOwnershipPct: 100, commonSharesACB: 8900000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 4500000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'Yes', exemptSurplusDividend: 920000, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 920000, totalDividendsStock: 0, dividendCurrency: 'GBP',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '26-100', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 450, revInterestArmLength: 200, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'GBP',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 650000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 450000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 200000, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 95, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-gb-02', shortName: 'Ltd Manchester', legalName: 'Northstar Ltd Manchester', country: 'United Kingdom', countryCode: 'GBR', flag: '🇬🇧',
    tin: 'GB-987654321', naicsCodes: ['523110'], businessCountries: ['GBR'], taxCountries: ['GBR'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'GBP',
    directOwnershipPct: 100, commonSharesACB: 2300000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 600000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'GBP',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 60, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'GBP',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 60000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 60000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 78, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-gb-03', shortName: 'Ltd Edinburgh', legalName: 'Northstar Ltd Edinburgh', country: 'United Kingdom', countryCode: 'GBR', flag: '🇬🇧',
    tin: 'GB-456789123', naicsCodes: ['551114'], businessCountries: ['GBR'], taxCountries: ['GBR'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'GBP',
    directOwnershipPct: 80, commonSharesACB: 1700000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 80, equityPctEnd: 80,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'GBP',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'GBP',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 80,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 68, flags: [], linkedToFapi: false,
  },
  {
    id: 'fa-gb-04', shortName: 'LLP Bristol', legalName: 'Northstar LLP Bristol', country: 'United Kingdom', countryCode: 'GBR', flag: '🇬🇧',
    tin: 'GB-321654987', naicsCodes: ['523110'], businessCountries: ['GBR', 'IRL'], taxCountries: ['GBR'],
    tier: 'NCFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'GBP',
    directOwnershipPct: 40, commonSharesACB: 1100000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 40, equityPctEnd: 40,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'No',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'GBP',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '0', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'GBP',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 40,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 50, flags: [], linkedToFapi: false,
  },

  // ── 🇺🇸 USA (4) ───────────────────────────────────────────────────────────
  {
    id: 'fa-us-01', shortName: 'Inc Delaware', legalName: 'Northstar Inc. Delaware', country: 'United States', countryCode: 'USA', flag: '🇺🇸',
    tin: 'US-EIN-12-3456789', naicsCodes: ['523110', '522110'], businessCountries: ['USA'], taxCountries: ['USA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'USD',
    directOwnershipPct: 100, commonSharesACB: 12500000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 7800000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'Yes', exemptSurplusDividend: 0, hybridSurplusDividend: 1200000, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 1200000, totalDividendsStock: 0, dividendCurrency: 'USD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'Yes', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '100+', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 780, revInterestArmLength: 420, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'USD',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 1200000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 780000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 420000, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 90, flags: ['Upstream loan arrangement — confirm ss.90(6) application'], linkedToFapi: true,
  },
  {
    id: 'fa-us-02', shortName: 'Inc California', legalName: 'Northstar Inc. California', country: 'United States', countryCode: 'USA', flag: '🇺🇸',
    tin: 'US-EIN-98-7654321', naicsCodes: ['523110'], businessCountries: ['USA'], taxCountries: ['USA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'USD',
    directOwnershipPct: 100, commonSharesACB: 5400000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 2100000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'USD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '26-100', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 210, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'USD',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 210000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 210000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 82, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-us-03', shortName: 'LLC Texas', legalName: 'Northstar LLC Texas', country: 'United States', countryCode: 'USA', flag: '🇺🇸',
    tin: 'US-EIN-45-6789012', naicsCodes: ['531110'], businessCountries: ['USA'], taxCountries: ['USA'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'USD',
    directOwnershipPct: 55, commonSharesACB: 3800000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 55, equityPctEnd: 55,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'USD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '16-25', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 380, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'USD',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 55,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 75, flags: [], linkedToFapi: false,
  },
  {
    id: 'fa-us-04', shortName: 'Corp New York', legalName: 'Northstar Corp New York', country: 'United States', countryCode: 'USA', flag: '🇺🇸',
    tin: 'US-EIN-78-9012345', naicsCodes: ['522110'], businessCountries: ['USA'], taxCountries: ['USA'],
    tier: 'NCFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'USD',
    directOwnershipPct: 20, commonSharesACB: 4100000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 5, preferredSharesACB: 200000, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 20, equityPctEnd: 20,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'USD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '0', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'USD',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 20,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 45, flags: ['Financial statements not included'], linkedToFapi: false,
  },

  // ── 🇸🇬 Singapore (4) ─────────────────────────────────────────────────────
  {
    id: 'fa-sg-01', shortName: 'Pte Singapore I', legalName: 'Northstar Pte. Ltd. Singapore I', country: 'Singapore', countryCode: 'SGP', flag: '🇸🇬',
    tin: 'SG-201234567K', naicsCodes: ['523110'], businessCountries: ['SGP', 'MYS'], taxCountries: ['SGP'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'SGD',
    directOwnershipPct: 100, commonSharesACB: 9200000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 5500000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'Yes', exemptSurplusDividend: 1450000, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 1450000, totalDividendsStock: 0, dividendCurrency: 'SGD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '26-100', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 550, revInterestArmLength: 300, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'SGD',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 850000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 550000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 300000, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 93, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-sg-02', shortName: 'Pte Singapore II', legalName: 'Northstar Pte. Ltd. Singapore II', country: 'Singapore', countryCode: 'SGP', flag: '🇸🇬',
    tin: 'SG-209876543K', naicsCodes: ['523110'], businessCountries: ['SGP'], taxCountries: ['SGP'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'SGD',
    directOwnershipPct: 100, commonSharesACB: 3600000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 100, equityPctEnd: 100,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 1200000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'SGD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '6-15', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 120, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'SGD',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 100,
    fapiAmount: 120000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 120000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 85, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-sg-03', shortName: 'Pte Singapore III', legalName: 'Northstar Pte. Ltd. Singapore III', country: 'Singapore', countryCode: 'SGP', flag: '🇸🇬',
    tin: 'SG-204567890K', naicsCodes: ['551114'], businessCountries: ['SGP', 'IDN', 'THA'], taxCountries: ['SGP'],
    tier: 'CFA', firstTimeFiling: 'No', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'SGD',
    directOwnershipPct: 70, commonSharesACB: 5100000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 70, equityPctEnd: 70,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 2800000, debtOwedFromFAOnT106: 'Yes',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'Yes', financialStatementsIncluded: 'Yes', hasAtLeast20pctVoting: 'Yes',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'SGD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '16-25', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 280, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'SGD',
    fapiEarned: 'Yes', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 70,
    fapiAmount: 196000, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 196000, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 88, flags: [], linkedToFapi: true,
  },
  {
    id: 'fa-sg-04', shortName: 'Pte Singapore IV', legalName: 'Northstar Pte. Ltd. Singapore IV', country: 'Singapore', countryCode: 'SGP', flag: '🇸🇬',
    tin: 'SG-207654321K', naicsCodes: ['523110'], businessCountries: ['SGP'], taxCountries: ['SGP'],
    tier: 'NCFA', firstTimeFiling: 'Yes', multipleTaxYears: 'No', taxYearFrom: '2024-01-01', taxYearTo: '2024-12-31', functionalCurrency: 'SGD',
    directOwnershipPct: 35, commonSharesACB: 1800000, acbIncrease: 'No', acbDecrease: 'No',
    preferredSharesOwnershipPct: 0, preferredSharesACB: 0, prefAcbIncrease: 'No', prefAcbDecrease: 'No', isIndirect: false,
    equityPctBeginning: 35, equityPctEnd: 35,
    debtOwedToFA: 0, debtOwedToFAOnT106: 'No', debtOwedFromFA: 0, debtOwedFromFAOnT106: 'No',
    trackingInterest: 'No', cfaBecauseSS95_11: 'No', cfaBecauseSS95_12: 'No', jointElectionSS91_1_4: 'No',
    faDumping_212_3_2_applied: 'No', faDumping_75pctFMV: 'No', faDumping_businessActivities: 'No', faDumping_corpReorg: 'No',
    faDumping_filedInfo: 'No', faDumping_deemedDividend: 'No', faDumping_PUCIncrease: 'No', faDumping_preferredShares212_3_19: 'No',
    financialStatementsAvailable: 'No', financialStatementsIncluded: 'No', hasAtLeast20pctVoting: 'No',
    dividendReceived: 'No', exemptSurplusDividend: 0, hybridSurplusDividend: 0, taxableSurplusDividend: 0, preAcquisitionSurplusDividend: 0,
    reg5900_2Election: 'No', reg5901_1_1Election: 'No', reg5901_2bElection: 'No', qrocElection: 'No',
    totalDividendsCash: 0, totalDividendsStock: 0, dividendCurrency: 'SGD',
    ss93_1_11Transaction: 'No',
    upstreamLoan_4_1: 'No', upstreamLoan_4_2: 'No', upstreamLoan_4_3: 'No', upstreamLoan_4_4: 'No',
    upstreamLoan_deduction90_9: 'No', upstreamLoan_90_8_1: 'No', upstreamLoan_90_12: 'No',
    ss88_3Liquidation: 'No', ss88_3_1Election: 'No', ss51Exchange: 'No',
    shareAcquisitionDisposition: 'No', ss91_1_2Applicable: 'No', ss95_2cApplicable: 'No',
    surplusEntitlementPctChange: 'No', equityPctFAChange: 'No', disposedExcludedProperty: 'No',
    disposedNonExcludedCapProp: 'No', otherReorgAffectingSurplus: 'No',
    employeeCount: '0', reliesOnSubcontractors: 'No',
    revInterestNonArmLength: 0, revInterestArmLength: 0, revDividendsNonArmLength: 0, revDividendsArmLength: 0,
    revRoyaltiesNonArmLength: 0, revRoyaltiesArmLength: 0, revRentalNonArmLength: 0, revRentalArmLength: 0,
    revLoansNonArmLength: 0, revLoansArmLength: 0, revInsuranceNonArmLength: 0, revInsuranceArmLength: 0,
    revFactoringNonArmLength: 0, revFactoringArmLength: 0, revDispositionsNonArmLength: 0, revDispositionsArmLength: 0, revCurrencyCode: 'SGD',
    fapiEarned: 'No', faplIncurred: 'No', faclIncurred: 'No', participatingPct: 35,
    fapiAmount: 0, faplAmount: 0, faclAmount: 0,
    fapi_a_property: 0, fapi_b_sale: 0, fapi_c_insurance: 0, fapi_d_indebtedness_a3: 0, fapi_e_indebtedness_a4: 0,
    fapi_f_services: 0, fapi_g_property_l: 0, fapi_h1_shares: 0, fapi_h2_other: 0, fapi_i_descC: 0,
    ss95_2_44Election: 'No',
    propertyIncomeInABI: 'No', abi_ss95_2a: 'No', abi_investmentBusiness: 'No', abi_ss95_2l: 'No',
    otherIncomeInABI: 'No', abi_90pctTest: 'No', abi_ss95_2_3: 'No', abi_ss95_2_4: 'No', abi_ss95_3: 'No', abi_ss95_3_01: 'No',
    infoNotAvailable: 'No', infoNotAvailableDetails: '',
    completionPct: 30, flags: ['First-time filing — full review required', 'Financial statements not available'],
    linkedToFapi: false,
  },
];

// ─── Country Groups ───────────────────────────────────────────────────────────
export const COUNTRY_GROUPS = [
  { country: 'France', flag: '🇫🇷', ids: ['fa-fr-01', 'fa-fr-02', 'fa-fr-03', 'fa-fr-04'] },
  { country: 'Germany', flag: '🇩🇪', ids: ['fa-de-01', 'fa-de-02', 'fa-de-03', 'fa-de-04'] },
  { country: 'United Kingdom', flag: '🇬🇧', ids: ['fa-gb-01', 'fa-gb-02', 'fa-gb-03', 'fa-gb-04'] },
  { country: 'United States', flag: '🇺🇸', ids: ['fa-us-01', 'fa-us-02', 'fa-us-03', 'fa-us-04'] },
  { country: 'Singapore', flag: '🇸🇬', ids: ['fa-sg-01', 'fa-sg-02', 'fa-sg-03', 'fa-sg-04'] },
];

// ─── Part I Summary Data ──────────────────────────────────────────────────────
export const PART_I_SUMMARY = {
  reportingEntityName: 'Northstar Inc.',
  businessNumber: '123456789',
  taxationYearFrom: '2024-01-01',
  taxationYearTo: '2024-12-31',
  naicsCode: '523110',
  numberOfSupplements: 20,
  address: '100 King Street West, Suite 5400, Toronto, ON M5X 1C7',
  contactName: 'Sarah Thompson',
  contactTitle: 'VP Tax',
  contactPhone: '416-555-0100',
  signingOfficerName: 'James Northstar',
  signingOfficerTitle: 'CFO',
  signingDate: '',
  isGroupFiling: false,
  relatedGroupMembers: [] as string[],
  ss85Transfer: 'No' as YesNo,
  ss87Amalgamation: 'No' as YesNo,
  ss88WindUp: 'No' as YesNo,
  orgChartUploaded: false,
  dormantAffiliates: [] as string[],
  lowerTierNCFAs: [] as string[],
};

// ─── Sophia IRL Questions ─────────────────────────────────────────────────────
export const SOPHIA_IRL_QUESTIONS = [
  {
    category: 'Ownership & Structure',
    questions: [
      { id: 'irl-01', fa: 'all', text: 'Has Northstar\'s direct ownership percentage in any foreign affiliate changed since December 31, 2023?', priority: 'high' },
      { id: 'irl-02', fa: 'all', text: 'Were any shares of a foreign affiliate acquired or disposed of during the 2024 taxation year?', priority: 'high' },
      { id: 'irl-03', fa: 'all', text: 'Were any new foreign affiliates incorporated, acquired, or first becoming a foreign affiliate during 2024?', priority: 'high' },
      { id: 'irl-04', fa: 'fa-de-01', text: 'GmbH Berlin: The ACB of common shares increased in 2024. Please confirm the nature and amount of the capital contribution.', priority: 'high' },
    ],
  },
  {
    category: 'Loans & Indebtedness',
    questions: [
      { id: 'irl-05', fa: 'all', text: 'Please confirm the balance of any amounts owed by each foreign affiliate to Northstar as at December 31, 2024 (for T106 cross-reference).', priority: 'high' },
      { id: 'irl-06', fa: 'fa-us-01', text: 'Inc Delaware: An upstream loan arrangement was noted. Please confirm whether ss.90(6) applies and provide the loan balance and terms.', priority: 'high' },
      { id: 'irl-07', fa: 'all', text: 'Were any new intercompany loans advanced or repaid during 2024?', priority: 'medium' },
      { id: 'irl-08', fa: 'all', text: 'Were any PLOI elections made under ss.212.3(11) during 2024?', priority: 'medium' },
    ],
  },
  {
    category: 'Dividends & Surplus',
    questions: [
      { id: 'irl-09', fa: 'all', text: 'Were any dividends paid by any foreign affiliate to Northstar or another foreign affiliate during 2024? If yes, please provide the amount, currency, and payment date.', priority: 'high' },
      { id: 'irl-10', fa: 'all', text: 'Please confirm the surplus account balances (exempt, hybrid, taxable) for each foreign affiliate as at December 31, 2024.', priority: 'high' },
      { id: 'irl-11', fa: 'all', text: 'Were any elections made under Reg. 5900(2), Reg. 5901(1.1), or Reg. 5901(2)(b) in respect of any dividend received?', priority: 'medium' },
    ],
  },
  {
    category: 'Transactions & Reorganizations',
    questions: [
      { id: 'irl-12', fa: 'all', text: 'Was any foreign affiliate involved in an amalgamation, wind-up, liquidation, or other corporate reorganization during 2024?', priority: 'high' },
      { id: 'irl-13', fa: 'all', text: 'Were any transactions involving the disposition of capital property (excluded or non-excluded) completed by any foreign affiliate in 2024?', priority: 'medium' },
      { id: 'irl-14', fa: 'all', text: 'Did any foreign affiliate enter into any transactions that may trigger Foreign Affiliate Dumping rules under ss.212.3?', priority: 'medium' },
    ],
  },
  {
    category: 'Financial Statements',
    questions: [
      { id: 'irl-15', fa: 'fa-fr-03', text: 'SAS Bordeaux: Financial statements are available but not yet included. Please provide unconsolidated financial statements for the year ended December 31, 2024.', priority: 'high' },
      { id: 'irl-16', fa: 'fa-de-04', text: 'AG Frankfurt: Financial statements are not yet available. Please advise on expected availability date.', priority: 'high' },
      { id: 'irl-17', fa: 'fa-sg-04', text: 'Pte Singapore IV (first-time filing): Please provide all incorporation documents, share register, and financial statements.', priority: 'high' },
      { id: 'irl-18', fa: 'fa-us-04', text: 'Corp New York: Financial statements are available but not included. Please provide for review.', priority: 'medium' },
      { id: 'irl-19', fa: 'all', text: 'Please confirm the functional currency used for each foreign affiliate\'s financial statements for the 2024 taxation year.', priority: 'low' },
    ],
  },
];
