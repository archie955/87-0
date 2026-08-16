import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

const AuthCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 450,
  padding: theme.spacing(5),
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  gap: theme.spacing(3),
  borderRadius: 20,
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default AuthCard;
