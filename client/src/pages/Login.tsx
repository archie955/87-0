import { useLogin, useChangeActions } from "@/stores/loginStore";
import RegistrationForm from "@/components/RegistrationForm";
// import LoginForm from "../components/LoginForm";
import AuthPage from "@/components/AuthPage";
import FormFooter from "@/components/FormFooter";
import AppLayout from "@/layout/AppLayout";
import { LoginForm } from "@/components/login-form";

const Login = () => {
  const login = useLogin();
  const { changeLogin } = useChangeActions();

  return (
    <AppLayout>
      <AuthPage>
        {login ? <LoginForm /> : <RegistrationForm />}
        <FormFooter login={login} changeLogin={changeLogin} />
      </AuthPage>
    </AppLayout>
  );
};

export default Login;
