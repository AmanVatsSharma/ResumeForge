import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Send, 
  Bot, 
  Sparkles, 
  ChevronRight,
  Settings,
  Zap,
  X,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ResumeContent } from "@shared/schema";
import { ChatMessage } from "@/lib/ai-service";
import { 
  aiAssistantService, 
  AIModel, 
  AssistantAction 
} from "@/services/ai-assistant-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { templateRegistry, getTemplateName } from "@/components/templates";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface TemplateConfig {
  font: string;
  colorScheme: string;
  layoutStyle: string;
  showBorders: boolean;
}

interface AIAssistantSidebarProps {
  resumeContent: ResumeContent;
  templateConfig: TemplateConfig;
  onApplyChanges: (section: keyof ResumeContent, content: string) => void;
  onClose: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "👋 Hi! I'm your AI resume assistant. I can help you improve your resume content, suggest formatting changes, and optimize for ATS systems. What would you like help with today?"
};

const SUGGESTIONS = [
  "Improve my professional summary",
  "Make my experience section more impactful",
  "Optimize my resume for ATS systems",
  "Help me highlight my skills better",
  "Make my education section more impressive"
];

export function AIAssistantSidebar({
  resumeContent,
  templateConfig,
  onApplyChanges,
  onClose
}: AIAssistantSidebarProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isPremium = !!user?.isPremium;
  
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<AIModel>("gemini");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<{
    type: string;
    section?: keyof ResumeContent;
    content?: string;
    message?: string;
  } | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  const handleSend = async (message: string) => {
    if (message.trim() === "") return;
    
    // Reset any previous API errors
    setApiError(null);
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);
    setIsLoading(true);
    
    try {
      // Get current chat history
      const chatHistory = [...messages, userMessage];
      
      // Get template ID (use a default if not available)
      const templateId = "modern-1"; // Default template ID
      
      // Send to AI service
      const response = await aiAssistantService.sendMessage(
        message,
        { content: resumeContent, templateId },
        templateConfig,
        chatHistory
      );
      
      // Check if the response indicates an API configuration error
      if (response.message.includes("API key") || 
          response.message.includes("AI configuration") || 
          response.message.includes("permission")) {
        setApiError(response.message);
      }
      
      // Parse message for interactive elements
      const processedContent = processMessageForInteractiveElements(response.message);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: "assistant", content: processedContent }]);
      
      // Check for action requests in the content
      checkForActionRequests(response.message);
      
      // Handle actions if any
      if (response.action && response.action.type !== "none") {
      handleAssistantAction(response.action);
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      
      // Create a fallback response
      const errorMessage = error instanceof Error ? error.message : 
        "I'm having trouble accessing the AI service. Please check your internet connection and try again later.";
      
      const fallbackMessage = { 
        role: "assistant" as const, 
        content: errorMessage
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setApiError("Failed to connect to the AI service. Please try again later.");
      
        toast({
        title: "AI Assistant Error",
        description: "Failed to connect to the AI service. Please try again later.",
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process message to identify interactive elements
  const processMessageForInteractiveElements = (message: string): string => {
    // Look for exact pattern: "shall I update your [section] section?"
    const updatePattern = /shall i update your ([a-z]+) section\?/i;
    
    // Also check for alternative patterns
    const wouldYouLikePattern = /would you like me to (update|improve|enhance|rewrite) your ([a-z]+)(\s+section|\s+points|\s+content|\s+bullets)?\?/i;
    const shouldIPattern = /should i (update|improve|enhance|rewrite) your ([a-z]+)(\s+section|\s+points|\s+content|\s+bullets)?\?/i;
    
    // Check for the exact pattern first (primary pattern)
    if (updatePattern.test(message)) {
      const match = message.match(updatePattern);
      if (match && match[1]) {
        const section = match[1].toLowerCase() as keyof ResumeContent;
        if (section && typeof resumeContent[section] !== 'undefined') {
          setPendingActions({
            type: "updateContent",
            section,
            message: `Would you like me to update your ${section} section?`
          });
        }
      }
    } 
    // Check for alternative patterns
    else if (wouldYouLikePattern.test(message)) {
      const match = message.match(wouldYouLikePattern);
      if (match && match[2]) {
        const section = match[2].toLowerCase() as keyof ResumeContent;
        if (section && typeof resumeContent[section] !== 'undefined') {
          setPendingActions({
            type: "updateContent",
            section,
            message: `Would you like me to ${match[1]} your ${section} section?`
          });
        }
      }
    }
    else if (shouldIPattern.test(message)) {
      const match = message.match(shouldIPattern);
      if (match && match[2]) {
        const section = match[2].toLowerCase() as keyof ResumeContent;
        if (section && typeof resumeContent[section] !== 'undefined') {
          setPendingActions({
            type: "updateContent",
            section,
            message: `Should I ${match[1]} your ${section} section?`
          });
        }
      }
    }
    
    return message;
  };
  
  // Check for action requests in the content
  const checkForActionRequests = (content: string) => {
    // Look for specific patterns that might indicate the AI wants to take an action
    const updateSummaryPattern = /I can (improve|update|enhance|rewrite) your (summary|experience|education|skills)/i;
    const match = content.match(updateSummaryPattern);
    
    if (match && match[2]) {
      const section = match[2].toLowerCase() as keyof ResumeContent;
      if (resumeContent[section]) {
        setPendingActions({
          type: "updateContent",
          section,
          message: `Would you like me to update your ${section} section?`
        });
      }
    }
  };
  
  const handleAssistantAction = (action: AssistantAction) => {
    // Handle content update
    if (action.type === "updateContent") {
      const { section, content } = action;
      onApplyChanges(section, content);
      
        toast({
          title: "Content Updated",
        description: `Your ${section} section has been updated.`,
        });
    }
        
    // Handle template style update
    if (action.type === "updateStyle") {
      // This would be handled by the parent component
        toast({
          title: "Style Updated",
        description: "Your resume style has been updated.",
      });
    }
    
    // Handle template change
    if (action.type === "changeTemplate") {
      toast({
        title: "Template Change Requested",
        description: `AI suggested changing to template: ${action.templateId}`,
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };
  
  const toggleModel = (newModel: AIModel) => {
    setModel(newModel);
    
      toast({
      title: `Using ${newModel === "gemini" ? "Gemini" : "OpenAI"} Model`,
      description: `Switched to ${newModel === "gemini" ? "Google's Gemini" : "OpenAI's GPT"} AI model for responses.`,
    });
    
    // Add system message about model change
    setMessages(prev => [
      ...prev,
      { 
        role: "assistant", 
        content: `I've switched to the ${newModel === "gemini" ? "Gemini" : "OpenAI"} model. How can I help you with your resume?` 
      }
    ]);
  };
  
  const handleActionConfirmation = (confirmed: boolean) => {
    if (!pendingActions || !confirmed) {
      setPendingActions(null);
      return;
    }
    
    // Handle the confirmed action
    if (pendingActions.type === "updateContent" && pendingActions.section) {
      // Get the AI to generate the content
      handleSend(`Please update my ${pendingActions.section} section with improved content`);
    }
    
    // Clear the pending action
    setPendingActions(null);
  };
  
  return (
    <Card className="fixed inset-y-0 right-0 w-96 border-l shadow-lg rounded-none z-50">
    <div className="flex flex-col h-full">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Resume Assistant</h2>
        </div>
        
          <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>AI Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => toggleModel("gemini")} 
                  className={model === "gemini" ? "bg-accent" : ""}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gemini
                  {model === "gemini" && (
                    <Badge variant="secondary" className="ml-2">Active</Badge>
                  )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => toggleModel("openai")} 
                  className={model === "openai" ? "bg-accent" : ""}
                  disabled={!isPremium}
                >
                  <Zap className="h-4 w-4 mr-2" />
                OpenAI
                  {!isPremium && (
                    <Badge variant="outline" className="ml-2">Premium</Badge>
                  )}
                  {model === "openai" && (
                    <Badge variant="secondary" className="ml-2">Active</Badge>
                  )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "mb-4 p-3 rounded-lg max-w-[85%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              )}
            >
              {/* Render message content as markdown with GitHub-flavored markdown */}
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-md font-bold mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props} />
                      : <code className="block bg-muted p-2 rounded text-sm my-2 whitespace-pre-wrap" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Pending actions UI with Yes/No buttons */}
          {pendingActions && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">{pendingActions.message}</p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => handleActionConfirmation(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center" 
                  onClick={() => handleActionConfirmation(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  No
                </Button>
              </div>
            </div>
          )}
          
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">AI Service Error</p>
                  <p>{apiError}</p>
                </div>
              </div>
        </div>
          )}
          
          {showSuggestions && messages.length === 1 && (
            <div className="my-6">
              <h3 className="text-sm font-medium mb-2">Try asking about:</h3>
              <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                    className="justify-start text-left h-auto py-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                    <span className="line-clamp-1">{suggestion}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
      
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask me anything about your resume..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !!apiError}
          />
            <Button type="submit" size="icon" disabled={isLoading || !!apiError}>
              <Send className="h-4 w-4" />
          </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2">
            <p>
              {isPremium 
                ? "Premium access: Unlimited AI assistant usage" 
                : "Free tier: Limited to 10 messages per day"}
            </p>
          </div>
        </div>
    </div>
      </Card>
  );
} 