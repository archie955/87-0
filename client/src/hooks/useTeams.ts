import { useQuery } from "@tanstack/react-query";
import teamService from "../services/teams";
import { Teams } from "../types/teamTypes";

interface useTeamsResult {
  teams: Teams | Record<string, never>;
  isPending: boolean;
}

const useTeams = (): useTeamsResult => {
  const result = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.getTeams,
    refetchOnWindowFocus: false,
    initialData: {},
  });

  return {
    teams: result.data,
    isPending: result.isPending,
  };
};

export default useTeams;
