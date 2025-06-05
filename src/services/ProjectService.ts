import apiClient from './axiosConfig';

export interface Project {
    id: number;
    name: string;
    address: string;
    status: string;
    imageUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectCreatePayload {
    name: string;
    address: string;
    status: "Aktivan" | "Na čekanju" | "Završen";
    imageUrl?: string;
    notes?: string;
}

export interface ProjectUpdatePayload {
    name?: string;
    address?: string;
    status?: "Aktivan" | "Na čekanju" | "Završen";
    imageUrl?: string;
    removeImage?: boolean;
    notes?: string;
}

export const getProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/api/projects');
    return response.data;
};

export const addProject = async (projectData: ProjectCreatePayload): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/projects', projectData);
    return response.data;
};

export const updateProject = async (projectId: number, projectData: ProjectUpdatePayload): Promise<Project> => {
    const response = await apiClient.put<Project>(`/api/projects/${projectId}`, projectData);
    return response.data;
};

export const deleteProject = async (projectId: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}`);
};