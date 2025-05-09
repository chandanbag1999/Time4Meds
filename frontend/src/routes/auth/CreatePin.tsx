import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";

/**
 * Create PIN page that appears after first authentication
 * Allows user to set up a PIN for future logins
 */
export function CreatePinPage() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPin(value);
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setConfirmPin(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate PIN
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    try {
      // Store PIN in user metadata
      // Note: In a real app, never store PINs in plain text
      // This should use a proper hashing mechanism
      if (user) {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            hasPin: true,
          },
          privateMetadata: {
            ...user.privateMetadata,
            pin: pin, // In a real app, hash this value
          },
        });
      }
      
      // Navigate to dashboard or another page
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to save PIN. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Create PIN</h1>
        <p className="text-center text-gray-600 mb-6">Set up a PIN for quick access to your account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-1">
              Enter PIN (4-6 digits)
            </label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={handlePinChange}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium mb-1">
              Confirm PIN
            </label>
            <Input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={handleConfirmPinChange}
              className="w-full"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={!pin || !confirmPin}>
            Create PIN
          </Button>
        </form>
      </div>
    </div>
  );
} 