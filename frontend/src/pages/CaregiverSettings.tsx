import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/services/api";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Skeleton,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Switch,
  Tabs, TabsContent, TabsList, TabsTrigger,
  LoadingButton,
  Badge,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui";
import { ArrowLeft, UserPlus, Trash2, Mail, Shield, Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface Caregiver {
  userId: string;
  name: string;
  email: string;
  notifyOnMissed: boolean;
  notifyOnAdherence: boolean;
  accessLevel: "view" | "manage";
  addedAt: string;
}

interface CaregivingFor {
  userId: string;
  name: string;
  accessLevel: "view" | "manage";
  addedAt: string;
}

const CaregiverSettings = () => {
  const [activeTab, setActiveTab] = useState("caregivers");
  const [loading, setLoading] = useState(true);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [caregivingFor, setCaregivingFor] = useState<CaregivingFor[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [newCaregiverEmail, setNewCaregiverEmail] = useState("");
  const [newCaregiverAccess, setNewCaregiverAccess] = useState<"view" | "manage">("view");
  const [notifyMissed, setNotifyMissed] = useState(true);
  const [notifyAdherence, setNotifyAdherence] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCaregiverData();
  }, []);

  const fetchCaregiverData = async () => {
    setLoading(true);
    try {
      const [caregiversResponse, caregivingForResponse] = await Promise.all([
        apiService.get("/users/caregivers"),
        apiService.get("/users/caregiving"),
      ]);

      // Initialize with empty arrays to prevent undefined errors
      let caregiversData: Caregiver[] = [];
      let caregivingForData: CaregivingFor[] = [];

      // Safely extract data from responses
      if (caregiversResponse && caregiversResponse.data) {
        // Check if data is directly in response.data or in response.data.data
        if (Array.isArray(caregiversResponse.data)) {
          caregiversData = caregiversResponse.data;
        } else if (caregiversResponse.data.data && Array.isArray(caregiversResponse.data.data)) {
          caregiversData = caregiversResponse.data.data;
        }
      }

      if (caregivingForResponse && caregivingForResponse.data) {
        // Check if data is directly in response.data or in response.data.data
        if (Array.isArray(caregivingForResponse.data)) {
          caregivingForData = caregivingForResponse.data;
        } else if (caregivingForResponse.data.data && Array.isArray(caregivingForResponse.data.data)) {
          caregivingForData = caregivingForResponse.data.data;
        }
      }

      // Update state with the extracted data
      setCaregivers(caregiversData);
      setCaregivingFor(caregivingForData);

      console.log("Caregivers loaded:", caregiversData.length);
      console.log("Caregiving for loaded:", caregivingForData.length);
    } catch (error) {
      console.error("Error fetching caregiver data:", error);
      // Initialize with empty arrays on error
      setCaregivers([]);
      setCaregivingFor([]);

      // Use string for toast to avoid type errors
      toast("Error: Failed to load caregiver data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCaregiver = async () => {
    // Validate email format
    if (!newCaregiverEmail) {
      toast("Error: Please enter a valid email address.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCaregiverEmail)) {
      toast("Error: Please enter a valid email address format.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.post("/users/caregivers", {
        email: newCaregiverEmail,
        accessLevel: newCaregiverAccess,
        notifyOnMissed: notifyMissed,
        notifyOnAdherence: notifyAdherence,
      });

      toast("Success: Caregiver added successfully.");

      // Reset form and close dialog
      setNewCaregiverEmail("");
      setNewCaregiverAccess("view");
      setNotifyMissed(true);
      setNotifyAdherence(false);
      setIsAddDialogOpen(false);

      // Refresh caregiver data
      await fetchCaregiverData();
    } catch (error: any) {
      console.error("Error adding caregiver:", error);

      // Handle specific error cases based on the error message
      let errorMessage = "Failed to add caregiver. Please try again.";

      if (error.response?.data?.error) {
        const errorText = error.response.data.error;

        // Check for specific error patterns
        if (errorText.includes("No matching document found")) {
          errorMessage = "The user with this email doesn't exist in the system. Please check the email address.";
        } else if (errorText.includes("already a caregiver")) {
          errorMessage = "This person is already added as your caregiver.";
        } else if (errorText.includes("cannot add yourself")) {
          errorMessage = "You cannot add yourself as a caregiver.";
        } else {
          // Use the server's error message if available
          errorMessage = error.response.data.message || errorMessage;
        }
      }

      toast(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCaregiver = async () => {
    if (!selectedCaregiver) return;

    setIsSubmitting(true);
    try {
      await apiService.put(`/users/caregivers/${selectedCaregiver.userId}`, {
        accessLevel: newCaregiverAccess,
        notifyOnMissed: notifyMissed,
        notifyOnAdherence: notifyAdherence,
      });

      toast("Success: Caregiver settings updated successfully.");

      setIsEditDialogOpen(false);

      // Refresh caregiver data
      await fetchCaregiverData();
    } catch (error) {
      console.error("Error updating caregiver:", error);
      toast("Error: Failed to update caregiver settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCaregiver = async () => {
    if (!selectedCaregiver) return;

    setIsSubmitting(true);
    try {
      await apiService.delete(`/users/caregivers/${selectedCaregiver.userId}`);

      toast("Success: Caregiver removed successfully.");

      setIsDeleteDialogOpen(false);

      // Refresh caregiver data
      await fetchCaregiverData();
    } catch (error) {
      console.error("Error removing caregiver:", error);
      toast("Error: Failed to remove caregiver. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setNewCaregiverAccess(caregiver.accessLevel);
    setNotifyMissed(caregiver.notifyOnMissed);
    setNotifyAdherence(caregiver.notifyOnAdherence);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
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
          <h1 className="text-2xl sm:text-3xl font-bold">Caregiver Settings</h1>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Caregiver
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="caregivers">My Caregivers</TabsTrigger>
          <TabsTrigger value="caregivingFor">People I Care For</TabsTrigger>
        </TabsList>

        <TabsContent value="caregivers" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
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
              {caregivers.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full text-center py-12"
                >
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven't added any caregivers yet. Caregivers can help monitor your medication adherence.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    Add Your First Caregiver
                  </Button>
                </motion.div>
              ) : (
                caregivers.map((caregiver) => (
                  <motion.div key={caregiver.userId} variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {caregiver.name}
                          <Badge variant={caregiver.accessLevel === "manage" ? "default" : "secondary"}>
                            {caregiver.accessLevel}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{caregiver.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Notify on missed doses</span>
                            </div>
                            <span>{caregiver.notifyOnMissed ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Added on</span>
                            </div>
                            <span className="text-sm">{formatDate(caregiver.addedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(caregiver)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(caregiver)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="caregivingFor" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                  </CardContent>
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
              {caregivingFor.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full text-center py-12"
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    You are not currently a caregiver for anyone. When someone adds you as their caregiver, they will appear here.
                  </p>
                </motion.div>
              ) : (
                caregivingFor.map((person) => (
                  <motion.div key={person.userId} variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {person.name}
                          <Badge variant={person.accessLevel === "manage" ? "default" : "secondary"}>
                            {person.accessLevel}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Access Level</span>
                            </div>
                            <span className="capitalize">{person.accessLevel}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Added on</span>
                            </div>
                            <span className="text-sm">{formatDate(person.addedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Caregiver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Caregiver</DialogTitle>
            <DialogDescription>
              Enter the email of the person you want to add as your caregiver. They must have an account in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newCaregiverEmail}
                onChange={(e) => setNewCaregiverEmail(e.target.value)}
                className="col-span-3"
                placeholder="caregiver@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="access" className="text-right">
                Access
              </Label>
              <Select
                value={newCaregiverAccess}
                onValueChange={(value: "view" | "manage") => setNewCaregiverAccess(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="manage">Manage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Notifications</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyMissed" className="cursor-pointer">
                    Notify on missed doses
                  </Label>
                  <Switch
                    id="notifyMissed"
                    checked={notifyMissed}
                    onCheckedChange={setNotifyMissed}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyAdherence" className="cursor-pointer">
                    Notify on adherence reports
                  </Label>
                  <Switch
                    id="notifyAdherence"
                    checked={notifyAdherence}
                    onCheckedChange={setNotifyAdherence}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleAddCaregiver}
              isLoading={isSubmitting}
              loadingText="Adding..."
              variant="primary"
            >
              Add Caregiver
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Caregiver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caregiver Settings</DialogTitle>
            <DialogDescription>
              Update settings for {selectedCaregiver?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">
                Email
              </Label>
              <Input
                id="editEmail"
                value={selectedCaregiver?.email || ""}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editAccess" className="text-right">
                Access
              </Label>
              <Select
                value={newCaregiverAccess}
                onValueChange={(value: "view" | "manage") => setNewCaregiverAccess(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="manage">Manage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Notifications</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="editNotifyMissed" className="cursor-pointer">
                    Notify on missed doses
                  </Label>
                  <Switch
                    id="editNotifyMissed"
                    checked={notifyMissed}
                    onCheckedChange={setNotifyMissed}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="editNotifyAdherence" className="cursor-pointer">
                    Notify on adherence reports
                  </Label>
                  <Switch
                    id="editNotifyAdherence"
                    checked={notifyAdherence}
                    onCheckedChange={setNotifyAdherence}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleUpdateCaregiver}
              isLoading={isSubmitting}
              loadingText="Updating..."
              variant="primary"
            >
              Update
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Caregiver Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Caregiver</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedCaregiver?.name} as your caregiver? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleRemoveCaregiver}
              isLoading={isSubmitting}
              loadingText="Removing..."
            >
              Remove
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaregiverSettings;
