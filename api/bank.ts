// api/bank.ts
import axiosInstance from "./axios";
interface BankDetailsPayload {
  name: string;
  address: string;
  acName: string;
  acNumber: string;
  tax: string;
  userId: number;
  branch: string;                // add branch here
  additionalInformation: string;
}

export const createBankDetails = async (bankDetails: BankDetailsPayload) => {
  try {
    const response = await axiosInstance.post("/bankDetails/create", bankDetails);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create bank details");
  }
};
