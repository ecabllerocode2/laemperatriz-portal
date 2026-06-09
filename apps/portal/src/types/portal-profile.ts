export type DepositStatus = "none" | "pending" | "approved";

export interface PortalProfileDoc {
  uid: string;
  email: string;
  name: string;
  phone: string;
  postalCode: string;
  depositStatus: DepositStatus;
  depositAmount: number;
  customerId?: string;
  receiptUrl?: string;
  receiptSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
