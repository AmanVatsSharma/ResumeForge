import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Download, 
  Eye, 
  Clock,
  Target,
  Award,
  Calendar,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for analytics
const mockAnalytics = {
  overview: {
    totalResumes: 1247,
    totalViews: 8934,
    avgCompletionTime: "4.2 min",
    successRate: 94.2,
    monthlyGrowth: 23.5
  },
  templates: [
    { name: "Modern Professional", usage: 45, views: 2340, rating: 4.8 },
    { name: "Creative Designer", usage: 32, views: 1890, rating: 4.6 },
    { name: "Executive Suite", usage: 28, views: 1650, rating: 4.9 },
    { name: "Tech Specialist", usage: 41, views: 2100, rating: 4.7 },
    { name: "Minimalist Clean", usage: 19, views: 954, rating: 4.5 }
  ],
  userEngagement: [
    { date: "2024-01-01", activeUsers: 120, resumesCreated: 45, avgSessionTime: 8.5 },
    { date: "2024-01-02", activeUsers: 135, resumesCreated: 52, avgSessionTime: 9.2 },
    { date: "2024-01-03", activeUsers: 142, resumesCreated: 48, avgSessionTime: 8.8 },
    { date: "2024-01-04", activeUsers: 158, resumesCreated: 61, avgSessionTime: 9.5 },
    { date: "2024-01-05", activeUsers: 165, resumesCreated: 58, avgSessionTime: 9.1 },
    { date: "2024-01-06", activeUsers: 172, resumesCreated: 67, avgSessionTime: 9.8 },
    { date: "2024-01-07", activeUsers: 189, resumesCreated: 73, avgSessionTime: 10.2 }
  ],
  performance: {
    pageLoadTime: "1.2s",
    uptime: "99.9%",
    errorRate: "0.1%",
    apiResponseTime: "180ms"
  }
};

// Chart component placeholder
const SimpleChart = ({ data, type = "bar" }: { data: any[], type?: string }) => (
  <div className="h-64 flex items-end justify-between space-x-2 p-4">
    {data.map((item, index) => (
      <div key={index} className="flex flex-col items-center space-y-2">
        <div 
          className="bg-gradient-to-t from-purple-600 to-blue-600 rounded-t w-8 transition-all duration-500 hover:scale-105"
          style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px` }}
        />
        <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
      </div>
    ))}
  </div>
);

export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const overviewCards = [
    {
      title: "Total Resumes",
      value: mockAnalytics.overview.totalResumes.toLocaleString(),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Total Views",
      value: mockAnalytics.overview.totalViews.toLocaleString(),
      change: "+8.3%",
      changeType: "positive" as const,
      icon: <Eye className="h-5 w-5" />
    },
    {
      title: "Avg. Completion Time",
      value: mockAnalytics.overview.avgCompletionTime,
      change: "-15.2%",
      changeType: "positive" as const,
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Success Rate",
      value: `${mockAnalytics.overview.successRate}%`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: <Target className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your resume creation performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {selectedPeriod}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPeriod("24h")}>Last 24 hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("90d")}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </CardTitle>
                <div className="text-purple-600 dark:text-purple-400">
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <Badge 
                    variant={card.changeType === "positive" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {card.change}
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart 
                  data={mockAnalytics.userEngagement.map((item, index) => ({
                    label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    value: item.activeUsers
                  }))}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resume Creation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart 
                  data={mockAnalytics.userEngagement.map((item, index) => ({
                    label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    value: item.resumesCreated
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Usage & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.templates.map((template, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {template.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.usage}% usage • {template.views} views
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Template</DropdownMenuItem>
                          <DropdownMenuItem>Export Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockAnalytics.performance.pageLoadTime}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Average load time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockAnalytics.performance.uptime}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Service availability</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockAnalytics.performance.errorRate}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Failed requests</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mockAnalytics.performance.apiResponseTime}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Average response time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Content Quality</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    94% Excellent
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">ATS Optimization</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    97% Pass Rate
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">User Satisfaction</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    4.8/5 Rating
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Optimize Template Usage</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Consider promoting the "Modern Professional" template as it has the highest engagement rate.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Peak Usage Times</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Most users create resumes between 9-11 AM and 2-4 PM. Consider scheduling maintenance outside these hours.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">AI Enhancement</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Users are requesting more industry-specific AI suggestions. Consider expanding the AI training data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}