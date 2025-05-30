import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/services/api";
import {
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Skeleton
} from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Import chart components (these would be created separately)
import AdherenceOverviewChart from "@/components/charts/AdherenceOverviewChart";
import AdherenceTrendChart from "@/components/charts/AdherenceTrendChart";
import AdherenceByDayChart from "@/components/charts/AdherenceByDayChart";
import AdherenceByTimeChart from "@/components/charts/AdherenceByTimeChart";
import AdherenceByMedicineChart from "@/components/charts/AdherenceByMedicineChart";

interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  overall: {
    total: number;
    taken: number;
    skipped: number;
    missed: number;
    adherenceRate: number;
  };
  dayOfWeek: Array<{
    total: number;
    taken: number;
    adherenceRate: number;
  }>;
  timeOfDay: {
    morning: { total: number; taken: number; adherenceRate: number };
    afternoon: { total: number; taken: number; adherenceRate: number };
    evening: { total: number; taken: number; adherenceRate: number };
    night: { total: number; taken: number; adherenceRate: number };
  };
  byMedicine: Array<{
    medicineId: string;
    name: string;
    dosage: string;
    total: number;
    taken: number;
    skipped: number;
    missed: number;
    adherenceRate: number;
  }>;
  trend: Array<{
    weekStart: string;
    weekEnd: string;
    total: number;
    taken: number;
    adherenceRate: number;
  }>;
}

const AdherenceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/reminder-logs/analytics?period=${period}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            size="icon"
            asChild
            className="mr-2"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Medication Adherence Analytics</h1>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="dayOfWeek">Day of Week</TabsTrigger>
          <TabsTrigger value="timeOfDay">Time of Day</TabsTrigger>
          <TabsTrigger value="byMedicine">By Medicine</TabsTrigger>
        </TabsList>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <TabsContent value="overview" className="mt-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Overall Adherence</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Adherence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <AdherenceOverviewChart data={analyticsData.overall} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Adherence Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Adherence Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <AdherenceTrendChart data={analyticsData.trend} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="dayOfWeek" className="mt-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Adherence by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Adherence by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <AdherenceByDayChart data={analyticsData.dayOfWeek} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="timeOfDay" className="mt-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Adherence by Time of Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Adherence by Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <AdherenceByTimeChart data={analyticsData.timeOfDay} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="byMedicine" className="mt-0">
            {loading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Adherence by Medicine</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Adherence by Medicine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData && (
                      <AdherenceByMedicineChart data={analyticsData.byMedicine} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default AdherenceAnalytics;
