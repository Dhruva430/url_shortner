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

export default function Register() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white">
      <div className="flex flex-1 items-center justify-center bg-blackShade">
        <div className="w-98 m-10">
          <div className="p-2 rounded flex items-center justify-center bg-accent mx-auto w-fit my-10">
            <LinkIcon className="size-12" />
          </div>

          <button
            onClick={() => router.push("/api/auth/google")}
            className="w-full p-4  flex justify-center gap-2 bg-black hover:bg-gray-500 transition-colors rounded mb-4 cursor-pointer"
          >
            <GoogleIcon className="size-5" />
            Log in with google
          </button>
          <div className="flex items-center gap-2 my-7">
            <span className="h-px w-full block bg-gray-500" />
            <span className="text-gray-400 shrink-0">OR</span>
            <span className="h-px w-full block bg-gray-500" />
          </div>
          <h1 className="text-center text-3xl font-bold mb-4">
            Create Account
          </h1>
          <p className="text-gray-400 text-center">
            Join Shrinkr to start shortening your URLs today.
          </p>
          <RegisterForm />
          <div>
            <div className="flex justify-center gap-4 my-2">
              <span className="text-gray-400 text-[18px]">
                Already have an account ?
              </span>
              <Link
                href={"/login"}
                className={
                  "text-[18px] text-blue-600 hover:underline visited:text-purple-600 "
                }
              >
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 hidden lg:block bg-darkGreen">
        <div className="relative h-full overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full opacity-5 bg-[#10a4b0]"></div>
            <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full opacity-5 bg-[#aedde5]"></div>
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-15  bg-[#406d71]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="relative w-96 h-96 rounded-3xl overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Image
                    src={SignupImage}
                    alt="Sign up illustration"
                    className="object-cover w-full h-full"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-[#034951]/20"></div> */}
                </div>
                <div className="absolute -top-8 -right-8 w-28 h-20 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#10a4b0]">Free</div>
                    <div className="text-xs text-gray-300">Forever</div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 w-32 h-24 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-xl font-bold">∞</div>
                    <div className="text-xs text-gray-300">Unlimited links</div>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-12 w-20 h-20 bg-black rounded-full shadow-lg flex items-center justify-center transform -translate-y-1/2 hover:scale-110 transition-transform duration-300">
                  <StarIcon className="size-10" />
                </div>
                <div className="absolute top-1/4 -left-10 w-24 h-16 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-sm font-bold text-accent">
                      QR codes
                    </div>
                    <div className="text-xs text-gray-400">Included</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-16 right-20 w-14 h-14 transform rotate-45 opacity-20 animate-pulse bg-[#964834]"></div>
              <div className="absolute bottom-1/3 left-20">
                <div className="flex space-x-2 animate-bounce transform   relative">
                  <div className="absolute opacity-20 size-6 -left-2  bg-accent"></div>
                  <div className=" size-6 opacity-20 bg-[#964834]"></div>
                </div>
              </div>
              <div className="absolute top-1/3 left-16">
                <div className="space-y-2">
                  {[18, 24, 28, 32, 36].map((width, idx) => (
                    <div
                      key={width}
                      className={`h-1 rounded-full opacity-40 animate-pulse`}
                      style={{
                        animationDelay: `${0.1 * (idx + 1)}s`,
                        backgroundColor: "var(--accent)",
                        width: `${width}px`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-1/4 right-16">
                <div className="grid grid-cols-2 gap-2">
                  {[0, 0.2, 0.4, 0.6].map((delay, idx) => (
                    <div
                      key={idx}
                      className={`size-2 rounded-full opacity-40 animate-pulse`}
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
                <div className="size-8 rounded-full border-2 opacity-10 animate-spin bg-[#fcba03]"></div>
              </div>
              <div className="absolute bottom-1/6 right-1/3">
                <div className="relative">
                  <StarIcon className="size-6 absolute top-0 left-0 opacity-20 animate-pulse" />
                </div>
              </div>
              <div className="absolute top-1/6 right-1/3">
                <div className="relative">
                  <StarIcon className="size-8 absolute top-0 left-10 opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
