"use client";

import { LinkIcon } from "lucide-react";
import SignupImage from "@/assets/test.jpg";
import StarIcon from "@/assets/star.svg";
import AddImage from "@/assets/addIcon.svg";
import RegisterForm from "@/features/auth/components/registerForm";
import GoogleIcon from "@/assets/googleIcon.svg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SuccessNotification from "@/components/successNotification";

export default function Register() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegistrationSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white">
      {/* Left Side - Form Section */}
      <div className="flex flex-1 items-center justify-center bg-blackShade px-4 py-8 lg:px-8">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Logo/Icon */}
          <div className="p-3 rounded-lg flex items-center justify-center bg-accent mx-auto w-fit mb-8 lg:mb-10">
            <LinkIcon className="size-8 sm:size-10 lg:size-12" />
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => router.push("/api/auth/google")}
            className="w-full p-3 sm:p-4 flex justify-center items-center gap-2 bg-black hover:bg-gray-500 transition-colors rounded-lg mb-6 cursor-pointer text-sm sm:text-base"
          >
            <GoogleIcon className="size-4 sm:size-5" />
            <span>Log in with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 lg:my-7">
            <span className="h-px w-full block bg-gray-500" />
            <span className="text-gray-400 shrink-0 text-sm sm:text-base">
              OR
            </span>
            <span className="h-px w-full block bg-gray-500" />
          </div>

          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-2">
              Join Shrinkr to start shortening your URLs today.
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm onSuccess={handleRegistrationSuccess} />

          {/* Login Link */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 mt-6 text-center">
            <span className="text-gray-400 text-sm sm:text-base lg:text-lg">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="text-sm sm:text-base lg:text-lg text-blue-600 hover:underline visited:text-purple-600 font-medium"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration Section */}
      <div className="flex-1 hidden lg:block bg-darkGreen relative min-h-[400px] lg:min-h-screen">
        <div className="relative h-full overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-8 xl:-top-16 -left-8 xl:-left-16 w-60 xl:w-80 h-60 xl:h-80 rounded-full opacity-5 bg-[#10a4b0]"></div>
            <div className="absolute top-1/4 -right-12 xl:-right-24 w-72 xl:w-96 h-72 xl:h-96 rounded-full opacity-5 bg-[#aedde5]"></div>
            <div className="absolute bottom-0 left-1/4 w-48 xl:w-64 h-48 xl:h-64 rounded-full opacity-15 bg-[#406d71]"></div>
          </div>

          {/* Main Content */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative">
              {/* Main Image */}
              <div className="relative w-72 xl:w-96 h-72 xl:h-96 rounded-2xl xl:rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={SignupImage || "/placeholder.svg"}
                  alt="Sign up illustration"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 xl:-top-8 -right-4 xl:-right-8 w-20 xl:w-28 h-16 xl:h-20 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-sm xl:text-lg font-bold text-[#10a4b0]">
                    Free
                  </div>
                  <div className="text-xs text-gray-300">Forever</div>
                </div>
              </div>

              <div className="absolute -bottom-4 xl:-bottom-8 -left-4 xl:-left-8 w-24 xl:w-32 h-18 xl:h-24 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-lg xl:text-xl font-bold">∞</div>
                  <div className="text-xs text-gray-300">Unlimited links</div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 xl:-right-12 w-16 xl:w-20 h-16 xl:h-20 bg-black rounded-full shadow-lg flex items-center justify-center transform -translate-y-1/2 hover:scale-110 transition-transform duration-300">
                <StarIcon className="size-6 xl:size-10" />
              </div>

              <div className="absolute top-1/4 -left-6 xl:-left-10 w-20 xl:w-24 h-12 xl:h-16 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-xs xl:text-sm font-bold text-accent">
                    QR codes
                  </div>
                  <div className="text-xs text-gray-400">Included</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Decorative Elements */}
          <div className="absolute top-12 xl:top-16 right-12 xl:right-20 w-8 xl:w-14 h-8 xl:h-14 transform rotate-45 opacity-20 animate-pulse bg-[#964834]"></div>

          <div className="absolute bottom-1/3 left-12 xl:left-20">
            <div className="flex space-x-2 animate-bounce transform relative">
              <div className="absolute opacity-20 size-4 xl:size-6 -left-2 bg-accent"></div>
              <div className="size-4 xl:size-6 opacity-20 bg-[#964834]"></div>
            </div>
          </div>

          <div className="absolute top-1/3 left-8 xl:left-16">
            <div className="space-y-2">
              {[12, 16, 20, 24, 28].map((width, idx) => (
                <div
                  key={width}
                  className="h-1 rounded-full opacity-40 animate-pulse"
                  style={{
                    animationDelay: `${0.1 * (idx + 1)}s`,
                    backgroundColor: "var(--accent)",
                    width: `${width}px`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-1/4 right-8 xl:right-16">
            <div className="grid grid-cols-2 gap-2">
              {[0, 0.2, 0.4, 0.6].map((delay, idx) => (
                <div
                  key={idx}
                  className="size-2 rounded-full opacity-40 animate-pulse"
                  style={{
                    animationDelay: `${delay}s`,
                    backgroundColor: "var(--accent)",
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="absolute top-2/3 right-1/4">
            <div className="text-[#aedde5] opacity-60">
              <AddImage />
            </div>
          </div>

          <div className="absolute top-1/16 left-1/3">
            <div className="size-6 xl:size-8 rounded-full border-2 opacity-10 animate-spin bg-[#fcba03]"></div>
          </div>

          <div className="absolute bottom-1/6 right-1/3">
            <div className="relative">
              <StarIcon className="size-4 xl:size-6 absolute top-0 left-0 opacity-20 animate-pulse" />
            </div>
          </div>

          <div className="absolute top-1/6 right-1/3">
            <div className="relative">
              <StarIcon className="size-6 xl:size-8 absolute top-0 left-10 opacity-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <SuccessNotification
        show={showSuccess}
        message="Registration successful! Welcome to Shrinkr!"
      />
    </div>
  );
}
