import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import useField from "@/hooks/useField";
import { useChangeActions } from "@/stores/loginStore";
import steamPNG from "@/lib/sits_01.png";

const AltRegistrationForm = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const steamUsername = useField("text");
  const { changeLogin } = useChangeActions();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldDescription className="px-6 text-center">
        Creating an account allows us to track your best game.
      </FieldDescription>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form
            className="grid grid-cols-1 gap-4 p-6 md:p-8"
            action="/api/steam"
            method="POST"
          >
            <FieldGroup>
              <Field className="align-center flex justify-center">
                <FieldLabel htmlFor="username">Username</FieldLabel>
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

export default AltRegistrationForm;
