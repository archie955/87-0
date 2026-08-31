import RegistrationForm from "@/components/RegistrationForm";
import LoginForm from "@/components/LoginForm";
import { useLogin } from "@/stores/loginStore";
import { CardContent } from "./ui/card";

const AuthCard = () => {
  const login = useLogin();
  return (
    <div className="card">
      <CardContent className="max-w-fit">
        {login ? <LoginForm /> : <RegistrationForm />}
      </CardContent>
    </div>
  );
};

export default AuthCard;
