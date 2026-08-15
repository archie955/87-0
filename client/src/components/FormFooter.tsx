import { Box, Typography, Link } from "@mui/material";

interface FormFooterInput {
  login: boolean;
  changeLogin: () => void;
}

const FormFooter = ({ login, changeLogin }: FormFooterInput) => {
  return (
    <Box
      sx={{
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        {login ? "Don't have an account?" : "Already have an account?"}

        <Link
          component="button"
          onClick={changeLogin}
          underline="hover"
          sx={{ ml: 1 }}
        >
          {login ? "Register" : "Login"}
        </Link>
      </Typography>
    </Box>
  );
};

export default FormFooter;
