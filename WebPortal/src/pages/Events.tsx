import { useState } from "react";
import { Plus, Search, Filter, Calendar, Users, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  type EventRow = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    start_date: string;
    max_capacity: number;
    current_registrations: number;
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", { filterType, searchTerm }],
    queryFn: async (): Promise<EventRow[]> => {
      const { data, error } = await supabase!
        .from("events")
        .select("id,title,description,status,start_date,max_capacity,current_registrations")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseReady,
  });

  const eventTypes = ["All"]; // Extend when joining event_types

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Draft: "status-draft",
      Published: "status-published", 
      Active: "status-active",
      Completed: "status-completed",
      Cancelled: "status-cancelled"
    };
    return statusClasses[status as keyof typeof statusClasses] || "status-draft";
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all"; // No type until join
    return matchesSearch && matchesType;
  });

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_start: "",
    registration_end: "",
    max_capacity: 50,
    status: "draft",
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const payload = {
        title: newEvent.title,
        description: newEvent.description || null,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        registration_start: newEvent.registration_start,
        registration_end: newEvent.registration_end,
        max_capacity: Number(newEvent.max_capacity),
        status: newEvent.status as string,
      };
      const { error } = await supabase!
        .from("events")
        .insert([payload]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      setNewEvent({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        registration_start: "",
        registration_end: "",
        max_capacity: 50,
        status: "draft",
      });
    },
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage and monitor all campus events</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-academic">
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input id="max_capacity" type="number" min={1} value={newEvent.max_capacity} onChange={(e) => setNewEvent({ ...newEvent, max_capacity: Number(e.target.value || 0) })} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="start_date">Start</Label>
                <Input id="start_date" type="datetime-local" value={newEvent.start_date} onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="end_date">End</Label>
                <Input id="end_date" type="datetime-local" value={newEvent.end_date} onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="registration_start">Registration Start</Label>
                <Input id="registration_start" type="datetime-local" value={newEvent.registration_start} onChange={(e) => setNewEvent({ ...newEvent, registration_start: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="registration_end">Registration End</Label>
                <Input id="registration_end" type="datetime-local" value={newEvent.registration_end} onChange={(e) => setNewEvent({ ...newEvent, registration_end: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => createEvent.mutate()} disabled={createEvent.isPending || !newEvent.title || !newEvent.start_date || !newEvent.end_date || !newEvent.registration_start || !newEvent.registration_end}>
                {createEvent.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type.toLowerCase())}
                >
                  {type}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Events Message */}
      {!isLoading && events.length === 0 && (
        <Card className="card-elevated border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">No Events Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p>There are no events in the database. You need to create events before students can register for them.</p>
              <p>Click the "Create New Event" button above to add your first event.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && <div className="text-muted-foreground">Loading events...</div>}
        {!isLoading && filteredEvents.map((event, index) => (
          <Card key={event.id} className="card-elevated hover:shadow-card-hover transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">-</Badge>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status as string)}`}>{event.status}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{new Date(event.start_date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • -</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{event.current_registrations}/{event.max_capacity}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Registration Rate</div>
                    <div className="font-semibold text-primary">
                      {Math.round((event.current_registrations / event.max_capacity) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.current_registrations / event.max_capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{events.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {events.filter(e => e.status === 'active' || e.status === 'Active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {events.reduce((sum, e) => sum + (e.current_registrations || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Registrations</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-metric">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {events.length > 0 ? Math.round(events.reduce((sum, e) => sum + ((e.current_registrations || 0) / (e.max_capacity || 1)), 0) / events.length * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;