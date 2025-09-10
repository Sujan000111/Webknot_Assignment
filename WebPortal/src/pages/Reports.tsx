import { useState } from "react";
import { BarChart, LineChart, Download, Calendar, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";

const Reports = () => {
  const [dateRange, setDateRange] = useState("last30days");

  const { data: popularity = [], isLoading: loadingPopularity } = useQuery({
    queryKey: ["report-popularity", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("event_popularity_report")
        .select("title,event_type,start_date,current_registrations,total_attendance,attendance_percentage,average_rating");
      if (error) throw error;
      return (
        data?.map((r) => ({
          name: r.title as string,
          type: (r.event_type as string) || "-",
          registrations: (r.current_registrations as number) ?? 0,
          attendance: (r.total_attendance as number) ?? 0,
          feedbackScore: Number(r.average_rating ?? 0),
          date: r.start_date as string,
        })) ?? []
      );
    },
    enabled: isSupabaseReady,
  });

  const { data: topStudents = [], isLoading: loadingTop } = useQuery({
    queryKey: ["report-top-students", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("top_active_students")
        .select("full_name, college_name, events_attended, total_registrations, average_feedback_given");
      if (error) throw error;
      return (
        data?.map((r, idx) => ({
          name: (r.full_name as string) || "-",
          department: (r.college_name as string) || "-",
          eventsAttended: (r.events_attended as number) ?? 0,
          attendanceRate: 0,
          badge: idx < 3 ? ["🥇","🥈","🥉"][idx] : "",
        })) ?? []
      );
    },
    enabled: isSupabaseReady,
  });

  // Student Participation: number of events each student attended
  const { data: participation = [], isLoading: loadingParticipation } = useQuery({
    queryKey: ["report-student-participation", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("top_active_students")
        .select("full_name, college_name, events_attended");
      if (error) throw error;
      return (
        data?.map((r) => ({
          name: (r.full_name as string) || "-",
          department: (r.college_name as string) || "-",
          eventsAttended: (r.events_attended as number) ?? 0,
        })) ?? []
      );
    },
    enabled: isSupabaseReady,
  });

  const { data: eventTypeStats = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["report-type-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase!
        .rpc("get_event_type_analysis")
        .select();
      if (error) throw error;
      return data as { type: string; count: number; avgAttendance: number; avgFeedback: number }[] || [];
    },
    enabled: false, // placeholder until RPC is added
  });

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "Workshop": "bg-blue-100 text-blue-800",
      "Tech Talk": "bg-green-100 text-green-800", 
      "Fest": "bg-purple-100 text-purple-800",
      "Seminar": "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into campus event performance</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-card text-foreground"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="lastYear">Last Year</option>
          </select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold text-primary">29</p>
                <p className="text-xs text-success mt-1">↗ +23% from last month</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <p className="text-3xl font-bold text-secondary">441</p>
                <p className="text-xs text-success mt-1">↗ +15% from last month</p>
              </div>
              <Users className="h-8 w-8 text-secondary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance Rate</p>
                <p className="text-3xl font-bold text-success">84.2%</p>
                <p className="text-xs text-success mt-1">↗ +3% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Feedback Score</p>
                <p className="text-3xl font-bold text-warning">4.6</p>
                <p className="text-xs text-success mt-1">↗ +0.2 from last month</p>
              </div>
              <Star className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="event-popularity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="event-popularity">Event Popularity</TabsTrigger>
          <TabsTrigger value="student-participation">Student Participation</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="event-types">Event Type Analysis</TabsTrigger>
        </TabsList>

        {/* Event Popularity Report */}
        <TabsContent value="event-popularity" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Event Popularity Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Event Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Registrations</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Attendance Rate</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Feedback Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loadingPopularity ? [] : popularity)
                      .sort((a, b) => b.registrations - a.registrations)
                      .map((event, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium">{event.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-primary mr-2">{event.registrations}</div>
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-primary h-2 rounded-full"
                                  style={{ width: `${Math.min((event.registrations / 250) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-lg font-bold text-secondary">{event.attendance}</td>
                          <td className="p-3">
                            <span className={`font-semibold ${
                              (event.attendance / event.registrations) * 100 >= 90 ? 'text-success' :
                              (event.attendance / event.registrations) * 100 >= 75 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {Math.round((event.attendance / event.registrations) * 100)}%
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-warning mr-1" />
                              <span className="font-semibold">{event.feedbackScore}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Participation Report */}
        <TabsContent value="student-participation" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Student Participation Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Student Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Events Attended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loadingParticipation ? [] : participation)
                      .sort((a, b) => b.eventsAttended - a.eventsAttended)
                      .map((student, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 text-muted-foreground">{index + 1}</td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3 text-muted-foreground">{student.department}</td>
                          <td className="p-3">
                            <span className="text-lg font-bold text-primary">{student.eventsAttended}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="top-performers" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                🏆 Top 3 Most Active Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(loadingTop ? [] : topStudents).slice(0, 3).map((student, index) => {
                  const badges = ["🥇", "🥈", "🥉"];
                  const positions = ["1st", "2nd", "3rd"];
                  return (
                    <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:shadow-card-hover transition-shadow">
                      <div className="text-6xl mb-4">{badges[index]}</div>
                      <h3 className="text-xl font-bold mb-2">{student.name}</h3>
                      <p className="text-muted-foreground mb-4">{student.department}</p>
                      <div className="space-y-3">
                        <div className="bg-card rounded-lg p-3 border">
                          <div className="text-2xl font-bold text-primary">{student.eventsAttended}</div>
                          <div className="text-sm text-muted-foreground">Events Attended</div>
                        </div>
                        <div className="bg-card rounded-lg p-3 border">
                          <div className={`text-xl font-bold ${
                            student.attendanceRate >= 90 ? 'text-success' :
                            student.attendanceRate >= 75 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {student.attendanceRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">Attendance Rate</div>
                        </div>
                      </div>
                      <div className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {positions[index]} Place
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Top Performers Table */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Complete Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground">Rank</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Student Name</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Events Attended</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loadingTop ? [] : topStudents).map((student, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 text-center">
                            <span className="text-2xl">{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}</span>
                          </td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3 text-muted-foreground">{student.department}</td>
                          <td className="p-3">
                            <span className="text-lg font-bold text-primary">{student.eventsAttended}</span>
                          </td>
                          <td className="p-3">
                            <span className={`font-semibold ${
                              student.attendanceRate >= 90 ? 'text-success' :
                              student.attendanceRate >= 75 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {student.attendanceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Type Analysis */}
        <TabsContent value="event-types" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5" />
                Event Type Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {eventTypeStats.map((stat, index) => (
                  <div key={index} className="p-6 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 hover:shadow-card transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{stat.type}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(stat.type)}`}>
                        {stat.count} events
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Attendance:</span>
                        <span className={`font-bold text-lg ${
                          stat.avgAttendance >= 85 ? 'text-success' :
                          stat.avgAttendance >= 70 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {stat.avgAttendance}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Feedback:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span className="font-bold text-lg">{stat.avgFeedback}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stat.avgAttendance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;