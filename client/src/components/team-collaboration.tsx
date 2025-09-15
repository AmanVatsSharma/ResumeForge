import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  MessageSquare,
  Eye,
  Edit,
  Share2,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  UserPlus,
  Settings,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for team collaboration
const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "HR Manager",
    avatar: "SC",
    status: "online",
    lastActive: "2 minutes ago",
    permissions: ["view", "edit", "comment"]
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "michael.r@company.com",
    role: "Recruiter",
    avatar: "MR",
    status: "away",
    lastActive: "15 minutes ago",
    permissions: ["view", "comment"]
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.j@company.com",
    role: "Career Coach",
    avatar: "EJ",
    status: "offline",
    lastActive: "1 hour ago",
    permissions: ["view", "edit", "comment", "admin"]
  }
];

const mockResumes = [
  {
    id: 1,
    title: "Senior Software Engineer - John Doe",
    owner: "John Doe",
    lastModified: "2 hours ago",
    status: "review",
    collaborators: 3,
    comments: 5,
    version: "v2.1"
  },
  {
    id: 2,
    title: "Marketing Manager - Jane Smith",
    owner: "Jane Smith",
    lastModified: "1 day ago",
    status: "approved",
    collaborators: 2,
    comments: 2,
    version: "v1.3"
  },
  {
    id: 3,
    title: "Product Designer - Alex Wilson",
    owner: "Alex Wilson",
    lastModified: "3 days ago",
    status: "draft",
    collaborators: 1,
    comments: 0,
    version: "v1.0"
  }
];

const mockComments = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    content: "Great work on the technical skills section! Consider adding more quantifiable achievements.",
    timestamp: "2 hours ago",
    type: "suggestion"
  },
  {
    id: 2,
    author: "Michael Rodriguez",
    avatar: "MR",
    content: "The summary could be more concise. Try to keep it under 3 sentences.",
    timestamp: "1 hour ago",
    type: "feedback"
  },
  {
    id: 3,
    author: "Emily Johnson",
    avatar: "EJ",
    content: "Approved! This resume is ready for submission.",
    timestamp: "30 minutes ago",
    type: "approval"
  }
];

export default function TeamCollaboration() {
  const [selectedResume, setSelectedResume] = useState(mockResumes[0]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case "suggestion": return <Star className="h-4 w-4 text-yellow-500" />;
      case "feedback": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "approval": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Collaboration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collaborate with your team on resume creation and review
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Team Settings
          </Button>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team and collaborate on resumes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input placeholder="colleague@company.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <Textarea placeholder="Add a personal message..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowInviteDialog(false)}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
              <Badge variant="secondary">{mockTeamMembers.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTeamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={`/avatars/${member.avatar.toLowerCase()}.jpg`} />
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                    member.status === 'online' ? 'bg-green-500' : 
                    member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{member.lastActive}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Remove Member</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Resumes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shared Resumes</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockResumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedResume.id === resume.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedResume(resume)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{resume.title}</h3>
                        <Badge className={getStatusColor(resume.status)}>
                          {resume.status}
                        </Badge>
                        <Badge variant="outline">{resume.version}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{resume.collaborators} collaborators</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{resume.comments} comments</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{resume.lastModified}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments & Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing Comments */}
            {mockComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex space-x-3 p-4 border rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={`/avatars/${comment.avatar.toLowerCase()}.jpg`} />
                  <AvatarFallback>{comment.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{comment.timestamp}</span>
                    {getCommentIcon(comment.type)}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Add New Comment */}
            <div className="flex space-x-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <Avatar>
                <AvatarImage src="/avatars/me.jpg" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Add a comment or feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="approval">Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Bell className="mr-1 h-3 w-3" />
                      Notify Team
                    </Button>
                    <Button size="sm" disabled={!newComment.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}