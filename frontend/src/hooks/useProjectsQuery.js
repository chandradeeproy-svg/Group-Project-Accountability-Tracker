// File: frontend/src/hooks/useProjectsQuery.js (CREATE)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects as getProjectsApi, createProject as createProjectApi } from '../api/projectsApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const PROJECT_QUERY_KEY = ['projects'];

export function useProjects() {
    const { token } = useAuth();
    return useQuery({
        queryKey: PROJECT_QUERY_KEY,
        queryFn: () => getProjectsApi(token),
        enabled: !!token,
    })
}

export function useCreateProjectMutation() {
    const { token } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: ({ name }) => createProjectApi(name, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY }),
                addToast('Project created', 'success');
        },
        onError: (error) => {
            addToast(error.message || 'Failed', 'error');
        }
    })
}