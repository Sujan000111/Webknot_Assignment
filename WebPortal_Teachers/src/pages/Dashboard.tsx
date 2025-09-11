import { TrendingUp, Users, Calendar, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";

const Dashboard = () => {
  const { data: eventsAgg } = useQuery({
    queryKey: ["dashboard-events-agg"],
    queryFn: async () => {
      const { count, error } = await supabase!
        .from("events")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return { totalEvents: count ?? 0 };
    },
    enabled: isSupabaseReady,
  });

  const { data: regsAgg } = useQuery({
    queryKey: ["dashboard-registrations-agg"],
    queryFn: async () => {
      const { count, error } = await supabase!
        .from("registrations")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return { totalRegistrations: count ?? 0 };
    },
    enabled: isSupabaseReady,
  });

  const { data: attendanceAgg } = useQuery({
    queryKey: ["dashboard-attendance-agg"],
    queryFn: async () => {
      const [attendanceResult, feedbackResult] = await Promise.all([
        supabase!.from("attendance").select("id, status", { count: "exact" }),
        supabase!.from("feedback").select("rating", { count: "exact" })
      ]);

      const totalAttendance = attendanceResult.count || 0;
      const presentAttendance = attendanceResult.data?.filter(a => a.status === 'present').length || 0;
      const totalRegistrations = regsAgg?.totalRegistrations || 0;
      
      const attendanceRate = totalRegistrations > 0 ? Math.round((presentAttendance / totalRegistrations) * 100) : 0;
      
      const avgFeedback = feedbackResult.data?.length ? 
        Math.round((feedbackResult.data.reduce((sum, f) => sum + f.rating, 0) / feedbackResult.data.length) * 10) / 10 : 0;

      return { 
        attendanceRate, 
        avgFeedback,
        totalAttendance,
        presentAttendance
      };
    },
    enabled: isSupabaseReady && !!regsAgg,
  });

  const stats = [
    {
      title: "Total Events Created",
      value: String(eventsAgg?.totalEvents ?? 0),
      change: "",
      trend: "up",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Active Registrations",
      value: String(regsAgg?.totalRegistrations ?? 0), 
      change: "",
      trend: "up",
      icon: Users,
      color: "text-secondary"
    },
    {
      title: "Attendance Rate",
      value: `${attendanceAgg?.attendanceRate ?? 0}%`,
      change: `${attendanceAgg?.presentAttendance ?? 0} attended`, 
      trend: "up",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Average Feedback",
      value: String(attendanceAgg?.avgFeedback ?? 0),
      change: "out of 5.0",
      trend: "up", 
      icon: Star,
      color: "text-warning"
    }
  ];

  const { data: recentEvents = [] } = useQuery({
    queryKey: ["dashboard-recent-events"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("events")
        .select("title,status,start_date,current_registrations")
        .order("start_date", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (
        data?.map((e) => ({
          title: e.title,
          type: "-",
          date: new Date(e.start_date).toLocaleString(),
          registrations: e.current_registrations ?? 0,
          status: (e.status as string) || "draft",
        })) ?? []
      );
    },
    enabled: isSupabaseReady,
  });

  const { data: topStudents = [] } = useQuery({
    queryKey: ["dashboard-top-students"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("top_active_students")
        .select("full_name, events_attended")
        .limit(3);
      if (error) throw error;
      return (
        data?.map((student, index) => ({
          name: student.full_name,
          events: student.events_attended,
          badge: index < 3 ? ["🥇", "🥈", "🥉"][index] : ""
        })) ?? []
      );
    },
    enabled: isSupabaseReady,
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-hero h-64">
        <img 
          src={dashboardHero} 
          alt="Campus Events" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 p-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-poppins font-bold text-white mb-4">
            Welcome to MVJCE Event Portal
          </h1>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            Manage campus events, track student participation, and generate insightful reports 
            for better engagement across all college activities.
          </p>
          <div className="flex space-x-4">
            <Button className="btn-hero" onClick={() => window.location.assign('/events')}>
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              View All Events
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="card-metric animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-sm font-medium text-success">{stat.change}</span>
                    <span className="text-sm text-muted-foreground ml-1">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Events</span>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' || event.status === 'Active' ? 'status-active' :
                          event.status === 'published' || event.status === 'Published' ? 'status-published' : 'status-draft'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{event.type}</span>
                        <span>•</span>
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.registrations} registered</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Students */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Top Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-muted-foreground">Top students data coming soon</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Import Students
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;