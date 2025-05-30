import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/services/api";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Skeleton,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Badge,
  Progress,
  LoadingButton
} from "@/components/ui";
import { ArrowLeft, Plus, Minus, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

// Define API response type
interface ApiResponse {
  success: boolean;
  count: number;
  data: Medicine[];
}

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  inventoryCount: number;
  dosesPerIntake: number;
  lowInventoryThreshold: number;
  daysRemaining: number;
  isLow: boolean;
  lastRefillDate: string | null;
  expirationDate: string | null;
  refillAmount: number;
  pharmacy: {
    name: string;
    phone: string;
    prescriptionNumber: string;
  };
}

const InventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false);
  const [refillAmount, setRefillAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/reminder-logs/inventory");
      // Cast the response to our ApiResponse type
      const responseData = response as unknown as ApiResponse;

      // Check for the correct response format
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        setMedicines(responseData.data);
        console.log(`Successfully loaded ${responseData.count} inventory items`);
      } else {
        // If the response doesn't have the expected structure, set an empty array
        setMedicines([]);
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      // Set medicines to empty array on error
      setMedicines([]);
      // Use string for toast to avoid type errors
      toast("Error: Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async () => {
    if (!selectedMedicine) return;

    setIsSubmitting(true);
    try {
      await apiService.put(`/reminder-logs/inventory/${selectedMedicine._id}`, {
        action: "refill",
        amount: refillAmount || selectedMedicine.refillAmount,
      });

      // Use string for toast to avoid type errors
      toast(`Success: Refilled ${selectedMedicine.name} successfully.`);

      // Refresh inventory data
      await fetchInventoryData();
      setIsRefillDialogOpen(false);
    } catch (error) {
      console.error("Error refilling medicine:", error);
      // Use string for toast to avoid type errors
      toast("Error: Failed to refill medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustInventory = async (medicineId: string, adjustment: number) => {
    setIsSubmitting(true);
    try {
      await apiService.put(`/reminder-logs/inventory/${medicineId}`, {
        action: "adjust",
        amount: adjustment,
      });

      // Use string for toast to avoid type errors
      toast("Success: Adjusted inventory successfully.");

      // Refresh inventory data
      await fetchInventoryData();
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      // Use string for toast to avoid type errors
      toast("Error: Failed to adjust inventory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRefillDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setRefillAmount(medicine.refillAmount);
    setIsRefillDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mr-2 p-2"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Medication Inventory</h1>
        </div>
        <Button
          variant="outline"
          onClick={fetchInventoryData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {medicines.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No medications found. Add medicines with inventory tracking to get started.
              </p>
              <Button asChild>
                <Link to="/add-medicine">Add Medicine</Link>
              </Button>
            </motion.div>
          ) : (
            medicines.map((medicine) => (
              <motion.div key={medicine._id} variants={itemVariants}>
                <Card className={medicine.isLow ? "border-red-300 dark:border-red-700" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{medicine.name}</CardTitle>
                      {medicine.isLow && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{medicine.dosage}</p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Current Stock</span>
                        <span className="text-sm font-medium">{medicine.inventoryCount} doses</span>
                      </div>
                      <Progress
                        value={(medicine.inventoryCount / (medicine.lowInventoryThreshold * 3)) * 100}
                        className={medicine.isLow ? "bg-red-100 dark:bg-red-900" : ""}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Per Dose</p>
                        <p className="font-medium">{medicine.dosesPerIntake} units</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Days Left</p>
                        <p className="font-medium">{medicine.daysRemaining} days</p>
                      </div>
                      {medicine.lastRefillDate && (
                        <div className="col-span-2">
                          <p className="text-gray-500 dark:text-gray-400">Last Refill</p>
                          <p className="font-medium">{formatDate(medicine.lastRefillDate)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustInventory(medicine._id, -1)}
                        disabled={isSubmitting || medicine.inventoryCount <= 0}
                        className="p-2 h-8 w-8 flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustInventory(medicine._id, 1)}
                        disabled={isSubmitting}
                        className="p-2 h-8 w-8 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => openRefillDialog(medicine)}
                      disabled={isSubmitting}
                    >
                      Refill
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <Dialog open={isRefillDialogOpen} onOpenChange={setIsRefillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refill {selectedMedicine?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount to add to your current inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current" className="text-right">
                Current
              </Label>
              <Input
                id="current"
                value={selectedMedicine?.inventoryCount || 0}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Add
              </Label>
              <Input
                id="amount"
                type="number"
                value={refillAmount}
                onChange={(e) => setRefillAmount(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefillDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleRefill}
              isLoading={isSubmitting}
              loadingText="Refilling..."
              variant="primary"
            >
              Refill
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
