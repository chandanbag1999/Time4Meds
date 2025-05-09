import { SignedIn, RedirectToSignIn } from "@clerk/clerk-react";

interface ProtectedPageProps {
  children: React.ReactNode;
}

/**
 * A component that only renders its children if the user is signed in.
 * Otherwise, it redirects to the sign-in page.
 */
export function ProtectedPage({ children }: ProtectedPageProps) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <RedirectToSignIn />
    </>
  );
} 