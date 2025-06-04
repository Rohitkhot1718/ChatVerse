import { Routes, Route, Navigate } from "react-router";
import {
  HomePage,
  SignInPage,
  SignUpPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./pages";
import useAuthStore from "./store/authStore";
import { Toaster } from "react-hot-toast";

function App() {
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isAuth ? <HomePage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/signup"
          element={isAuth ? <Navigate to={"/"} /> : <SignUpPage />}
        />
        <Route
          path="/signin"
          element={isAuth ? <Navigate to={"/"} /> : <SignInPage />}
        />
        <Route
          path="/verify-email"
          element={isAuth ? <Navigate to={"/"} /> : <VerifyEmailPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/"
          element={isAuth ? <Navigate to={"/"} /> : <ResetPasswordPage />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
