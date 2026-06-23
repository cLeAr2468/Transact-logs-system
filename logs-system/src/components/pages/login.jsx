import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image1 from "@/assets/login.png";
import Image2 from "@/assets/nwssu 1.png";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative">

        {/* Background Image */}
        <img
          src={Image1}
          alt="Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-green-900/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-10">

          <img
            src={Image2}
            alt="Logo"
            className="w-28 mb-6"
          />

          <h1 className="text-[24px] font-bold leading-tight">
            NORTHWEST SAMAR STATE UNIVERSITY SAN JORGE CAMPUS
          </h1>

          <p className="mt-3 tracking-widest text-[20px] italic">
            STUDENT AFFAIRS AND SERVICES
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-6">

        <Card className="w-full max-w-md rounded-2xl border border-gray-300 shadow-sm">

          <CardContent className="p-10">

            {/* TITLE */}
            <div className="flex flex-col items-center text-[24px]">

              <img
                src="/user.jpg"
                alt="Login Visual"
                className="w-[70px] h-[70px]  rounded-[100%]"
              />
              <h2 className=" font-bold mb-10">
                Login
              </h2>
            </div>
            {/* EMAIL */}
            <div className="mb-5">

              <label className="text-sm font-medium mb-2 block">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type="email"
                  placeholder="admin@nwssu.edu.ph"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-5">

              <label className="text-sm font-medium mb-2 block">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-10 pr-10 h-11"
                />

                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center space-x-2">

                <Checkbox id="remember" />

                <label
                  htmlFor="remember"
                  className="text-sm"
                >
                  Remember me
                </label>
              </div>

              <button className="text-sm text-green-700 hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* BUTTON */}
            <Button
              className="w-full h-11 bg-green-800 hover:bg-green-900"
              onClick={() => window.location.href = '/dashboard'}
            >
              Login
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
} export default Login;