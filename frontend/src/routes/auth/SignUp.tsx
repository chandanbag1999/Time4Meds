import { SignUp } from "@clerk/clerk-react";

/**
 * Sign Up page using Clerk's SignUp component for name and email authentication
 */
export function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
        <SignUp path="/auth/sign-up" signInUrl="/auth/sign-in" />
      </div>
    </div>
  );
} 