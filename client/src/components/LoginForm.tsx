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
import { useNavigate } from "react-router-dom";
import useField from "@/hooks/useField";
import { useNotificationActions } from "@/stores/notificationStore";
import type { Credentials } from "@/types/userTypes";
import { useChangeActions } from "@/stores/loginStore";
import useUser from "@/hooks/useUser";
import steamPNG from "@/lib/sits_01.png";

const LoginForm = ({ className, ...props }: ComponentProps<"div">) => {
  const { login_email } = useUser();
  const navigate = useNavigate();
  const email = useField("email");
  const password = useField("password");
  const { setNotification } = useNotificationActions();
  const { changeLogin } = useChangeActions();

  const handleLogin = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const credentials: Credentials = {
      username: email.value,
      password: password.value,
    };

    try {
      await login_email(credentials);

      setNotification("Successfully logged in", "success");
      await navigate("/");
    } catch {
      setNotification("Login Failed", "error");
    }
  };

  const handleClick = () => {
    setNotification("This service is not currently available", "warning");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldDescription className="px-6 text-center">
        Logging into an account allows us to track your best game.
      </FieldDescription>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={(e) => void handleLogin(e)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>
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
                  <button
                    type="button"
                    onClick={handleClick}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input id="password" {...password} required />
              </Field>
              <Field>
                <Button type="submit" name="email_login">
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <form
            className="grid grid-cols-1 gap-4 p-6 md:p-8"
            action="/api/steam/login"
            method="GET"
          >
            <FieldGroup>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-1 gap-4">
                <Button className="bg-transparent hover:bg-transparent" type="submit" name="steam_login">
                  <img
                   src={steamPNG} 
                   alt={"steam"}
                  />
                  <span className="sr-only">Login with Steam</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={changeLogin}
                  className="ml-1 underline underline-offset-2"
                  name="register"
                >
                  Register
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
