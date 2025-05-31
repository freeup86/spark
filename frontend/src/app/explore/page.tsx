"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowRight, TrendingUp, Clock, Users, Zap, LogOut, ArrowLeft } from "lucide-react";
import { apiService } from "../../services/api";

const mockIdeas = [
  {
    id: 1,
    title: "Sustainable Urban Farming Platform",
    description: "A tech-enabled solution for creating vertical farms in urban spaces, reducing food miles and promoting local produce.",
    category: "Agriculture",
    author: "Sarah Chen",
    likes: 234,
    collaborators: 12,
    status: "In Progress",
  },
  {
    id: 2,
    title: "AI-Powered Mental Health Companion",
    description: "An intelligent chatbot that provides 24/7 mental health support using advanced NLP and emotional intelligence.",
    category: "Healthcare",
    author: "Dr. Michael Roberts",
    likes: 456,
    collaborators: 8,
    status: "Seeking Collaborators",
  },
  {
    id: 3,
    title: "Blockchain-Based Carbon Credit System",
    description: "Transparent carbon credit trading platform using blockchain technology to combat climate change.",
    category: "Environment",
    author: "Elena Rodriguez",
    likes: 189,
    collaborators: 15,
    status: "Prototype",
  },
  {
    id: 4,
    title: "Educational VR Experience Platform",
    description: "Immersive virtual reality experiences for enhanced learning in schools and universities.",
    category: "Education",
    author: "James Liu",
    likes: 342,
    collaborators: 6,
    status: "Funded",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ["All Categories", "Technology", "Healthcare", "Environment", "Education", "Agriculture"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const ideasData = await apiService.getIdeas(0, 50);
      
      // Transform API data to match our display format
      const transformedIdeas = (ideasData as any[]).map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        author: idea.user?.name || 'Unknown',
        likes: idea._count?.votes || 0,
        collaborators: idea._count?.collaborations || 0,
        status: idea.status === 'PUBLISHED' ? 'In Progress' : idea.status,
      }));
      
      setIdeas(transformedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      // Fall back to mock data if API fails
      setIdeas(mockIdeas);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const filteredIdeas = selectedCategory === "All Categories" 
    ? ideas 
    : ideas.filter(idea => idea.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Spark</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user?.name || "User"}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Explore Innovative Ideas</h1>
          <p className="text-xl text-muted-foreground">
            Discover groundbreaking projects from our global community of innovators. 
            Join collaborative efforts or get inspired for your next big idea.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex gap-4 flex-wrap">
          {categories.map((category) => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Ideas Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading ideas...</div>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No ideas found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory === "All Categories" 
                ? "Be the first to share an idea!" 
                : `No ideas in ${selectedCategory} category yet.`}
            </p>
            {isAuthenticated && (
              <Link href="/ideas/new">
                <Button>Create New Idea</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                    <CardDescription className="mt-1">
                      by {idea.author} • {idea.category}
                    </CardDescription>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {idea.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{idea.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {idea.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {idea.collaborators}
                  </span>
                </div>
                <Link href={`/ideas/${idea.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Details <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          </div>
        )}
      </section>
    </div>
  );
}