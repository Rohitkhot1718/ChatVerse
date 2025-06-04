import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../axios/axiosInstance";
import { toast, Toaster } from "react-hot-toast";
import { Button } from "../components/Button";
import useAuthStore from "../store/authStore";

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const query = new URLSearchParams(window.location.search);
  const token = query.get("token");

  useEffect(() => {
    if (user?.isVerified) {
      navigate("/");
      return;
    }

    if (!token) {
      setVerificationStatus("invalid");
      toast.error("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axiosInstance.get(
          `/auth/verify-email?token=${token}`
        );

        toast.success(response.data.message || "Email verified successfully!");
        setVerificationStatus("success");
      } catch (error) {
        if (error.response?.status === 400) {
          if (error.response?.data?.token) {
            setVerificationStatus("invalid");
            toast.error("Invalid verification link.");
            return;
          }
        }

        toast.error(error.response?.data?.message || "Verification failed.");
        setVerificationStatus("error");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="flex h-svh items-center justify-center mx-auto bg-[#131313ee] lg:bg-gray-300 sm:bg-gray-300 ">
      <div className="w-[400px] p-8 rounded-2xl bg-[#131313ee] text-white shadow-2xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold mb-4">Email Verification</h1>

          {verificationStatus === "pending" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-lg">Verifying your email...</p>
            </>
          )}

          {verificationStatus === "invalid" && (
            <>
              <div className="text-yellow-400 text-6xl mb-4">!</div>
              <h2 className="text-xl font-semibold mb-2">
                Invalid Verification Link
              </h2>
              <p className="text-gray-300 mb-6">
                The verification link is invalid or has expired.
              </p>
              <Button
                onClick={() => navigate("/signin")}
                className="bg-yellow-300 hover:bg-yellow-400 text-black w-full"
              >
                Back to Sign In
              </Button>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h2 className="text-xl font-semibold mb-2">
                Verification Successful!
              </h2>
              <p className="text-gray-300 mb-6">
                Your email has been successfully verified.
              </p>
              <Button
                onClick={() => navigate("/signin")}
                className="bg-[#5ad3b7ce] text-black w-full"
              >
                Sign In
              </Button>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="text-red-400 text-6xl mb-4">×</div>
              <h2 className="text-xl font-semibold mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-300 mb-6">
                We couldn't verify your email. Please try again or contact
                support.
              </p>
              <Button
                onClick={() => navigate("/signin")}
                className="bg-red-300 text-black w-full"
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};
