import axios from "./axios";

interface CreateProjectPayload {
    name: string;
    budget: string;
    client: string;
    deadline: string;
}

export const createProject = async (data: CreateProjectPayload) => {
    try {
        const response = await axios.post('/project/create', data);
        return response.data;
    } catch (error: any) {
        console.error("API createProject error:", error);
        throw new Error(error?.response?.data?.message || "Failed to create project");
    }
};