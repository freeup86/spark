"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Calendar,
  MapPin,
  Star,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";

// Mock user data
const userData = {
  "sarah-chen": {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Agricultural Engineer",
    avatar: "SC",
    location: "San Francisco, CA",
    joinedDate: "January 2024",
    rating: 4.9,
    reviewCount: 34,
    bio: "Passionate agricultural engineer with 8+ years of experience in sustainable farming technologies. I specialize in IoT solutions for agriculture and have led multiple successful projects that bridge the gap between traditional farming and modern technology.",
    skills: ["IoT", "Sustainable Agriculture", "Python", "Data Analysis", "Project Management", "Research"],
    experience: [
      {
        title: "Senior Agricultural Engineer",
        company: "GreenTech Solutions",
        period: "2021 - Present",
        description: "Leading development of smart farming solutions"
      },
      {
        title: "Agricultural Research Scientist",
        company: "UC Davis",
        period: "2018 - 2021", 
        description: "Conducted research on sustainable farming practices"
      }
    ],
    education: [
      {
        degree: "M.S. Agricultural Engineering",
        school: "UC Davis",
        year: "2018"
      },
      {
        degree: "B.S. Environmental Science",
        school: "Stanford University",
        year: "2016"
      }
    ],
    projects: [
      {
        id: 1,
        title: "Sustainable Urban Farming Platform",
        role: "Owner",
        status: "In Progress",
        collaborators: 5
      },
      {
        id: 2,
        title: "Smart Irrigation System",
        role: "Collaborator", 
        status: "Completed",
        collaborators: 3
      },
      {
        id: 3,
        title: "Agricultural Data Analytics Platform",
        role: "Owner",
        status: "Completed",
        collaborators: 8
      }
    ],
    achievements: [
      "Innovation Award 2023 - Agricultural Technology",
      "Top Collaborator 2023 - Spark Platform",
      "Published 12 research papers",
      "Led 15+ successful projects"
    ]
  }
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const userId = params.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchUser = async () => {
      setLoading(true);
      
      try {
        // First try to find the user by the URL slug in mock data
        const mockUser = userData[userId as keyof typeof userData];
        if (mockUser) {
          setUser(mockUser);
          setLoading(false);
          return;
        }
        
        // If not in mock data, fetch from API
        const users = await apiService.getUsers();
        
        // Try to find user by matching the slug with their name
        const foundUser = users.find((u: any) => {
          const userSlug = u.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
          return userSlug === userId;
        });
        
        if (foundUser) {
          // Transform API user data to match profile format
          const transformedUser = {
            id: userId,
            actualId: foundUser.id, // Store the real UUID for messaging
            name: foundUser.name,
            role: foundUser.role || "User",
            avatar: foundUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            location: "Remote", // Default location
            joinedDate: new Date(foundUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            rating: 4.5, // Default rating
            reviewCount: 0,
            bio: `Passionate ${foundUser.role || "professional"} dedicated to innovation and collaboration.`,
            skills: ["Innovation", "Collaboration", "Problem Solving", "Communication"],
            experience: [
              {
                title: foundUser.role || "Professional",
                company: "Spark Platform",
                period: "Present",
                description: "Active member of the innovation community"
              }
            ],
            education: [],
            projects: [], // Could fetch user's ideas here
            achievements: [
              "Active Spark Community Member",
              `Joined ${new Date(foundUser.createdAt).toLocaleDateString()}`
            ]
          };
          
          setUser(transformedUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, mounted]);

  const handleMessage = () => {
    // Navigate to messages with this user's actual ID
    if (user.actualId) {
      router.push(`/messages?user=${user.actualId}`);
    } else {
      // Fallback for mock users
      router.push(`/messages?user=${userId}`);
    }
  };

  const handleCollaborate = () => {
    // Navigate to the user's first active project if they have one
    const activeProject = user.projects.find((p: any) => p.status === "In Progress");
    if (activeProject) {
      router.push(`/ideas/${activeProject.id}`);
    } else if (user.projects.length > 0) {
      // Navigate to their most recent project
      router.push(`/ideas/${user.projects[0].id}`);
    } else {
      // If no projects, navigate to explore page to find ideas
      alert("This user doesn't have any active projects. Check out the explore page to find ideas to collaborate on!");
      router.push('/explore');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Link href="/collaborators">
            <Button>Back to Collaborators</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Spark</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0">
                <AvatarFallback className="text-2xl">{user.avatar}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-xl text-muted-foreground mb-3">{user.role}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {user.joinedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    {user.rating} ({user.reviewCount} reviews)
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{user.bio}</p>
                
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button onClick={handleMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={handleCollaborate}>
                    <Users className="h-4 w-4 mr-2" />
                    Collaborate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.experience.map((exp: any, index: number) => (
                    <div key={index}>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                      <p className="text-sm mt-1">{exp.description}</p>
                      {index < user.experience.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.school} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.projects.map((project: any, index: number) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/ideas/${project.id}`} className="hover:underline">
                          <h3 className="font-semibold text-primary">{project.title}</h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.collaborators} collaborators
                          </span>
                        </div>
                      </div>
                      <Badge variant={project.status === "Completed" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}