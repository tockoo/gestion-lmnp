export type RentalType = 'longue-duree' | 'courte-duree';

export interface Depreciation {
  buildingValue: number;       // Valeur amortissable du bâtiment (hors terrain)
  buildingYears: number;       // Durée amortissement bâtiment (25-30 ans)
  furnitureValue: number;      // Valeur du mobilier
  furnitureYears: number;      // Durée amortissement mobilier (5-10 ans)
}

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
  rentalType: RentalType;
  nightlyRate?: number;
  depreciation?: Depreciation;
  icalAirbnbUrl?: string;
  icalBookingUrl?: string;
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

export interface Reservation {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  nightlyRate: number;
  nights: number;
  totalAmount: number;
  platformFees: number;
  cleaningFees: number;
  status: 'confirmee' | 'annulee' | 'terminee';
  platform: 'airbnb' | 'booking' | 'direct' | 'autre';
  notes?: string;
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
  attachmentUrl?: string;
  attachmentName?: string;
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

export const RENTAL_TYPES: Record<RentalType, string> = {
  'longue-duree': 'Longue durée',
  'courte-duree': 'Courte durée (Airbnb)',
};

export const PLATFORM_TYPES: Record<Reservation['platform'], string> = {
  'airbnb': 'Airbnb',
  'booking': 'Booking.com',
  'direct': 'Direct',
  'autre': 'Autre',
};
