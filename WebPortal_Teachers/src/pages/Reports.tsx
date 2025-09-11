import { useState, useRef } from "react";
import { BarChart, LineChart, Download, Calendar, TrendingUp, Users, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Reports = () => {
  const [dateRange, setDateRange] = useState("last30days");
  const reportRef = useRef<HTMLDivElement>(null);

  // PDF Export Function - Complete Report with Colors and Charts
  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 295;
      let yPosition = 20;
      const lineHeight = 7;
      const sectionSpacing = 15;

      // Color palette
      const colors = {
        primary: '#1e40af',
        secondary: '#059669',
        accent: '#dc2626',
        warning: '#d97706',
        info: '#7c3aed',
        success: '#16a34a',
        lightBlue: '#dbeafe',
        lightGreen: '#dcfce7',
        lightRed: '#fee2e2',
        lightPurple: '#f3e8ff',
        lightOrange: '#fed7aa',
        border: '#e5e7eb',
        text: '#374151',
        muted: '#6b7280'
      };

      // Helper function to add colored section header
      const addSectionHeader = (text: string, color: string = colors.primary) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Background rectangle
        pdf.setFillColor(color);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
        
        // Header text
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#ffffff');
        pdf.text(text, 20, yPosition + 2);
        
        yPosition += 15;
      };

      // Helper function to add text with word wrap and colors
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = colors.text) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        
        const lines = pdf.splitTextToSize(text, pageWidth - 40);
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        }
      };

      // Helper function to add metric card
      const addMetricCard = (title: string, value: string, color: string, bgColor: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Card background
        pdf.setFillColor(bgColor);
        pdf.roundedRect(20, yPosition - 5, 80, 20, 3, 3, 'F');
        
        // Card border
        pdf.setDrawColor(color);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(20, yPosition - 5, 80, 20, 3, 3, 'S');
        
        // Title
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.muted);
        pdf.text(title, 25, yPosition + 2);
        
        // Value
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(color);
        pdf.text(value, 25, yPosition + 8);
        
        yPosition += 25;
      };

      // Helper function to add colorful table
      const addColorfulTable = (headers: string[], rows: string[][], title: string, headerColor: string = colors.primary) => {
        addText(title, 14, true, headerColor);
        yPosition += 5;

        const colWidths = [60, 40, 30, 30, 30];
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const startX = 20;

        // Table header background
        pdf.setFillColor(headerColor);
        pdf.rect(startX, yPosition - 3, tableWidth, 8, 'F');
        
        // Table header text
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#ffffff');
        
        let xPos = startX;
        headers.forEach((header, index) => {
          pdf.text(header, xPos + 2, yPosition + 2);
          xPos += colWidths[index];
        });
        yPosition += 10;

        // Table rows with alternating colors
        pdf.setFont('helvetica', 'normal');
        rows.forEach((row, rowIndex) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Alternating row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor('#f9fafb');
            pdf.rect(startX, yPosition - 3, tableWidth, 6, 'F');
          }
          
          // Row border
          pdf.setDrawColor(colors.border);
          pdf.setLineWidth(0.2);
          pdf.rect(startX, yPosition - 3, tableWidth, 6, 'S');
          
          xPos = startX;
          pdf.setTextColor(colors.text);
          row.forEach((cell, index) => {
            pdf.text(cell, xPos + 2, yPosition + 2);
            xPos += colWidths[index];
          });
          yPosition += 8;
        });
        yPosition += sectionSpacing;
      };

      // Helper function to add simple bar chart
      const addBarChart = (title: string, data: {label: string, value: number}[], maxValue: number) => {
        addText(title, 14, true, colors.info);
        yPosition += 5;

        const chartWidth = 120;
        const chartHeight = 40;
        const barWidth = chartWidth / data.length - 2;
        const startX = 20;

        // Chart background
        pdf.setFillColor('#f8fafc');
        pdf.rect(startX, yPosition, chartWidth, chartHeight, 'F');
        pdf.setDrawColor(colors.border);
        pdf.setLineWidth(0.5);
        pdf.rect(startX, yPosition, chartWidth, chartHeight, 'S');

        // Draw bars
        data.forEach((item, index) => {
          const barHeight = (item.value / maxValue) * (chartHeight - 10);
          const barX = startX + (index * (barWidth + 2)) + 1;
          const barY = yPosition + chartHeight - barHeight - 5;
          
          // Bar color based on value
          const colors_array = [colors.primary, colors.secondary, colors.accent, colors.warning, colors.info];
          const barColor = colors_array[index % colors_array.length];
          
          pdf.setFillColor(barColor);
          pdf.rect(barX, barY, barWidth, barHeight, 'F');
          
          // Value label
          pdf.setFontSize(8);
          pdf.setTextColor(colors.text);
          pdf.text(item.value.toString(), barX + barWidth/2 - 2, barY - 2);
          
          // Category label
          pdf.text(item.label.substring(0, 8), barX + barWidth/2 - 4, yPosition + chartHeight + 5);
        });

        yPosition += chartHeight + 20;
      };

      // Title Page with gradient effect
      pdf.setFillColor(colors.primary);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#ffffff');
      pdf.text('CAMPUS EVENTS', 20, 25);
      pdf.text('COMPREHENSIVE REPORT', 20, 35);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#e0e7ff');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      yPosition = 60;

      // Key Metrics Section with colorful cards
      addSectionHeader('KEY METRICS OVERVIEW', colors.secondary);
      
      // Create metric cards in a 2x2 grid
      const metricsData = [
        { title: 'Total Events', value: `${metrics.totalEvents || 0}`, color: colors.primary, bgColor: colors.lightBlue },
        { title: 'Total Registrations', value: `${metrics.totalRegistrations || 0}`, color: colors.secondary, bgColor: colors.lightGreen },
        { title: 'Attendance Rate', value: `${metrics.attendanceRate || 0}%`, color: colors.accent, bgColor: colors.lightRed },
        { title: 'Avg Feedback', value: `${metrics.avgFeedback || 0}/5.0`, color: colors.warning, bgColor: colors.lightOrange }
      ];
      
      // First row of metrics
      let currentX = 20;
      metricsData.slice(0, 2).forEach(metric => {
        pdf.setFillColor(metric.bgColor);
        pdf.roundedRect(currentX, yPosition - 5, 80, 20, 3, 3, 'F');
        pdf.setDrawColor(metric.color);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(currentX, yPosition - 5, 80, 20, 3, 3, 'S');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.muted);
        pdf.text(metric.title, currentX + 5, yPosition + 2);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(metric.color);
        pdf.text(metric.value, currentX + 5, yPosition + 8);
        
        currentX += 90;
      });
      
      yPosition += 30;
      
      // Second row of metrics
      currentX = 20;
      metricsData.slice(2, 4).forEach(metric => {
        pdf.setFillColor(metric.bgColor);
        pdf.roundedRect(currentX, yPosition - 5, 80, 20, 3, 3, 'F');
        pdf.setDrawColor(metric.color);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(currentX, yPosition - 5, 80, 20, 3, 3, 'S');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.muted);
        pdf.text(metric.title, currentX + 5, yPosition + 2);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(metric.color);
        pdf.text(metric.value, currentX + 5, yPosition + 8);
        
        currentX += 90;
      });
      
      yPosition += 35;

      // Event Popularity Report with colorful table
      if (popularity.length > 0) {
        const popularityHeaders = ['Event Name', 'Type', 'Date', 'Registrations', 'Attendance'];
        const popularityRows = popularity.slice(0, 10).map(event => [
          event.name.substring(0, 25),
          event.type.substring(0, 15),
          new Date(event.date).toLocaleDateString(),
          event.registrations.toString(),
          event.attendance.toString()
        ]);
        addColorfulTable(popularityHeaders, popularityRows, 'EVENT POPULARITY REPORT (Top 10)', colors.primary);
        
        // Add bar chart for top 5 events
        if (popularity.length >= 5) {
          const chartData = popularity.slice(0, 5).map(event => ({
            label: event.name.substring(0, 8),
            value: event.registrations
          }));
          const maxRegistrations = Math.max(...chartData.map(d => d.value));
          addBarChart('Top 5 Events by Registrations', chartData, maxRegistrations);
        }
      }

      // Student Participation Report with colorful table
      if (participation.length > 0) {
        const participationHeaders = ['Student Name', 'Department', 'Events Attended'];
        const participationRows = participation.slice(0, 15).map(student => [
          student.name.substring(0, 25),
          student.department.substring(0, 20),
          student.eventsAttended.toString()
        ]);
        addColorfulTable(participationHeaders, participationRows, 'STUDENT PARTICIPATION REPORT (Top 15)', colors.secondary);
      }

      // Top Performers with special styling
      if (topStudents.length > 0) {
        addSectionHeader('TOP PERFORMERS', colors.accent);
        
        topStudents.slice(0, 3).forEach((student, index) => {
          const badges = ['🥇', '🥈', '🥉'];
          const badgeColors = [colors.warning, colors.muted, '#cd7f32']; // Gold, Silver, Bronze
          
          // Performer card
          pdf.setFillColor(colors.lightRed);
          pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 5, 5, 'F');
          pdf.setDrawColor(colors.accent);
          pdf.setLineWidth(1);
          pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 5, 5, 'S');
          
          // Badge
          pdf.setFontSize(20);
          pdf.setTextColor(badgeColors[index]);
          pdf.text(badges[index], 30, yPosition + 8);
          
          // Student name
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.accent);
          pdf.text(student.name, 50, yPosition + 8);
          
          // Department
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.muted);
          pdf.text(`Department: ${student.department}`, 50, yPosition + 15);
          
          // Events attended
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.primary);
          pdf.text(`Events Attended: ${student.eventsAttended}`, 50, yPosition + 20);
          
          yPosition += 35;
        });
        yPosition += 10;
      }

      // Event Type Analysis with chart
      if (eventTypeStats.length > 0) {
        addSectionHeader('EVENT TYPE ANALYSIS', colors.info);
        
        // Create bar chart for event types
        const chartData = eventTypeStats.map(stat => ({
          label: stat.type.substring(0, 8),
          value: stat.count
        }));
        const maxCount = Math.max(...chartData.map(d => d.value));
        addBarChart('Events by Type', chartData, maxCount);
        
        // Detailed stats
        eventTypeStats.forEach((stat, index) => {
          // Stat card
          pdf.setFillColor(colors.lightPurple);
          pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 20, 3, 3, 'F');
          pdf.setDrawColor(colors.info);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 20, 3, 3, 'S');
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.info);
          pdf.text(`${stat.type}: ${stat.count} events`, 25, yPosition + 5);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.muted);
          pdf.text(`Avg Attendance: ${stat.avgAttendance}% | Avg Feedback: ${stat.avgFeedback}/5.0`, 25, yPosition + 12);
          
          yPosition += 25;
        });
      }

      // Footer with colorful summary
      pdf.addPage();
      yPosition = 20;
      
      // Summary header with gradient
      pdf.setFillColor(colors.primary);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#ffffff');
      pdf.text('REPORT SUMMARY', 20, 20);
      
      yPosition = 50;
      
      // Summary cards
      const summaryCards = [
        {
          title: 'Event Popularity',
          description: 'Analysis of most successful events by registration count',
          color: colors.primary,
          bgColor: colors.lightBlue
        },
        {
          title: 'Student Participation',
          description: 'Tracking of individual student engagement levels',
          color: colors.secondary,
          bgColor: colors.lightGreen
        },
        {
          title: 'Top Performers',
          description: 'Recognition of most active students',
          color: colors.accent,
          bgColor: colors.lightRed
        },
        {
          title: 'Event Type Analysis',
          description: 'Performance comparison across different event categories',
          color: colors.info,
          bgColor: colors.lightPurple
        }
      ];
      
      summaryCards.forEach((card, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Card background
        pdf.setFillColor(card.bgColor);
        pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 5, 5, 'F');
        pdf.setDrawColor(card.color);
        pdf.setLineWidth(1);
        pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 5, 5, 'S');
        
        // Card title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(card.color);
        pdf.text(card.title, 30, yPosition + 8);
        
        // Card description
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.muted);
        pdf.text(card.description, 30, yPosition + 16);
        
        yPosition += 35;
      });
      
      // System info
      yPosition += 20;
      pdf.setFillColor(colors.muted);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#ffffff');
      pdf.text('Generated by Campus Events Management System', 30, yPosition + 5);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report generated on ${new Date().toLocaleString()}`, 30, yPosition + 10);

      // Save PDF
      const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
      pdf.save(`Campus_Events_Complete_Report_${currentDate}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Get real metrics data
  const { data: metrics = {}, isLoading: loadingMetrics } = useQuery({
    queryKey: ["report-metrics", dateRange],
    queryFn: async () => {
      const [eventsResult, registrationsResult, attendanceResult, feedbackResult] = await Promise.all([
        supabase!.from("events").select("id", { count: "exact", head: true }),
        supabase!.from("registrations").select("id", { count: "exact", head: true }),
        supabase!.from("attendance").select("status"),
        supabase!.from("feedback").select("rating", { count: "exact" })
      ]);

      const totalEvents = eventsResult.count || 0;
      const totalRegistrations = registrationsResult.count || 0;
      const presentAttendance = attendanceResult.data?.filter(a => a.status === 'present').length || 0;
      const avgFeedback = feedbackResult.data?.length ? 
        feedbackResult.data.reduce((sum, f) => sum + f.rating, 0) / feedbackResult.data.length : 0;
      
      const attendanceRate = totalRegistrations > 0 ? (presentAttendance / totalRegistrations) * 100 : 0;

      return {
        totalEvents,
        totalRegistrations,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        avgFeedback: Math.round(avgFeedback * 10) / 10
      };
    },
    enabled: isSupabaseReady,
  });

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
        .rpc("get_event_type_analysis");
      if (error) throw error;
      return data as { type: string; count: number; avg_attendance: number; avg_feedback: number }[] || [];
    },
    enabled: isSupabaseReady,
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
    <div ref={reportRef} className="space-y-6 animate-fade-up">

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
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
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
                <p className="text-3xl font-bold text-primary">
                  {loadingMetrics ? "..." : metrics.totalEvents || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Active events in system</p>
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
                <p className="text-3xl font-bold text-secondary">
                  {loadingMetrics ? "..." : metrics.totalRegistrations || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Student registrations</p>
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
                <p className="text-3xl font-bold text-success">
                  {loadingMetrics ? "..." : `${metrics.attendanceRate || 0}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Overall attendance</p>
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
                <p className="text-3xl font-bold text-warning">
                  {loadingMetrics ? "..." : metrics.avgFeedback || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
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
                          stat.avg_attendance >= 85 ? 'text-success' :
                          stat.avg_attendance >= 70 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {stat.avg_attendance || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Feedback:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" />
                          <span className="font-bold text-lg">{stat.avg_feedback || 0}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stat.avg_attendance || 0}%` }}
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