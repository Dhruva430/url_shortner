"use client";

import { LinkIcon } from "lucide-react";
import LoginImage from "@/assets/test.jpg";
import GoogleIcon from "@/assets/googleIcon.svg";
import LinkIcon2 from "@/assets/linkIcon.svg";
import Link from "next/link";
import Image from "next/image";
import StarIcon from "@/assets/star.svg";
import LoginForm from "@/features/auth/components/loginForm";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white bg-blackShade">
      {/* Left Column - Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Logo */}
          <div className="p-3 rounded-lg flex items-center justify-center bg-accent mx-auto w-fit mb-6 sm:mb-8 lg:mb-10">
            <LinkIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold ml-2">
              Shrinkr
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Welcome Back!
            </h1>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed">
              Enter to get unlimited access to data & information.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4 my-6 sm:my-8">
            <span className="h-px w-full block bg-gray-500" />
            <span className="text-gray-400 text-sm sm:text-base whitespace-nowrap">
              Or, Login with
            </span>
            <span className="h-px w-full block bg-gray-500" />
          </div>

          {/* Google Login */}
          <button
            onClick={() => router.push("/api/auth/google")}
            className="w-full p-3 sm:p-4 flex justify-center items-center gap-2 sm:gap-3 bg-black hover:bg-gray-800 transition-all duration-200 rounded-lg mb-4 sm:mb-6 cursor-pointer border border-gray-700 hover:border-gray-600 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">
              Log in with Google
            </span>
          </button>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-gray-400 text-sm sm:text-base">
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 hover:underline visited:text-purple-400 text-sm sm:text-base font-medium transition-colors"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Decorative */}
      <div className="relative overflow-hidden flex flex-1 items-center justify-center bg-darkGreen min-h-[50vh] lg:min-h-screen">
        {/* Background Decorative Elements */}
        <div className="absolute -top-10 sm:-top-20 -right-10 sm:-right-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full opacity-20 bg-accent"></div>
        <div className="absolute top-1/3 -left-8 sm:-left-16 w-32 h-32 sm:w-64 sm:h-64 rounded-full opacity-10 bg-accent"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10 bg-accent"></div>

        {/* Main Content */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="relative">
            {/* Main Image */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                className="w-full h-full object-cover"
                width={384}
                height={384}
                src={LoginImage || "/placeholder.svg"}
                alt="Login Background"
                priority
              />
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-16 h-12 sm:w-24 sm:h-16 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-accent">
                  99%
                </div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
            </div>

            <div className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-20 h-14 sm:w-28 sm:h-20 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-white">
                  100k+
                </div>
                <div className="text-xs text-gray-600">Links Created</div>
              </div>
            </div>

            <div className="absolute top-1/2 -left-6 sm:-left-12 w-12 h-12 sm:w-20 sm:h-20 bg-black rounded-full shadow-lg flex items-center justify-center transform -translate-y-1/2 hover:scale-110 transition-transform duration-300">
              <span className="w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-accent" />
            </div>

            <div className="absolute bottom-8 sm:bottom-16 left-1/4 opacity-50">
              <LinkIcon2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* Additional Decorative Elements */}
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-6 h-6 sm:w-12 sm:h-12 transform rotate-45 opacity-20 animate-pulse bg-[#964834]"></div>

        <div className="absolute top-1/2 right-10 sm:right-20">
          <div className="flex space-x-1 sm:space-x-2 animate-bounce transform opacity-30 relative">
            <div className="w-3 h-3 sm:w-6 sm:h-6 bg-[#964834]"></div>
            <div className="absolute w-3 h-3 sm:w-6 sm:h-6 -right-1 -bottom-1 bg-accent"></div>
          </div>
        </div>

        <div className="absolute bottom-1/3 left-8 sm:left-16">
          <div className="space-y-1 sm:space-y-2">
            {[12, 16, 18, 20, 24].map((w, i) => (
              <div
                key={i}
                className="h-1 rounded-full opacity-40 animate-pulse bg-accent"
                style={{
                  width: `${w}px`,
                  animationDelay: `${0.1 * (i + 1)}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute top-1/4 right-8 sm:right-16">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 sm:w-2 sm:h-2 rounded-full opacity-40 animate-pulse bg-accent"
                style={{ transitionDelay: 100 * i + "ms" }}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-1/6 right-1/3">
          <div className="relative">
            <StarIcon className="w-4 h-4 sm:w-6 sm:h-6 opacity-20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
