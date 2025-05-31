"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiService } from "../../services/api";
import { socketService } from "../../services/socket";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  Zap, 
  ArrowLeft, 
  Send, 
  Search,
  MessageCircle
} from "lucide-react";



export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const userParam = searchParams.get("user");

  useEffect(() => {
    const initializeMessages = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(user);
        
        // Connect to WebSocket
        socketService.connect();
        
        // Listen for real-time messages
        socketService.onNewMessage((newMessage) => {
          // Only add message if it's for the current conversation
          if (selectedConversation && 
              (newMessage.senderId === selectedConversation || newMessage.receiverId === selectedConversation)) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Update conversations list
          fetchConversations();
        });
        
        // Fetch conversations
        await fetchConversations();
        
        // If userParam is provided, set that as selected conversation
        if (userParam) {
          setSelectedConversation(userParam);
          
          // Try to fetch the user info for better display
          try {
            const users = await apiService.getUsers();
            const usersArray = users as any[];
            const targetUser = usersArray.find((u: any) => u.id === userParam);
            if (targetUser) {
              setSelectedUser(targetUser);
              
              // Add to conversations if not already there
              const existingConv = conversations.find((c: any) => c.partner.id === userParam);
              if (!existingConv) {
                const newConversation = {
                  partner: {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email
                  },
                  lastMessage: {
                    content: "Start a conversation",
                    createdAt: new Date().toISOString(),
                    senderId: currentUser?.id
                  },
                  unreadCount: 0
                };
                setConversations(prev => [newConversation, ...prev]);
              }
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
        }
        
      } catch (error) {
        console.error("Error initializing messages:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeMessages();
    
    return () => {
      socketService.offNewMessage();
    };
  }, [userParam]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      
      // Update selectedUser if it's a different conversation
      if (selectedUser?.id !== selectedConversation) {
        const conv = conversations.find(c => c.partner.id === selectedConversation);
        if (conv) {
          setSelectedUser(conv.partner);
        }
      }
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const conversationsData = await apiService.getConversations();
      setConversations(conversationsData as any[]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const messagesData = await apiService.getConversation(userId);
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Transform messages to include fromMe flag
      const transformedMessages = (messagesData as any[]).map((msg: any) => ({
        ...msg,
        fromMe: msg.senderId === currentUser.id,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setMessages(transformedMessages);
      
      // Mark messages as read
      await apiService.markMessagesAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Send message via API
      const message = await apiService.sendMessage({
        content: newMessage,
        receiverId: selectedConversation,
      });

      // Add message to local state immediately for instant feedback
      const messageObj = message as any;
      const transformedMessage = {
        ...messageObj,
        fromMe: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, transformedMessage]);
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r bg-background/50 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => {
                const avatar = conversation.partner.name
                  ? conversation.partner.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : 'U';
                const timestamp = new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isFromMe = conversation.lastMessage.senderId === currentUser?.id;
                
                return (
                  <div
                    key={conversation.partner.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.partner.id
                        ? "bg-primary/10"
                        : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedConversation(conversation.partner.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{conversation.partner.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {isFromMe ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            Online
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-background/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(() => {
                        const conv = conversations.find(c => c.partner.id === selectedConversation);
                        const user = selectedUser?.id === selectedConversation ? selectedUser : conv?.partner;
                        return user?.name
                          ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                          : 'U';
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {(() => {
                        const conv = conversations.find(c => c.partner.id === selectedConversation);
                        const user = selectedUser?.id === selectedConversation ? selectedUser : conv?.partner;
                        return user?.name || 'User';
                      })()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.fromMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}