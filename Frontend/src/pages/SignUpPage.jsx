import { Input } from "../components/Input";
import { Button } from "../components/Button";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axiosInstance from "../axios/axiosInstance.js";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      toast.success(
        "Verification link sent to your email. Please verify before logging in."
      );
      navigate("/signin");
      reset();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || "Login error");
    }
  };

return (
  <div className="flex flex-col lg:flex-row h-svh items-center justify-center mx-auto text-white  bg-[#131313ee] lg:bg-gray-300 sm:bg-gray-300  p-4">
    <div className="flex flex-col lg:flex-row w-full max-w-4xl mx-auto min-h-[400px] sm:min-h-[500px] lg:h-[500px] overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl sm:bg-[#131313ee] lg:bg-[#131313ee]">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center lg:w-1/2 w-full p-4 sm:p-6 lg:p-8 rounded-l-xl sm:rounded-l-2xl">
        <div className="text-center space-y-3 sm:space-y-4 max-w-md">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Welcome Back!</h1>
          <p className="text-sm sm:text-base lg:text-xl font-medium px-2">
            To keep connected with us please login with your personal info.
          </p>
          <Button 
            onClick={() => navigate("/signin")}
            className="mt-4 w-[100%] sm:max-w-sm"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center lg:w-1/2 p-4 sm:p-6 lg:p-8 mt-10">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Create Account</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 sm:gap-4 lg:gap-6 w-[100%] min-w-[90%] sm:max-w-sm text-white"
        >
          <Input
            type="text"
            placeholder="Username"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Minimum 3 characters",
              },
            })}
            className="w-full"
          />
          {errors.username && (
            <p className="text-red-500 text-xs sm:text-sm">{errors.username.message}</p>
          )}
          
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
            <p className="text-red-500 text-xs sm:text-sm">{errors.email.message}</p>
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
            <p className="text-red-500 text-xs sm:text-sm">{errors.password.message}</p>
          )}
          
          <Toaster />
          <Button
            type="submit"
            className="bg-[#5ad3b7ce] text-black cursor-pointer w-full mt-2"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  </div>
);
};
