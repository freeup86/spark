"use client";

import { useState } from "react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CollaborationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaTitle: string;
  ideaId: string;
}

const skillAreas = [
  "Software Development",
  "Product Design",
  "Marketing",
  "Business Strategy", 
  "Data Science",
  "Research",
  "Sales",
  "Operations",
  "Finance",
  "Legal",
  "Other"
];

export function CollaborationModal({ open, onOpenChange, ideaTitle, ideaId }: CollaborationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skillArea: "",
    message: "",
    commitment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create collaboration request via API
      await apiService.createCollaboration({
        ideaId,
        skillArea: formData.skillArea,
        message: formData.message,
        commitment: formData.commitment
      });

      // Show success message
      alert("Collaboration request sent successfully! The idea owner will review your request.");
      
      onOpenChange(false);
      setFormData({ skillArea: "", message: "", commitment: "" });
    } catch (error) {
      console.error("Error sending collaboration request:", error);
      alert("Failed to send collaboration request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request to Collaborate</DialogTitle>
          <DialogDescription>
            Send a collaboration request for "{ideaTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-area">What can you contribute?</Label>
            <Select
              value={formData.skillArea}
              onValueChange={(value) =>
                setFormData({ ...formData, skillArea: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your skill area" />
              </SelectTrigger>
              <SelectContent>
                {skillAreas.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Why do you want to collaborate?</Label>
            <Textarea
              id="message"
              placeholder="Tell the idea owner why you're interested and what you can bring to the project..."
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commitment">Time commitment</Label>
            <Select
              value={formData.commitment}
              onValueChange={(value) =>
                setFormData({ ...formData, commitment: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="How much time can you dedicate?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5 hours/week">1-5 hours per week</SelectItem>
                <SelectItem value="5-10 hours/week">5-10 hours per week</SelectItem>
                <SelectItem value="10-20 hours/week">10-20 hours per week</SelectItem>
                <SelectItem value="20+ hours/week">20+ hours per week</SelectItem>
                <SelectItem value="full-time">Full-time commitment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}