import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { user } = useUser();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-6 text-center">
        <p className="text-lg mb-2">
          Welcome, {user?.firstName || "User"}!
        </p>
        <p className="text-sm text-gray-600">
          This is a protected page that only authenticated users can access.
        </p>
      </div>
      
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Your Medication Schedule</h2>
          <p className="text-gray-600 mb-4">No medications scheduled yet.</p>
          <Button>Add Medication</Button>
        </div>
      </div>
      
      <Link to="/" className="mt-8">
        <Button variant="outline">Back to Home</Button>
      </Link>
    </div>
  );
} 