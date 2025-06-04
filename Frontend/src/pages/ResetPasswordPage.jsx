import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "../components/Input"; // your custom Input component
import { Button } from "../components/Button"; // your custom Button component
import axiosInstance from "../axios/axiosInstance";

export const ResetPasswordPage = () => {
  const query = new URLSearchParams(window.location.search);
  const token = query.get("token");
  console.log(token)
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const { password, confirmPassword } = data;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axiosInstance.post(`/auth/reset-password?token=${token}`, {
        password,
      });
      toast.success(res.data.message);
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
      console.log(err)
    }
  };

  return (
    <div className="flex h-svh items-center justify-center mx-auto bg-[#131313ee] lg:bg-gray-300 sm:bg-gray-300 ">
      <div className="w-[400px] p-8 rounded-2xl bg-[#131313ee] text-white shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              className="w-full"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <Input
              type="password"
              placeholder="Re-enter new password"
              className="w-full"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-400 text-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>

      <Toaster />
    </div>
  );
};
