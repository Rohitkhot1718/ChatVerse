import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";  // <-- Import your custom Input
import axiosInstance from "../axios/axiosInstance";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-svh items-center justify-center mx-auto bg-[#131313ee] lg:bg-gray-300 sm:bg-gray-300 ">
      <div className="w-[400px] p-8 rounded-2xl bg-[#131313ee] text-white shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-400 text-black"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>

      <Toaster />
    </div>
  );
};
