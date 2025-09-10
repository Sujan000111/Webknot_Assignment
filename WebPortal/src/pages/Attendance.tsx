import { useState } from "react";
import { Search, Download, Upload, UserCheck, Filter, MoreHorizontal, Users, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  type RegistrationRow = {
    id: string;
    student_id: string;
    event_id: string;
    registration_date: string;
    status: string;
    students: {
      first_name: string;
      last_name: string;
      student_id: string;
      email: string;
      department: string | null;
      year_of_study: number | null;
    };
    events: {
      title: string;
      start_date: string;
      end_date: string;
    };
    attendance?: {
      id: string;
      status: string;
      notes: string | null;
    };
  };

  // Get registrations for the selected event
  const { data: registrations = [], isLoading, error: queryError } = useQuery({
    queryKey: ["attendance-registrations", { selectedEvent, filterStatus, searchTerm }],
    queryFn: async (): Promise<RegistrationRow[]> => {
      console.log("Fetching registrations for event:", selectedEvent);
      
      let query = supabase!
        .from("registrations")
        .select(`
          *,
          students(first_name, last_name, student_id, email, department, year_of_study),
          events(title, start_date, end_date),
          attendance(id, status, notes)
        `)
        .eq("status", "registered"); // Only get registered students

      if (selectedEvent && selectedEvent !== "all") {
        query = query.eq("event_id", selectedEvent);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Registration query error:", error);
        throw error;
      }
      
      console.log("Registrations data:", data);
      return data ?? [];
    },
    enabled: isSupabaseReady,
  });

  // Get events for the dropdown
  const { data: events = [] } = useQuery({
    queryKey: ["events-for-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("events")
        .select("id,title,start_date,status")
        .in("status", ["active", "published"])
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as { id: string; title: string; start_date: string; status: string }[];
    },
    enabled: isSupabaseReady,
  });

  // Get all students for debugging
  const { data: allStudents = [] } = useQuery({
    queryKey: ["all-students-debug"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("students")
        .select("id,first_name,last_name,student_id,email")
        .limit(5);
      if (error) throw error;
      return data as { id: string; first_name: string; last_name: string; student_id: string; email: string }[];
    },
    enabled: isSupabaseReady,
  });

  // Get all registrations for debugging
  const { data: allRegistrations = [] } = useQuery({
    queryKey: ["all-registrations-debug"],
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("registrations")
        .select("id,student_id,event_id,status")
        .limit(5);
      if (error) throw error;
      return data as { id: string; student_id: string; event_id: string; status: string }[];
    },
    enabled: isSupabaseReady,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create test registration for development
  const createTestRegistration = useMutation({
    mutationFn: async () => {
      if (allStudents.length === 0 || events.length === 0) {
        throw new Error("No students or events available to create test registration");
      }

      const student = allStudents[0];
      const event = events[0];

      const { error } = await supabase!
        .from("registrations")
        .insert([{
          student_id: student.id,
          event_id: event.id,
          status: "registered",
          registration_source: "admin"
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["all-registrations-debug"] });
      toast({ title: "Test registration created successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to create test registration", 
        description: err?.message || "Please try again", 
        variant: "destructive" 
      });
    },
  });

  // Mark attendance (present/absent)
  const markAttendance = useMutation({
    mutationFn: async ({ registrationId, status, notes }: { registrationId: string; status: string; notes?: string }) => {
      // First, check if attendance record already exists
      const { data: existingAttendance } = await supabase!
        .from("attendance")
        .select("id")
        .eq("registration_id", registrationId)
        .single();

      const attendanceData = {
        registration_id: registrationId,
        status,
        notes: notes || null,
        check_in_method: "manual",
        checked_in_at: status === "present" ? new Date().toISOString() : null,
      };

      if (existingAttendance) {
        // Update existing attendance
        const { error } = await supabase!
          .from("attendance")
          .update(attendanceData)
          .eq("registration_id", registrationId);
        if (error) throw error;
      } else {
        // Create new attendance record
        const { error } = await supabase!
          .from("attendance")
          .insert([attendanceData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-registrations"] });
      toast({ title: "Attendance marked successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to mark attendance", 
        description: err?.message || "Please try again", 
        variant: "destructive" 
      });
    },
  });

  // Filter registrations based on search and status
  const filteredRegistrations = registrations.filter((registration) => {
    const student = registration.students;
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const matchesSearch = (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.events.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const attendanceStatus = registration.attendance?.status || "absent";
    const matchesStatus = filterStatus === "all" || attendanceStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-success text-success-foreground";
      case "absent": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4" />;
      case "absent": return <XCircle className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">Mark attendance for registered students</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, email, ID, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-filter">Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="event-filter">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="card-elevated border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>Selected Event:</strong> {selectedEvent}</p>
              <p><strong>Total Registrations:</strong> {registrations.length}</p>
              <p><strong>Filtered Registrations:</strong> {filteredRegistrations.length}</p>
              <p><strong>Events Available:</strong> {events.length}</p>
              <p><strong>Students in DB:</strong> {allStudents.length}</p>
              <p><strong>All Registrations in DB:</strong> {allRegistrations.length}</p>
              {queryError && <p className="text-red-600"><strong>Error:</strong> {(queryError as any)?.message}</p>}
              {allStudents.length > 0 && (
                <div>
                  <p><strong>Sample Students:</strong></p>
                  <ul className="ml-4">
                    {allStudents.map(student => (
                      <li key={student.id}>- {student.first_name} {student.last_name} ({student.student_id})</li>
                    ))}
                  </ul>
                </div>
              )}
              {allRegistrations.length > 0 && (
                <div>
                  <p><strong>Sample Registrations:</strong></p>
                  <ul className="ml-4">
                    {allRegistrations.map(reg => (
                      <li key={reg.id}>- Student: {reg.student_id}, Event: {reg.event_id}, Status: {reg.status}</li>
                    ))}
                  </ul>
                </div>
              )}
              {allRegistrations.length === 0 && allStudents.length > 0 && events.length > 0 && (
                <div className="mt-4">
                  <Button 
                    onClick={() => createTestRegistration.mutate()}
                    disabled={createTestRegistration.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {createTestRegistration.isPending ? "Creating..." : "Create Test Registration"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{registrations.length}</div>
              <div className="text-sm text-muted-foreground">Total Registrations</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {registrations.filter(r => r.attendance?.status === "present").length}
              </div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {registrations.filter(r => r.attendance?.status === "absent" || !r.attendance).length}
              </div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {registrations.length > 0 ? Math.round((registrations.filter(r => r.attendance?.status === "present").length / registrations.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Event</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Current Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={5}>Loading students...</td>
                  </tr>
                )}
                {queryError && (
                  <tr>
                    <td className="p-4 text-destructive" colSpan={5}>
                      Error loading students: {(queryError as any)?.message || "Unknown error"}
                    </td>
                  </tr>
                )}
                {!isLoading && !queryError && filteredRegistrations.map((registration, index) => {
                  const student = registration.students;
                  const event = registration.events;
                  const attendanceStatus = registration.attendance?.status || "absent";
                  
                  return (
                    <tr key={registration.id} className="border-b border-border hover:bg-muted/50 transition-colors animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground">{student.first_name} {student.last_name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground">ID: {student.student_id}</div>
                          {student.department && (
                            <div className="text-xs text-muted-foreground">{student.department} - {student.year_of_study} Year</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(event.start_date)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(registration.registration_date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(attendanceStatus)} text-xs flex items-center gap-1 w-fit`}>
                          {getStatusIcon(attendanceStatus)}
                          {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {attendanceStatus !== "present" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAttendance.mutate({ 
                                registrationId: registration.id, 
                                status: "present" 
                              })}
                              disabled={markAttendance.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Present
                            </Button>
                          )}
                          {attendanceStatus !== "absent" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAttendance.mutate({ 
                                registrationId: registration.id, 
                                status: "absent" 
                              })}
                              disabled={markAttendance.isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Mark Absent
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && !queryError && filteredRegistrations.length === 0 && (
                  <tr>
                    <td className="p-4 text-muted-foreground text-center" colSpan={5}>
                      {selectedEvent === "all" ? "No registered students found" : "No registered students found for this event"}
                      <div className="text-xs mt-2">
                        Total registrations in database: {registrations.length}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>📊 Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">
                {registrations.length > 0 ? Math.round((registrations.filter(r => r.attendance?.status === "present").length / registrations.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Attendance Rate</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {events.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {registrations.filter(r => !r.attendance).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Attendance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;