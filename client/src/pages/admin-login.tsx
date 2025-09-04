import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user is already authenticated
  const sessionToken = localStorage.getItem("adminSessionToken");
  const { data: adminData, isLoading: checkingAuth } = useQuery({
    queryKey: ["/api/admin/verify", sessionToken],
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
        localStorage.removeItem("adminSessionToken");
        localStorage.removeItem("adminUsername");
        throw new Error("Authentication failed");
      }
      
      return response.json();
    },
    retry: false,
    enabled: !!sessionToken,
  });

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (adminData && !checkingAuth) {
      setLocation("/admin");
    }
  }, [adminData, checkingAuth, setLocation]);

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
              <p>Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/admin/login", { username, password });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store session token in localStorage
      localStorage.setItem("adminSessionToken", data.sessionToken);
      localStorage.setItem("adminUsername", data.username);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });

      // Redirect to admin dashboard
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-admin-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </div>
  );
}