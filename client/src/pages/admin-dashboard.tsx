import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Student } from "@shared/schema";
import FileUpload from "@/components/file-upload";

// Hook to check admin authentication
function useAdminAuth() {
  const sessionToken = localStorage.getItem("adminSessionToken");
  
  return useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      if (!sessionToken) {
        throw new Error("No session token");
      }
      
      const response = await fetch("/api/admin/verify", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      
      return response.json();
    },
    retry: false,
  });
}

export default function AdminDashboard() {
  const { data: adminData, isLoading: authLoading, error: authError } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Student data query
  const { data: students = [], refetch: refetchStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    enabled: !!adminData, // Only fetch if authenticated
  });

  // Clear all students mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch("/api/admin/students/all", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to clear students");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All student data has been cleared",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear student data",
        variant: "destructive",
      });
    },
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      if (sessionToken) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("adminSessionToken");
      localStorage.removeItem("adminUsername");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all student data? This action cannot be undone.")) {
      clearAllMutation.mutate();
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && authError) {
      setLocation("/admin/login");
    }
  }, [authLoading, authError, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (authError || !adminData) {
    return null; // Will redirect to login
  }

  const totalStudents = students.length;
  const mcaStudents = students.filter(s => s.course === "MCA").length;
  const batches = Array.from(new Set(students.map(s => s.batch)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {adminData.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-view-directory"
              >
                <i className="fas fa-eye mr-2"></i>
                View Directory
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                {totalStudents}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MCA Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground" data-testid="text-mca-students">
                {mcaStudents}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground" data-testid="text-active-batches">
                {batches.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-upload text-blue-600"></i>
                Import Student Data
              </CardTitle>
              <CardDescription>
                Upload CSV or XLSX files to add student data to the directory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUploadComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/students"] });
                  refetchStudents();
                }}
                adminMode={true}
              />
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-cogs text-orange-600"></i>
                Data Management
              </CardTitle>
              <CardDescription>
                Manage and organize student directory data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  disabled={clearAllMutation.isPending || totalStudents === 0}
                  data-testid="button-clear-all-students"
                >
                  <i className="fas fa-trash mr-2"></i>
                  {clearAllMutation.isPending ? "Clearing..." : "Clear All Student Data"}
                </Button>
                
                {totalStudents === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No student data to clear
                  </p>
                )}
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-2">Quick Stats</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• {totalStudents} students in database</p>
                  <p>• {batches.join(", ") || "No batches"} active</p>
                  <p>• Data updates accumulate on import</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}