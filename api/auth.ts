import axios from 'axios';
import axiosInstance from "./axios"

export const login_api = async (email: string, password: string) => {
    try {
        const response = await axiosInstance.post(
            "/auth/login",
            {
                "email": email,
                "password": password
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Login failed');
    }
}
