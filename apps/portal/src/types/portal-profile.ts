export type DepositStatus = "none" | "pending" | "approved";

export interface ShippingAddressDetail {
  postalCode: string;
  state: string;
  municipality: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
}

export interface PortalProfileDoc {
  uid: string;
  email: string;
  name: string;
  socialAlias?: string;
  phone: string;
  postalCode: string;
  depositStatus: DepositStatus;
  depositAmount: number;
  customerId?: string;
  receiptUrl?: string;
  receiptSubmittedAt?: string;
  shippingAddress?: string | null;
  shippingAddressDetail?: ShippingAddressDetail | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalProfileUpdatePayload {
  name: string;
  socialAlias: string;
  phone: string;
  postalCode: string;
  shippingAddressDetail?: ShippingAddressDetail | null;
}
