import AltRegistrationForm from "@/components/AltRegistrationForm";
import AltLoginForm from "@/components/AltLoginForm";
import { useLogin } from "@/stores/loginStore";
import { CardContent } from "@/components/ui/card";
import { useNotificationActions } from "@/stores/notificationStore";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const login = useLogin();
  const { setNotification } = useNotificationActions();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "SteamInvalidCredentialsError") {
      setNotification("Steam login failed. Please try again.", "error");
    } else if (error === "SteamDataAlreadyExistsError") {
      setNotification("That Steam account is already linked.", "error");
    } else if (error) {
      setNotification("Steam login failed.", "error");
    }
  }, [error, setNotification]);

  return (
    <div className="card text-align m-auto flex flex-col items-center">
      <CardContent className="max-w-fit">
        {login ? <AltLoginForm /> : <AltRegistrationForm />}
      </CardContent>
    </div>
  );
};

export default Login;
