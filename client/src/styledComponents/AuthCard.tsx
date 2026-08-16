import { useUserActions } from "../stores/userStore";
import { useState, SubmitEvent } from "react";
import useField from "../hooks/useField";
import { useNavigate } from "react-router-dom";
import { useNotificationActions } from "../stores/notificationStore";
import { Credentials } from "../types/userTypes";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "./AuthCard.module.css";
import { useChangeActions } from "../stores/loginStore";

const AuthCard = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useUserActions();
  const { changeLogin } = useChangeActions();
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
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text className={classes.subtitle} onClick={changeLogin}>
        Do not have an account yet? <Anchor>Create account</Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder="you@mantine.dev"
          required
          radius="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          radius="md"
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <Anchor component="button" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" radius="md">
          Sign in
        </Button>
      </Paper>
    </Container>
  );
};

export default AuthCard;
