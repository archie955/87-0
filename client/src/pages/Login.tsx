import { useLogin, useChangeActions } from "../stores/loginStore";
import RegistrationForm from "../components/RegistrationForm";
import LoginForm from "../components/LoginForm";
import AuthPage from "../components/AuthPage";
import FormFooter from "../components/FormFooter";

const Login = () => {
  const login = useLogin();
  const { changeLogin } = useChangeActions();

  return (
    <AuthPage>
      {login ? <LoginForm /> : <RegistrationForm />}
      <FormFooter login={login} changeLogin={changeLogin} />
    </AuthPage>
  );
};

export default Login;
