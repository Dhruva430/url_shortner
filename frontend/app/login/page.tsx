"use client";
import { LinkIcon, XIcon } from "lucide-react";
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
    <div className="min-h-screen flex flex-col md:flex-row ">
      <div className="flex flex-1 items-center justify-center bg-blackShade">
        <div className="w-98 ">
          <div className="p-2 rounded flex items-center justify-center bg-accent mx-auto w-fit my-10">
            <LinkIcon className="size-12" />
            <h1 className="text">Shrinkr</h1>
          </div>
          <h1 className="text-center text-3xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-gray-400 text-[16px] text-center">
            Enter to get unlimited access to data & information.
          </p>

          <LoginForm />

          <div className="flex items-center gap-2 my-7">
            <span className="h-px w-full block bg-gray-500" />
            <span className="text-gray-400 shrink-0">Or, Login with</span>
            <span className="h-px w-full block bg-gray-500" />
          </div>
          <button
            onClick={() => router.push("http://localhost:8080/api/auth/google")}
            className="w-full p-4  flex justify-center gap-2 bg-black hover:bg-gray-500 transition-colors rounded mb-4 cursor-pointer"
          >
            <GoogleIcon className="size-5" />
            Log in with google
          </button>
          <div>
            <div className="flex justify-center gap-4 my-2">
              <span className="text-gray-400 text-[18px]">
                Don't have an account ?
              </span>
              <Link
                href={"/register"}
                className={
                  "text-[18px] text-blue-600 hover:underline visited:text-purple-600 "
                }
              >
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden md:flex flex-1 items-center justify-center bg-darkGreen">
        <div className="absolute -top-20 -right-20 size-96 rounded-full opacity-20 bg-accent"></div>
        <div className="absolute top-1/3 -left-16 size-64 rounded-full opacity-10 bg-accent"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 bg-accent"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="relative w-96 h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                className="w-full h-full object-cover"
                width={384}
                height={384}
                src={LoginImage}
                alt="Login Background"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-[#034951]/20"></div> */}
            </div>
            <div className="absolute -top-8 -left-8 w-24 h-16 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">99%</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-28 h-20 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <div className="text-center">
                <div className="text-lg font-bold">100k+</div>
                <div className="text-xs text-gray-600">Links Created</div>
              </div>
            </div>
            <div className="absolute top-1/2 -left-12 w-20 h-20 bg-black rounded-full shadow-lg flex items-center justify-center transform -translate-y-1/2 hover:scale-110 transition-transform duration-300">
              <span className="size-8 rounded-full opacity-100 bg-accent" />
            </div>
            <div className="absolute bottom-16 left-1/4 opacity-50">
              <LinkIcon2 />
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-20 size-12 transform rotate-45 opacity-20 animate-pulse bg-[#964834]"></div>
        <div className="absolute top-1/2 right-20">
          <div className="flex space-x-2 animate-bounce transform  opacity-30 relative">
            <div className="size-6 bg-[#964834]"></div>
            <div className="absolute size-6 -right-1 -bottom-1  bg-accent"></div>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-16 ">
          <div className="space-y-2">
            {[18, 24, 28, 32, 36].map((w, i) => (
              <div
                key={i}
                className={`h-1 rounded-full opacity-40 animate-pulse bg-accent`}
                style={{
                  width: `${w}px`,
                  animationDelay: `${0.1 * (i + 1)}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="absolute top-1/4 right-16">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`size-2 rounded-full opacity-40 animate-pulse bg-accent`}
                style={{ transitionDelay: 100 * i + "ms" }}
              ></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-1/6 right-1/3">
          <div className="relative">
            <StarIcon className="size-6 absolute top-0 left-0 opacity-20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
