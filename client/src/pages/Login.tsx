import RegistrationForm from "@/components/RegistrationForm";
import LoginForm from "@/components/LoginForm";
import { useLogin } from "@/stores/loginStore";
import { CardContent } from "@/components/ui/card";

const Login = () => {
  const login = useLogin();
  return (
    <div className="card">
      <CardContent className="max-w-fit">
        {login ? <LoginForm /> : <RegistrationForm />}
      </CardContent>
    </div>
  );
};

export default Login;
