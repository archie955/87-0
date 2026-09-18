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
import useField from "@/hooks/useField";
import { useNotificationActions } from "@/stores/notificationStore";
import { useChangeActions } from "@/stores/loginStore";
import type { RegisterUser } from "@/types/userTypes";
import useUser from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import steamPNG from "@/lib/sits_01.png";

const RegistrationForm = ({ className, ...props }: ComponentProps<"div">) => {
  const { create_email } = useUser();
  const navigate = useNavigate();
  const email = useField("email");
  const username = useField("text");
  const steamUsername = useField("text");
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
      username: username.value,
      email: email.value,
      password: password.value,
    };
    if (!validateInputs(credentials.email, credentials.password)) {
      return;
    }

    try {
      await create_email(credentials);

      setNotification("Successfully registered user", "success");
      await navigate("/");
    } catch {
      setNotification("Registration Failed", "error");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldDescription className="px-6 text-center">
        Creating an account allows us to track your best game. It is advised to
        use Steam to create your account.
      </FieldDescription>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => void handleRegister(e)}
            noValidate
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome!</h1>
                <p className="text-muted-foreground text-balance">
                  Register an account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  {...username}
                  placeholder="username"
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  {...password}
                  placeholder="*****"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" name="email_register">
                  Register
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <form
            className="grid grid-cols-1 gap-4 p-6 md:p-8"
            action="/api/steam"
            method="POST"
          >
            <FieldGroup>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="align-center flex justify-center">
                <FieldLabel htmlFor="username">Steam Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  {...steamUsername}
                  placeholder="username"
                  required
                />
              </Field>
              <Field className="grid grid-cols-1 gap-4">
                <Button
                  className="bg-transparent hover:bg-transparent"
                  type="submit"
                  name="steam_register"
                >
                  <img src={steamPNG} alt={"steam"} />
                  <span className="sr-only">Register with Steam</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={changeLogin}
                  className="ml-1 underline underline-offset-2"
                  name="login"
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
