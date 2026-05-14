import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, getProjectById, createProject } from "../api/projectsApi.js";
import { useAuth } from "../auth/AuthContext.jsx";

export function useProjects() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(token),
    enabled: !!token,
  });

  const createProjectMutation = useMutation({
    mutationFn: (name) => createProject(name, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
  };
}

export function useProject(projectId) {
  const { token } = useAuth();

  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProjectById(projectId, token),
    enabled: !!token && !!projectId,
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    isError: projectQuery.isError,
  };
}
