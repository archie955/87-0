import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/services/user";
import emailService from "@/services/email";
import type {
  Credentials,
  RegisterUser,
  UpdatedUser,
  UserReturned,
} from "@/types/userTypes";

interface useUserOutput {
  user: UserReturned | null;
  isPending: boolean;
  isError: boolean;
  create_email: (credentials: RegisterUser) => Promise<void>;
  login_email: (credentials: Credentials) => Promise<void>;
  delete_user: () => Promise<void>;
  update_user: (updated_credentials: UpdatedUser) => Promise<void>;
  logout: () => void;
}

const useUser = (): useUserOutput => {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ["user"],
    queryFn: () => userService.getUser(),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const createEmailMutation = useMutation({
    mutationFn: async (credentials: RegisterUser) =>
      await emailService.createAccount(credentials),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const loginEmailMutation = useMutation({
    mutationFn: async (credentials: Credentials) =>
      await emailService.login(credentials),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await userService.deleteUser();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updated_credentials: UpdatedUser) => {
      await userService.updateUser(updated_credentials);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const logoutUser = () => {
    queryClient.setQueryData(["user"], null);
  };

  return {
    user: result.data ?? null,

    isPending: result.isPending,
    isError: result.isError,

    create_email: (credentials: RegisterUser): Promise<void> =>
      createEmailMutation.mutateAsync(credentials),

    login_email: (credentials: Credentials): Promise<void> =>
      loginEmailMutation.mutateAsync(credentials),

    delete_user: (): Promise<void> => deleteUserMutation.mutateAsync(),

    update_user: (updated_credentials: UpdatedUser): Promise<void> =>
      updateUserMutation.mutateAsync(updated_credentials),

    logout: (): void => logoutUser(),
  };
};

export default useUser;
