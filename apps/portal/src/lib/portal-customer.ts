import { apiRequest } from "@/lib/api";
import { auth } from "@/lib/firebase";

interface RegisterCustomerResponse {
  customerId: string;
}

export async function linkPortalCustomer(data: {
  name: string;
  socialAlias: string;
  phone: string;
  confirmPhone: string;
  postalCode: string;
}): Promise<string> {
  const result = await apiRequest<RegisterCustomerResponse>("/api/portal/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  await auth.currentUser?.getIdToken(true);
  return result.customerId;
}
