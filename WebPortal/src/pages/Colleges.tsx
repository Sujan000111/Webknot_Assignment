import { useState } from "react";
import { Search, Download, Upload, Building2, Filter, MoreHorizontal, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Colleges = () => {
  const [searchTerm, setSearchTerm] = useState("");

  type CollegeRow = {
    id: string;
    name: string;
    code: string;
    address: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean | null;
    created_at: string;
  };

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges", { searchTerm }],
    queryFn: async (): Promise<CollegeRow[]> => {
      const { data, error } = await supabase!
        .from("colleges")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseReady,
  });

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    contact_email: "",
    contact_phone: "",
  });

  const createCollege = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        address: form.address || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
      };
      const { error } = await supabase!.from("colleges").insert([payload]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setOpen(false);
      setForm({
        name: "",
        code: "",
        address: "",
        contact_email: "",
        contact_phone: "",
      });
    },
  });

  const filteredColleges = colleges.filter((college) => {
    return (
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (college.contact_email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (college.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (isActive: boolean | null) => {
    if (isActive) return "bg-success text-success-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Colleges</h1>
          <p className="text-muted-foreground">Manage college registrations and institutional details</p>
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
                <Building2 className="mr-2 h-4 w-4" />
                Add College
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create College</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">College Name</Label>
                  <Input 
                    id="name" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g., MVJ College of Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="code">College Code</Label>
                  <Input 
                    id="code" 
                    value={form.code} 
                    onChange={(e) => setForm({ ...form, code: e.target.value })} 
                    placeholder="e.g., MVJCE"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    placeholder="Full college address"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input 
                    id="contact_email" 
                    type="email" 
                    value={form.contact_email} 
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })} 
                    placeholder="admin@college.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input 
                    id="contact_phone" 
                    value={form.contact_phone} 
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} 
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => createCollege.mutate()} 
                  disabled={createCollege.isPending || !form.name || !form.code}
                >
                  {createCollege.isPending ? "Creating..." : "Create"}
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
                  placeholder="Search colleges by name, code, email, or address..."
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
              <div className="text-2xl font-bold text-primary">{colleges.length}</div>
              <div className="text-sm text-muted-foreground">Total Colleges</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{colleges.filter(c => c.is_active).length}</div>
              <div className="text-sm text-muted-foreground">Active Colleges</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">-</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">-</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colleges Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>College Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">College</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Students</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={7}>Loading colleges...</td>
                  </tr>
                )}
                {!isLoading && filteredColleges.map((college, index) => (
                  <tr key={college.id} className="border-b border-border hover:bg-muted/50 transition-colors animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{college.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {college.id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono">
                        {college.code}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {college.contact_email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">{college.contact_email}</span>
                          </div>
                        )}
                        {college.contact_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">{college.contact_phone}</span>
                          </div>
                        )}
                        {!college.contact_email && !college.contact_phone && (
                          <span className="text-sm text-muted-foreground">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {college.address ? (college.address.length > 50 ? `${college.address.slice(0, 50)}...` : college.address) : 'No address'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(college.is_active)} text-xs`}>
                        {college.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-primary">-</div>
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

      {/* Recent Activity */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>🏛️ Recently Added Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colleges.slice(0, 3).map((college) => (
              <div key={college.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{college.name}</div>
                    <div className="text-sm text-muted-foreground">{college.code}</div>
                  </div>
                </div>
              </div>
            ))}
            {colleges.length === 0 && (
              <div className="text-center text-muted-foreground col-span-3">No colleges found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Colleges;
