"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft, TrendingUp, Target, Clock, Award } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    collaborations: number;
    comments: number;
    votes: number;
  };
}

export function ProgressClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    draft: 0,
  });

  useEffect(() => {
    const fetchUserProjects = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        const userProjects = await apiService.getUserIdeas(user.id);
        
        setProjects(userProjects);
        
        // Calculate stats
        const completed = userProjects.filter((p: any) => p.status === 'COMPLETED').length;
        const inProgress = userProjects.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PUBLISHED').length;
        const draft = userProjects.filter((p: any) => p.status === 'DRAFT').length;
        
        setStats({
          total: userProjects.length,
          completed,
          inProgress,
          draft,
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [router]);

  const getProjectProgress = (project: Project) => {
    // Calculate progress based on status and age
    switch (project.status) {
      case 'COMPLETED':
        return 100;
      case 'ARCHIVED':
        return 100;
      case 'IN_PROGRESS':
        // Calculate based on time since creation (mock calculation)
        const daysSinceCreation = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(50 + daysSinceCreation * 2, 90);
      case 'PUBLISHED':
        return 25;
      case 'DRAFT':
        return 10;
      default:
        return 0;
    }
  };

  const getProjectPhase = (project: Project) => {
    switch (project.status) {
      case 'DRAFT':
        return 'Planning';
      case 'PUBLISHED':
        return 'Seeking Collaborators';
      case 'IN_PROGRESS':
        return 'Development';
      case 'COMPLETED':
        return 'Launched';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const statsDisplay = [
    {
      label: "Total Projects",
      value: stats.total.toString(),
      icon: Target,
      change: "+2 this month",
    },
    {
      label: "Completed",
      value: stats.completed.toString(),
      icon: Award,
      change: "+1 this month",
    },
    {
      label: "In Progress",
      value: stats.inProgress.toString(),
      icon: Clock,
      change: "Active projects",
    },
    {
      label: "Success Rate",
      value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%",
      icon: TrendingUp,
      change: "Overall performance",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            My Progress
          </h1>
          <p className="text-muted-foreground">
            Track your innovation journey and project milestones
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {statsDisplay.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Projects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Projects</h2>
          
          {projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't created any projects yet.</p>
                <Link href="/dashboard">
                  <Button>Create Your First Project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => {
              const progress = getProjectProgress(project);
              const phase = getProjectPhase(project);
              
              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={project.status === "COMPLETED" ? "default" : "secondary"}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phase</p>
                        <p className="font-medium">{phase}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{project.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Team</p>
                        <p className="font-medium">{project._count.collaborations} members</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Link href={`/ideas/${project.id}`}>
                        <Button size="sm">
                          View Project
                        </Button>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{project._count.votes} votes</span>
                        <span>•</span>
                        <span>{project._count.comments} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}