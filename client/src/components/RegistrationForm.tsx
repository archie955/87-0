import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ComponentProps, SubmitEvent } from "react";
import { useUserActions } from "@/stores/userStore";
import useField from "@/hooks/useField";
import { useNotificationActions } from "@/stores/notificationStore";
import { useChangeActions } from "@/stores/loginStore";
import type { RegisterUser } from "@/types/userTypes";

const RegistrationForm = ({ className, ...props }: ComponentProps<"div">) => {
  const { create_email } = useUserActions();
  const email = useField("email");
  const display = useField("text");
  const steamDisplay = useField("text");
  const password = useField("password");
  const { changeLogin } = useChangeActions();
  const { setNotification } = useNotificationActions();

  const validateInputs = (email: string, password: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setNotification("Please enter a valid email address.", "error");
      return false;
    }
    if (!password || password.length < 6) {
      setNotification("Password must be at least 6 characters long.", "error");
      return false;
    }
    return true;
  };

  const handleRegister = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const credentials: RegisterUser = {
      username: display.value,
      email: email.value,
      password: password.value,
    };
    if (!validateInputs(credentials.email, credentials.password)) {
      return;
    }

    try {
      await create_email(credentials);

      setNotification("Successfully registered user", "success");
      changeLogin();
    } catch {
      setNotification("Register Failed", "error");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldDescription className="px-6 text-center">
        Creating an account allows us to track your best game.
      </FieldDescription>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={(e) => void handleRegister(e)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome!</h1>
                <p className="text-balance text-muted-foreground">
                  Register an account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="display">Username</FieldLabel>
                <Input
                  id="display"
                  {...display}
                  placeholder="user@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  {...email}
                  placeholder="user@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input id="password" {...password} required />
              </Field>
              <Field>
                <Button type="submit">Register</Button>
              </Field>
            </FieldGroup>
          </form>
          <form
            className="p-6 md:p-8 grid grid-cols-1 gap-4"
            action="/api/steam"
            method="POST"
          >
            <FieldGroup>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="flex align-center justify-center">
                <FieldLabel htmlFor="steamDisplay">Display Name</FieldLabel>
                <Input
                  id="steamDisplay"
                  name="username"
                  {...steamDisplay}
                  placeholder="steam display name"
                  required
                />
              </Field>
              <Field className="grid grid-cols-1 gap-4">
                <Button variant="outline" type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Register with Steam</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={changeLogin}
                  className="ml-1 underline underline-offset-2"
                >
                  Login
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
