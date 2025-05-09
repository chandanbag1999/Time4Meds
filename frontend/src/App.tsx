import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <header className="w-full flex justify-end mb-8">
        <SignedIn>
          {/* Show user button for signed in users */}
          <UserButton />
        </SignedIn>
        <SignedOut>
          {/* Show sign in button for signed out users */}
          <div className="flex gap-2">
            <Link to="/auth/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </SignedOut>
      </header>
      
      <main className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Time4Meds Application</h1>
        
        <SignedIn>
          <div className="text-center">
            <p className="mb-4">Welcome to Time4Meds!</p>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link to="/auth/enter-pin">
                <Button variant="outline">PIN Login</Button>
              </Link>
            </div>
          </div>
        </SignedIn>
        
        <SignedOut>
          <div className="text-center">
            <p className="mb-4">Please sign in to access your medication schedule</p>
            <div className="flex gap-2">
              <Link to="/auth/sign-in">
                <Button>Sign In</Button>
              </Link>
              <Link to="/auth/sign-up">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  )
}

export default App
