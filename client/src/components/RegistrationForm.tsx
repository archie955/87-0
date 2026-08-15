import { useUserActions } from "../stores/userStore";
import useField from "../hooks/useField";
import { useChangeActions } from "../stores/loginStore";
import { useState, SubmitEvent } from "react";
import { Button, Box, TextField } from "@mui/material";
import { useNotificationActions } from "../stores/notificationStore";
import { RegisterUser } from "../types/userTypes";
import AuthCard from "./AuthCard";

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const { create } = useUserActions();
  const username = useField("text");
  const email = useField("text");
  const password = useField("password");
  const { changeLogin } = useChangeActions();
  const { setNotification } = useNotificationActions();

  const handleRegister = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const credentials: RegisterUser = {
      email: email.value,
      username: username.value,
      password: password.value,
    };

    try {
      await create(credentials);

      setNotification("Successfully registered user", "success");
      changeLogin();
    } catch {
      setNotification("Register Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Register">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        component="form"
        onSubmit={handleRegister}
      >
        <TextField label="Email" fullWidth {...email} />

        <TextField label="Username" fullWidth {...username} />

        <TextField label="Password" fullWidth {...password} />

        <Button type="submit" loading={loading}>
          Register
        </Button>
      </Box>
    </AuthCard>
  );
};

export default RegistrationForm;
