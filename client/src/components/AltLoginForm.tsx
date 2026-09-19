import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import type { ComponentProps } from "react";
import { useChangeActions } from "@/stores/loginStore";
import steamPNG from "@/lib/sits_01.png";

const AltLoginForm = ({ className, ...props }: ComponentProps<"div">) => {
  const { changeLogin } = useChangeActions();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldDescription className="px-6 text-center">
        Logging into an account allows us to track your best game.
      </FieldDescription>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form
            className="grid grid-cols-1 gap-4 p-6 md:p-8"
            action="/api/steam/login"
            method="GET"
          >
            <FieldGroup>
              <Field className="grid grid-cols-1 gap-4">
                <Button
                  className="bg-transparent hover:bg-transparent"
                  type="submit"
                  name="steam_login"
                >
                  <img src={steamPNG} alt={"steam"} />
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

export default AltLoginForm;
