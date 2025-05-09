import { SignIn } from "@clerk/clerk-react";

/**
 * Sign In page using Clerk's SignIn component for email OTP, Google, and GitHub authentication
 */
export function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <SignIn 
          path="/auth/sign-in" 
          signUpUrl="/auth/sign-up"
          // Specific set of authentication strategies
          // Clerk will show email OTP, Google, and GitHub sign-in options
        />
      </div>
    </div>
  );
} 