import { useState } from "react";
import { Search, Download, Upload, GraduationCap, Filter, MoreHorizontal, BookOpen, Award, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Academic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  type StudentAcademicRow = {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    email: string;
    department: string | null;
    year_of_study: number | null;
    is_active: boolean | null;
    college_id: string;
    colleges: {
      name: string;
      code: string;
    };
  };

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["academic-students", { selectedCollege, filterYear, searchTerm }],
    queryFn: async (): Promise<StudentAcademicRow[]> => {
      let query = supabase!
        .from("students")
        .select(`
          *,
          colleges(name, code)
        `)
        .order("first_name", { ascending: true });

      if (selectedCollege && selectedCollege !== "all") {
        query = query.eq("college_id", selectedCollege);
      }

      if (filterYear !== "all") {
        query = query.eq("year_of_study", parseInt(filterYear));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseReady,
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

  const { data: academicStats = [] } = useQuery({
    queryKey: ["academic-stats"],
    queryFn: async () => {
      // This would typically come from a view or aggregated query
      // For now, we'll calculate basic stats from the students data
      const { data: studentsData, error } = await supabase!
        .from("students")
        .select("year_of_study, department, college_id, is_active");
      
      if (error) throw error;
      
      // Calculate stats
      const stats = {
        totalStudents: studentsData?.length || 0,
        activeStudents: studentsData?.filter(s => s.is_active).length || 0,
        byYear: {
          1: studentsData?.filter(s => s.year_of_study === 1).length || 0,
          2: studentsData?.filter(s => s.year_of_study === 2).length || 0,
          3: studentsData?.filter(s => s.year_of_study === 3).length || 0,
          4: studentsData?.filter(s => s.year_of_study === 4).length || 0,
        },
        departments: {} as Record<string, number>
      };

      // Count by department
      studentsData?.forEach(student => {
        if (student.department) {
          stats.departments[student.department] = (stats.departments[student.department] || 0) + 1;
        }
      });

      return stats;
    },
    enabled: isSupabaseReady,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    college_id: "",
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    year_of_study: 1,
    phone: "",
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
        phone: form.phone || null,
      };
      const { error } = await supabase!.from("students").insert([payload]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-students"] });
      await queryClient.invalidateQueries({ queryKey: ["academic-stats"] });
      setOpen(false);
      setForm({
        college_id: "",
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        year_of_study: 1,
        phone: "",
      });
      toast({ title: "Student created successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to create student", 
        description: err?.message || "Please check all required fields", 
        variant: "destructive" 
      });
    },
  });

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      student.colleges.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getYearColor = (year: number | null) => {
    if (!year) return "bg-muted text-muted-foreground";
    switch (year) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-purple-100 text-purple-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (isActive: boolean | null) => {
    if (isActive) return "bg-success text-success-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Academic Management</h1>
          <p className="text-muted-foreground">Manage student academic records and enrollment</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Students
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-academic">
                <GraduationCap className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="year">Year of Study</Label>
                  <Select value={form.year_of_study.toString()} onValueChange={(v) => setForm({ ...form, year_of_study: parseInt(v) })}>
                    <SelectTrigger id="year"><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => createStudent.mutate()} 
                  disabled={createStudent.isPending || !form.college_id || !form.student_id || !form.first_name || !form.last_name || !form.email}
                >
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="college-filter">College</Label>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger id="college-filter">
                  <SelectValue placeholder="All colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-filter">Year</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger id="year-filter">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{academicStats.totalStudents || 0}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{academicStats.activeStudents || 0}</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{colleges.length}</div>
              <div className="text-sm text-muted-foreground">Colleges</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {Object.keys(academicStats.departments || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">Departments</div>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">College</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Year</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={6}>Loading students...</td>
                  </tr>
                )}
                {!isLoading && filteredStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {student.student_id}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{student.colleges.name}</div>
                        <div className="text-sm text-muted-foreground">{student.colleges.code}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{student.department || '-'}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getYearColor(student.year_of_study)} text-xs`}>
                        {student.year_of_study ? `${student.year_of_study} Year` : '-'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(student.is_active)} text-xs`}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Academic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>📊 Students by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((year) => (
                <div key={year} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{year}st Year</span>
                  </div>
                  <Badge className={getYearColor(year)}>
                    {academicStats.byYear?.[year] || 0} students
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>🏛️ Top Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(academicStats.departments || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{dept}</span>
                    </div>
                    <Badge variant="outline">
                      {count} students
                    </Badge>
                  </div>
                ))}
              {Object.keys(academicStats.departments || {}).length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No department data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Academic;
