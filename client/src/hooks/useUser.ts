import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/services/user";
import emailService from "@/services/email";
import type { Credentials, RegisterUser, UserReturned } from "@/types/userTypes";
import persistentUserService from "@/services/persistentUser";


interface useUserOutput {
    User: UserReturned | null;
    isPending: boolean;
    create_email: (credentials: RegisterUser) => void;
    login_email: (credentials: Credentials) => void;
    delete_user: () => void;
}

const useUser = (): useUserOutput => {
    const queryClient = useQueryClient();

    const result = useQuery({
        queryKey: ["User"],
        queryFn: () => userService.getUser(),
        refetchOnWindowFocus: false,
        initialData: null,
    });

    const createEmailMutation = useMutation({
        mutationFn: async (credentials: RegisterUser) =>
            await emailService.createAccount(credentials),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["User"] });
        },
    });

    const loginEmailMutation = useMutation({
        mutationFn: async (credentials: Credentials) =>
            await emailService.login(credentials),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["User"] });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async () => {
            await userService.deleteUser();
            persistentUserService.removeUser();
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["User"] })
        },
    });

    return ({
        User: result.data,
        isPending: result.isPending,
        create_email: (credentials: RegisterUser): void =>
            createEmailMutation.mutate(credentials),
        login_email: (credentials: Credentials): void =>
            loginEmailMutation.mutate(credentials),
        delete_user: (): void =>
            deleteUserMutation.mutate(),
    })
}

export default useUser;