"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Zap, Search, Users, MessageCircle, ArrowLeft, User } from "lucide-react";

export function CollaboratorsClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleMessage = (collaboratorId: string) => {
    router.push(`/messages?user=${collaboratorId}`);
  };

  const handleViewProfile = (collaboratorName: string) => {
    const userId = collaboratorName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    router.push(`/profile/${userId}`);
  };

  const handleViewMyProfile = () => {
    if (currentUser?.name) {
      const userId = currentUser.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
      router.push(`/profile/${userId}`);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get current user
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(user);
        
        // Fetch all users from API
        const users = await apiService.getUsers();
        
        // Filter out current user
        const otherUsers = users.filter((u: any) => u.id !== user.id);
        
        // Transform users to match collaborator format
        const transformedUsers = otherUsers.map((u: any, index: number) => ({
          id: u.id,
          name: u.name,
          role: u.role || "User",
          skills: ["Collaboration", "Innovation"], // Default skills for now
          bio: `${u.role || "User"} interested in collaborative innovation.`,
          activeProjects: index % 5, // Use index-based value instead of random
          completedProjects: index * 3, // Use index-based value instead of random
          rating: (4.0 + (index % 10) / 10).toFixed(1), // Use index-based value instead of random
        }));
        
        setCollaborators(transformedUsers);
        setFilteredCollaborators(transformedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Set some fallback data if API fails
        setCollaborators([]);
        setFilteredCollaborators([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = collaborators.filter(
      (collaborator) =>
        collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.skills.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredCollaborators(filtered);
  }, [searchTerm, collaborators]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Spark</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Users className="h-8 w-8" />
                Find Collaborators
              </h1>
              <p className="text-muted-foreground">
                Connect with talented individuals to bring your ideas to life
              </p>
            </div>
            {currentUser && (
              <Button variant="outline" onClick={handleViewMyProfile}>
                <User className="h-4 w-4 mr-2" />
                View My Profile
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Collaborators Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading collaborators...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollaborators.map((collaborator) => (
              <Card key={collaborator.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{collaborator.name}</CardTitle>
                <CardDescription>{collaborator.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {collaborator.bio}
                </p>
                
                <div>
                  <p className="text-sm font-medium mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {collaborator.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Active: {collaborator.activeProjects}</span>
                  <span>Completed: {collaborator.completedProjects}</span>
                  <span>Rating: ⭐ {collaborator.rating}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleMessage(collaborator.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewProfile(collaborator.name)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {filteredCollaborators.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No collaborators found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}