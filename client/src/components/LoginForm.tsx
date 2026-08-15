import { useUserActions } from "../stores/userStore";
import { useState, SubmitEvent } from "react";
import useField from "../hooks/useField";
import { useNavigate } from "react-router-dom";
import { Button, Box, TextField } from "@mui/material";
import { useNotificationActions } from "../stores/notificationStore";
import { Credentials } from "../types/userTypes";
import AuthCard from "./AuthCard";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useUserActions();
  const navigate = useNavigate();
  const username = useField("text");
  const password = useField("password");
  const { setNotification } = useNotificationActions();

  const handleLogin = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const credentials: Credentials = {
      username: username.value,
      password: password.value,
    };

    try {
      await login(credentials);

      setNotification("Successfully logged in", "success");
      navigate("/leagues");
    } catch {
      setNotification("Login Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Sign In">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        component="form"
        onSubmit={handleLogin}
      >
        <TextField label="Username or Email" fullWidth {...username} />

        <TextField label="Password" fullWidth {...password} />

        <Button type="submit" loading={loading}>
          Login
        </Button>
      </Box>
    </AuthCard>
  );
};

export default LoginForm;
