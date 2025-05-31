import axiosInstance from "./axios";

export const getMyInfo = async () => {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data; // should be the full user object with role
  } catch (error) {
    console.error("Failed to fetch my info", error);
    return null;
  }
};

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;         // e.g., 1 for admin, 2 for employee
  fullTimer: boolean;
  address: string;
  document?: string;
  salary?: number;
}

export const createUserApi = async (data: CreateUserParams) => {
  try {
    const response = await axiosInstance.post('/user/admin/create', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create user');
  }
};



export const getAllUsers = async () => {
  const response = await axiosInstance.get('/user/admin/all', {
    withCredentials: true, // include if using cookies for auth
  });
  return response.data;
};
