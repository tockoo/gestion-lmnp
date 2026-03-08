export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'appartement' | 'maison' | 'studio';
  surface: number;
  acquisitionValue: number;
  acquisitionDate: string;
  taxRegime: 'micro-bic' | 'reel-simplifie';
  monthlyCoproCharges: number;
  annualPropertyTax: number;
}

export interface Tenant {
  id: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entryDate: string;
  exitDate?: string;
  monthlyRentHC: number;
  monthlyCharges: number;
  deposit: number;
  status: 'actif' | 'parti';
}

export interface Receipt {
  id: string;
  tenantId: string;
  propertyId: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  rentHC: number;
  charges: number;
  total: number;
  status: 'paye' | 'impaye' | 'partiel';
  amountReceived: number;
  paidDate?: string;
}

export type ExpenseCategory =
  | 'travaux'
  | 'electricite'
  | 'eau'
  | 'taxe-fonciere'
  | 'copropriete'
  | 'assurance-pno'
  | 'frais-gestion'
  | 'interets-emprunt'
  | 'autres';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  'travaux': 'Travaux / Réparations',
  'electricite': 'EDF / Électricité',
  'eau': 'Eau',
  'taxe-fonciere': 'Taxe foncière',
  'copropriete': 'Charges de copropriété',
  'assurance-pno': 'Assurance PNO',
  'frais-gestion': 'Frais de gestion agence',
  'interets-emprunt': "Intérêts d'emprunt",
  'autres': 'Autres',
};

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  amountTTC: number;
  date: string;
  description: string;
  invoiceRef: string;
  taxDeductible: boolean;
}

export interface Settings {
  ownerName: string;
  activeFiscalYear: number;
}

export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const PROPERTY_TYPES: Record<Property['type'], string> = {
  'appartement': 'Appartement',
  'maison': 'Maison',
  'studio': 'Studio',
};
