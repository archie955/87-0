import { useQuery } from "@tanstack/react-query";
import teamService from "@/services/teams";
import type { Teams } from "@/types/teamTypes";

interface UseTeamsResult {
  teams: Teams | null;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

const useTeams = (): UseTeamsResult => {
  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.getTeams,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    teams: teamsQuery.data ?? null,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    retry: () => {
      void teamsQuery.refetch();
    },
  };
};

export default useTeams;
