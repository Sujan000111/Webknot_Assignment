import { useState } from "react";
import { Search, Download, Upload, UserPlus, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { testSupabaseConnection, createSampleStudents, checkDatabasePermissions } from "@/utils/testSupabase";
import { createAllSampleData, createEventTypes, createVenues, createSampleEvents, createSampleRegistrations } from "@/utils/createSampleData";

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");

  type StudentRow = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
    department: string | null;
    year_of_study: number | null;
    is_active: boolean | null;
    college_id?: string;
  };

  const { data: students = [], isLoading, error, isError, refetch } = useQuery({
    queryKey: ["students", { searchTerm }],
    queryFn: async (): Promise<StudentRow[]> => {
      console.log("Fetching students from Supabase...");
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      // First, let's check if the table exists and get a count
      const { count, error: countError } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      
      console.log("Total students in database:", count);
      if (countError) {
        console.error("Count error:", countError);
      }
      
      // Now fetch the actual data
      const { data, error } = await supabase
        .from("students")
        .select("id,first_name,last_name,email,student_id,department,year_of_study,is_active,college_id")
        .order("first_name", { ascending: true });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Students fetched successfully:", data?.length || 0, "students");
      console.log("Sample student data:", data?.[0]);
      return data ?? [];
    },
    enabled: isSupabaseReady,
    retry: 2,
    staleTime: 0, // Disable caching for now to see fresh data
  });

  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges-min"],
    queryFn: async () => {
      const { data, error } = await supabase!.from("colleges").select("id,name").order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    enabled: isSupabaseReady,
  });

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    college_id: "",
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    year_of_study: 1,
  });

  const createStudent = useMutation({
    mutationFn: async () => {
      const payload = {
        college_id: form.college_id,
        student_id: form.student_id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        department: form.department || null,
        year_of_study: Number(form.year_of_study),
      };
      const { error } = await supabase!.from("students").insert([payload]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm({
        college_id: "",
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        year_of_study: 1,
      });
    },
  });

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const getParticipationLevel = (events: number) => {
    if (events >= 10) return { label: "High", color: "bg-success text-success-foreground" };
    if (events >= 5) return { label: "Medium", color: "bg-warning text-warning-foreground" };
    return { label: "Low", color: "bg-muted text-muted-foreground" };
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage student registrations and track participation</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-academic">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Student</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">College</Label>
                  <Select value={form.college_id} onValueChange={(v) => setForm({ ...form, college_id: v })}>
                    <SelectTrigger id="college"><SelectValue placeholder="Select college" /></SelectTrigger>
                    <SelectContent>
                      {colleges.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input id="student_id" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="year">Year of Study</Label>
                  <Input id="year" type="number" min={1} max={4} value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: Number(e.target.value || 1) })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => createStudent.mutate()} disabled={createStudent.isPending || !form.college_id || !form.student_id || !form.first_name || !form.last_name || !form.email}>
                  {createStudent.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, email, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">-</div>
              <div className="text-sm text-muted-foreground">High Participation</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">-</div>
              <div className="text-sm text-muted-foreground">Avg Attendance</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">-</div>
              <div className="text-sm text-muted-foreground">Total Participations</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Events</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Attendance</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Participation</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Event</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={7}>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="p-4 text-destructive" colSpan={7}>
                      <div className="text-center">
                        <p className="font-medium">Error loading students</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {error?.message || "Something went wrong. Please try again."}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => window.location.reload()}
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && filteredStudents.length === 0 && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={7}>
                      <div className="text-center">
                        <p className="font-medium">No students found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchTerm ? "Try adjusting your search criteria." : "No students have been registered yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && filteredStudents.map((student, index) => {
                  const participation = getParticipationLevel(0);
                  return (
                    <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground">{student.first_name} {student.last_name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground">{student.student_id}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm font-medium">{student.department || '-'}</div>
                          <div className="text-xs text-muted-foreground">{student.year_of_study ? `${student.year_of_study} Year` : '-'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-lg font-bold text-primary">-</div>
                      </td>
                      <td className="p-4">
                        <div className={`text-lg font-bold ${getAttendanceColor(0)}`}>
                          -
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${participation.color} text-xs`}>
                          {participation.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">-</div>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>🏆 Top 3 Most Active Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top performers pending backend aggregation */}
            <div className="text-center text-muted-foreground">Top students data coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;