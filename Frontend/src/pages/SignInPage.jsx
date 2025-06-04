import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuthStore from "../store/authStore.js";
import axiosInstance from "../axios/axiosInstance.js";
import { toast, Toaster } from "react-hot-toast";

export const SignInPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/signin", data);

      if (response?.status === 403) {
        if (response.data.newEmailSent) {
          toast.success(
            "New verification email sent! Please check your inbox.",
            {
              duration: 5000,
              icon: "📧",
            }
          );
        } else if (response.data.hasPendingVerification) {
          toast.error("Please check your email for the verification link", {
            duration: 5000,
            icon: "✉️",
          });
        }
      }

      setUser(response.data.user);
      navigate("/");
      reset();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || "Login error");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-svh items-center justify-center  text-white  bg-[#131313ee] lg:bg-gray-300 sm:bg-gray-300 ">
      <div className="flex flex-col lg:flex-row w-svw max-w-4xl lg:min-h-[400px] sm:min-h-[500px] lg:h-[500px] overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl sm:bg-[#131313ee] lg:bg-[#131313ee]">
        {/* Form Section */}
        <div className="flex flex-col justify-center items-center lg:w-1/2 w-full p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
            Sign In
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 sm:gap-4 lg:gap-6 w-full max-w-xs sm:max-w-sm text-white"
          >
            <Input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid Email format",
                },
              })}
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.email.message}
              </p>
            )}

            <Input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters",
                },
              })}
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.password.message}
              </p>
            )}

            <p className="text-center text-sm sm:text-base">
              <Link
                to="/forgot-password"
                className="text-gray-200 hover:underline"
              >
                Forgot Password?
              </Link>
            </p>

            <Button
              type="submit"
              className="bg-[#5ad3b7ce] text-black cursor-pointer w-full mt-2"
            >
              Submit
            </Button>
            <Toaster />
          </form>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col justify-center items-center lg:w-1/2 w-full p-4 sm:p-6 lg:p-8 mt-10">
          <div className="text-center space-y-3 sm:space-y-4 max-w-md">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Hello, Friend!
            </h1>
            <p className="text-sm sm:text-base lg:text-xl font-medium px-2">
              Enter your personal details and start journey with us
            </p>
            <Button
              onClick={() => navigate("/signup")}
              className="mt-4 w-full sm:w-auto"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
