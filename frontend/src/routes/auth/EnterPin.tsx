import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";

/**
 * Enter PIN page for quick login
 * Verifies the user's PIN against the stored value
 */
export function EnterPinPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPin(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Validate PIN against stored value
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get the stored PIN from user metadata
      const storedPin = user.privateMetadata.pin;
      
      if (!storedPin) {
        // No PIN set, redirect to create PIN
        navigate("/auth/create-pin");
        return;
      }
      
      // Check if PIN matches
      // In a real app, this should use a proper comparison of hashed values
      if (pin !== storedPin) {
        setError("Incorrect PIN. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // PIN is correct, navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleSignInWithEmail = () => {
    navigate("/auth/sign-in");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Enter PIN</h1>
        <p className="text-center text-gray-600 mb-6">Enter your PIN to access your account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-1">
              PIN
            </label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={handlePinChange}
              className="w-full"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!pin || isLoading}
          >
            {isLoading ? "Verifying..." : "Continue"}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleSignInWithEmail}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Sign in with email instead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 