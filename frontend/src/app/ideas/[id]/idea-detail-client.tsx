"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "../../../services/api";
import { socketService } from "../../../services/socket";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { Textarea } from "../../../components/ui/textarea";
import { ShareModal } from "../../../components/modals/share-modal";
import { CollaborationModal } from "../../../components/modals/collaboration-modal";
import { 
  Zap, 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  Calendar,
  User,
  Send,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

// Mock data - in real app this would come from API
const ideaData = {
  1: {
    id: 1,
    title: "Sustainable Urban Farming Platform",
    description: "A comprehensive tech-enabled solution for creating and managing vertical farms in urban spaces. This platform would reduce food miles, promote local produce, and help cities become more self-sufficient in food production. The system includes IoT sensors for monitoring plant health, automated irrigation systems, and a marketplace for connecting urban farmers with local consumers.",
    category: "Agriculture",
    author: {
      name: "Sarah Chen",
      role: "Agricultural Engineer",
      avatar: "SC"
    },
    status: "PUBLISHED",
    visibility: "PUBLIC",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    likes: 234,
    comments: 45,
    collaborators: [
      { name: "Marcus Rodriguez", role: "UX Designer", avatar: "MR" },
      { name: "Dr. Elena Kowalski", role: "Plant Scientist", avatar: "EK" },
      { name: "James Liu", role: "Product Manager", avatar: "JL" }
    ],
    tags: ["Sustainability", "IoT", "Agriculture", "Urban Planning"],
    milestones: [
      { title: "Market Research", completed: true, date: "2024-01-20" },
      { title: "Prototype Development", completed: true, date: "2024-02-15" },
      { title: "Pilot Testing", completed: false, date: "2024-03-01" },
      { title: "Launch", completed: false, date: "2024-04-01" }
    ]
  },
  2: {
    id: 2,
    title: "AI-Powered Mental Health Companion",
    description: "An intelligent chatbot that provides 24/7 mental health support using advanced natural language processing and emotional intelligence algorithms.",
    category: "Healthcare",
    author: {
      name: "Dr. Michael Roberts",
      role: "Clinical Psychologist",
      avatar: "MR"
    },
    status: "PUBLISHED",
    visibility: "PUBLIC",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-25",
    likes: 456,
    comments: 67,
    collaborators: [],
    tags: ["AI", "Mental Health", "Healthcare", "NLP"],
    milestones: []
  }
};


export function IdeaDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [collaborationModalOpen, setCollaborationModalOpen] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Alex Johnson",
      avatar: "AJ",
      content: "This is a fantastic idea! I've been working on similar IoT solutions for agriculture. Would love to collaborate on the sensor integration part.",
      timestamp: "2 hours ago",
      likes: 12
    },
    {
      id: 2,
      author: "Maria Garcia",
      avatar: "MG", 
      content: "The urban farming concept is brilliant. Have you considered partnerships with local restaurants and grocery stores for distribution?",
      timestamp: "1 day ago",
      likes: 8
    },
    {
      id: 3,
      author: "David Kim",
      avatar: "DK",
      content: "I'm a software engineer with experience in marketplace platforms. This project aligns perfectly with my interests in sustainable technology.",
      timestamp: "2 days ago",
      likes: 15
    }
  ]);
  
  const ideaId = params.id as string;

  useEffect(() => {
    const fetchIdea = async () => {
      setLoading(true);
      
      try {
        // Always try to fetch from API first (the endpoint doesn't require auth)
        const ideaData = await apiService.getIdea(ideaId);
        
        // Check if ideaData has the expected structure
        const ideaDataObj = ideaData as any;
        if (ideaDataObj && ideaDataObj.user) {
          // Transform the data to match expected format
          const transformedIdea = {
            ...ideaDataObj,
            author: {
              name: ideaDataObj.user.name || 'Unknown',
              role: ideaDataObj.user.role || 'User',
              avatar: ideaDataObj.user.name ? ideaDataObj.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'
            },
            likes: ideaDataObj._count?.votes || 0,
            comments: ideaDataObj._count?.comments || 0,
            collaborators: ideaDataObj.collaborations || [],
            milestones: []
          };
          
          setIdea(transformedIdea);
        }
        
        // Fetch comments from API (this might require auth)
        try {
          const commentsData = await apiService.getComments(ideaId);
          // Ensure no duplicate comments by ID
          const commentsArray = commentsData as any[];
          const uniqueComments = commentsArray.filter((comment: any, index: number, self: any[]) => 
            index === self.findIndex((c: any) => c.id === comment.id)
          );
          setComments(uniqueComments);
        } catch (error) {
          console.log('Could not fetch comments:', error);
          // Keep the mock comments
        }
        
        // Only connect to WebSocket if authenticated
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          // Connect to WebSocket and join idea room
          socketService.connect();
          socketService.joinIdea(ideaId);
          
          // Listen for real-time comments
          socketService.onCommentAdded((newComment) => {
            setComments(prev => {
              // Check if comment already exists to avoid duplicates
              const exists = prev.some(c => c.id === newComment.id);
              if (exists) return prev;
              return [newComment, ...prev];
            });
          });
        }
        
      } catch (error) {
        console.error('Error fetching idea:', error);
        // Fallback to mock data
        const mockIdea = ideaData[ideaId as keyof typeof ideaData] || ideaData[1];
        if (mockIdea) {
          setIdea(mockIdea);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
    
    // Cleanup on unmount
    return () => {
      socketService.leaveIdea(ideaId);
      socketService.offCommentAdded();
    };
  }, [ideaId]);

  const handleLike = async () => {
    // Check if user is authenticated and we have a real idea ID
    const token = localStorage.getItem('token');
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ideaId);
    
    if (!token || !isValidUUID) {
      // Just toggle the UI for demo purposes
      setLiked(!liked);
      if (idea) {
        setIdea({
          ...idea,
          likes: liked ? idea.likes - 1 : idea.likes + 1
        });
      }
      return;
    }
    
    try {
      if (liked) {
        await apiService.removeVote(ideaId);
        setLiked(false);
      } else {
        await apiService.voteIdea(ideaId, 'UPVOTE');
        setLiked(true);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Check if user is authenticated and we have a real idea ID
    const token = localStorage.getItem('token');
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ideaId);
    
    if (!token || !isValidUUID) {
      // Add mock comment for demo purposes
      const mockComment = {
        id: Date.now(),
        content: newComment,
        user: {
          name: "Demo User",
          email: "demo@example.com"
        },
        createdAt: new Date().toISOString(),
        likes: 0
      };
      setComments([mockComment, ...comments]);
      setNewComment("");
      console.log("Added mock comment (login to post real comments)");
      return;
    }
    
    try {
      // Send comment to API
      const comment = await apiService.createComment({
        content: newComment,
        ideaId: ideaId,
      });
      
      // Add the new comment to the list (check for duplicates)
      setComments(prev => {
        // Check if comment already exists (might have been added via WebSocket)
        const exists = prev.some(c => c.id === comment.id);
        if (exists) return prev;
        return [comment, ...prev];
      });
      setNewComment("");
      console.log("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleCommentLike = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Idea not found</h1>
          <Link href="/explore">
            <Button>Back to Explore</Button>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{idea.author.avatar}</AvatarFallback>
                  </Avatar>
                  <span>{idea.author.name}</span>
                  <span>•</span>
                  <span>{idea.author.role}</span>
                </div>
                <Badge variant="secondary">{idea.category}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={liked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                {idea.likes + (liked ? 1 : 0)}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(idea.tags || []).map((tag: any) => (
              <Badge key={tag.id || tag.name || tag} variant="outline" className="text-xs">
                {tag.name || tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {idea.description}
                </p>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts or offer to collaborate..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button type="submit" size="sm" disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </form>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const avatar = comment.user?.name 
                      ? comment.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                      : 'AU';
                    const timestamp = new Date(comment.createdAt).toLocaleString();
                    
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user?.name || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground">{timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleCommentLike(comment.id)}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              0
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge>{idea.status}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(idea.updatedAt).toLocaleDateString()}</span>
                </div>
                <Button className="w-full" onClick={() => setCollaborationModalOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Request to Collaborate
                </Button>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{idea.author.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{idea.author.name}</p>
                      <p className="text-xs text-muted-foreground">Owner • {idea.author.role}</p>
                    </div>
                  </div>
                  {idea.collaborators.map((collaborator: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{collaborator.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">Collaborator • {collaborator.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            {idea.milestones && idea.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {idea.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        ideaTitle={idea.title}
        ideaId={typeof idea.id === 'string' ? idea.id : idea.id.toString()}
      />
      
      <CollaborationModal
        open={collaborationModalOpen}
        onOpenChange={setCollaborationModalOpen}
        ideaTitle={idea.title}
        ideaId={typeof idea.id === 'string' ? idea.id : idea.id.toString()}
      />
    </div>
  );
}