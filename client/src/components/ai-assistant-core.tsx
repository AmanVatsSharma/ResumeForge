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
  XCircle,
  Crown
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
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

// Define the types of modes the assistant can operate in
export type AssistantMode = 'resume' | 'generate';

// Ensure we're using the correct type for ResumeContent 
// This matches the schema that the backend expects
type CustomResumeContent = {
  summary: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: string;
  education: string;
  skills: string;
  [key: string]: any; // Allow for additional fields
};

interface TemplateConfig {
  font: string;
  colorScheme: string;
  layoutStyle: string;
  showBorders: boolean;
}

// Unified props interface that handles both use cases
interface AIAssistantCoreProps {
  // Mode determines behavior (resume editor or content generator)
  mode: AssistantMode;
  
  // For both modes
  onClose: () => void;
  
  // For resume mode
  resumeContent?: Partial<CustomResumeContent>;
  templateConfig?: TemplateConfig;
  onApplyChanges?: (section: keyof ResumeContent, content: string) => void;
  
  // For generator mode
  currentSection?: string;
  currentValue?: string;
  onUpdateContent?: (content: string) => void;
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  
  // Form control
  onFormSubmit?: () => void;
}

const WELCOME_MESSAGES = {
  resume: "👋 Hi! I'm your AI resume assistant. I can help you improve your resume content, suggest formatting changes, and optimize for ATS systems. What would you like help with today?",
  generate: "👋 Hi! I'm your AI resume content assistant. I can help you write compelling content for each section of your resume. Let me know what you're looking for, and I can suggest improvements or create content from scratch."
};

const SUGGESTIONS = {
  resume: [
    "Improve my professional summary",
    "Make my experience section more impactful",
    "Optimize my resume for ATS systems",
    "Help me highlight my skills better",
    "Make my education section more impressive"
  ],
  generate: [
    "Write a professional summary for me",
    "Make this experience bullet more impactful",
    "Add quantifiable achievements to this point",
    "Help me highlight these skills better",
    "Improve this education section"
  ]
};

// Add type for markdown components
type MarkdownComponents = {
  [nodeType: string]: React.ComponentType<any>;
};

export function AIAssistantCore({
  mode,
  onClose,
  resumeContent = {},
  templateConfig = {
    font: "font-inter",
    colorScheme: "default",
    layoutStyle: "classic",
    showBorders: true
  },
  onApplyChanges,
  currentSection = '',
  currentValue = '',
  onUpdateContent,
  jobTitle,
  industry,
  experienceLevel,
  onFormSubmit
}: AIAssistantCoreProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isPremium = !!user?.isPremium;
  
  const [messages, setMessages] = useState<ChatMessage[]>([{ 
    role: "assistant", 
    content: WELCOME_MESSAGES[mode] 
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<AIModel>("gemini");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Message limit for free tier
  const [messageCount, setMessageCount] = useState(1); // Start at 1 for the welcome message
  const MESSAGE_LIMIT = 10;
  const [limitReached, setLimitReached] = useState(false);
  
  // For resume mode
  const [pendingActions, setPendingActions] = useState<{
    type: string;
    section?: keyof ResumeContent;
    content?: string;
    message?: string;
  } | null>(null);
  
  // For generator mode
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Load message count from local storage
  useEffect(() => {
    if (!isPremium) {
      const savedCount = localStorage.getItem('aiAssistantMessageCount');
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        setMessageCount(count);
        setLimitReached(count >= MESSAGE_LIMIT);
      }
    }
  }, [isPremium]);
  
  // Save message count to local storage when it changes
  useEffect(() => {
    if (!isPremium) {
      localStorage.setItem('aiAssistantMessageCount', messageCount.toString());
      if (messageCount >= MESSAGE_LIMIT) {
        setLimitReached(true);
      }
    }
  }, [messageCount, isPremium]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // For generator mode: Update when current section or value changes
  useEffect(() => {
    if (mode === 'generate' && currentSection) {
      setMessages(prev => {
        // Only add if the last message isn't already about this section
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === "assistant" && 
            lastMessage.content.includes(`Now helping you with the ${currentSection} section`)) {
          return prev;
        }
        
        return [
          ...prev, 
          { 
            role: "assistant", 
            content: `Now helping you with the ${currentSection} section. ${currentValue ? "Here's what you have so far:" : "You haven't added any content yet."}`
          }
        ];
      });
    }
  }, [mode, currentSection, currentValue]);
  
  const handleSend = async (message: string) => {
    if (message.trim() === "") return;
    
    // Check for message limit for free users
    if (!isPremium && messageCount >= MESSAGE_LIMIT) {
      setLimitReached(true);
      toast({
        title: "Message Limit Reached",
        description: "You've reached the free tier limit of 10 messages. Upgrade to premium for unlimited AI assistance.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset any previous API errors
    setApiError(null);
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);
    setIsLoading(true);
    
    // Increment message count for free users
    if (!isPremium) {
      setMessageCount(prev => prev + 1);
    }
    
    try {
      let response;
      
      // Different handling based on mode
      if (mode === 'resume') {
        // Get current chat history
        const chatHistory = [...messages, userMessage];
        
        // Get template ID (use a default if not available)
        const templateId = "modern-1"; // Default template ID
        
        // Create a valid resume content object with required fields
        const validResumeContent: any = {
          summary: resumeContent.summary || "",
          personalInfo: resumeContent.personalInfo || { 
            fullName: "", 
            email: "", 
            phone: "", 
            location: "" 
          },
          experience: resumeContent.experience || "",
          education: resumeContent.education || "",
          skills: resumeContent.skills || "",
          ...resumeContent // Include any other fields
        };
        
        // Send to AI service
        response = await aiAssistantService.sendMessage(
          message,
          { content: validResumeContent, templateId },
          templateConfig as any, // Type casting to avoid type errors
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
      } else {
        // For generator mode
        // Construct context about the current section
        const contextMessage = `
I'm helping a user with the ${currentSection} section of their resume.
${jobTitle ? `They are targeting a ${jobTitle} position.` : ''}
${industry ? `The industry is ${industry}.` : ''}
${experienceLevel ? `Their experience level is ${experienceLevel}.` : ''}

Current content:
${currentValue || "(No content yet)"}

User message: ${message}

Respond in a conversational tone. If you're suggesting new or improved content, please clearly indicate the new content that should replace the current content. You can also ask if they want you to replace their current content with your suggestion.
`;
        
        // Send request to backend
        const apiResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: contextMessage,
            resumeState: {
              content: {
                [currentSection]: currentValue
              },
              templateId: "basic" // Placeholder
            },
            chatHistory: [],
            model
          }),
        });
        
        if (!apiResponse.ok) {
          throw new Error(`Failed to get AI response: ${apiResponse.status}`);
        }
        
        const data = await apiResponse.json();
        
        // Check if the response contains content suggestions
        if (data.response) {
          // First check if the response contains a clear question about updating content
          const hasUpdateQuestion = 
            (/shall i update your ([a-z]+) section\?/i).test(data.response) ||
            (/would you like me to (update|improve|enhance|rewrite) your/i).test(data.response) ||
            (/should i (update|improve|enhance|rewrite) your/i).test(data.response);
          
          // Add AI response to chat
          setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
          
          // Check if the AI is suggesting new content
          if (data.updates?.content?.[currentSection]) {
            const suggestedContent = data.updates.content[currentSection];
            
            // Store the suggested content as pending
            setPendingContent(suggestedContent);
            
            // Only add an additional message if there's no clear question in the response
            if (!hasUpdateQuestion) {
              // Add a follow-up message asking if they want to apply the changes
              setMessages(prev => [
                ...prev, 
                { 
                  role: "assistant", 
                  content: "Would you like me to update your content with this suggestion?" 
                }
              ]);
            }
          }
        } else {
          // Fallback for unexpected response format
          setMessages(prev => [
            ...prev, 
            { 
              role: "assistant", 
              content: "I processed your request, but couldn't generate a proper response. Please try again."
            }
          ]);
        }
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

  // For resume mode: Process message to identify interactive elements
  const processMessageForInteractiveElements = (message: string): string => {
    if (mode !== 'resume') return message;
    
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
  
  // For resume mode: Check for action requests in the content
  const checkForActionRequests = (content: string) => {
    if (mode !== 'resume') return;
    
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
  
  // For resume mode: Handle assistant actions
  const handleAssistantAction = (action: AssistantAction) => {
    if (mode !== 'resume' || !onApplyChanges) return;
    
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
  
  // For generator mode: Handle content confirmation
  const handleContentActionConfirmation = (confirmed: boolean) => {
    if (mode !== 'generate' || !pendingContent || !confirmed || !onUpdateContent) {
      setPendingContent(null);
      
      if (mode === 'generate') {
        setMessages(prev => [
          ...prev, 
          { 
            role: "user", 
            content: "No, keep my current content." 
          }
        ]);
        
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: "No problem. I'll keep your current content. Is there anything else you'd like help with?" 
          }
        ]);
      }
      return;
    }
    
    // Apply the suggested content
    onUpdateContent(pendingContent);
    
    // Add confirmation messages
    setMessages(prev => [
      ...prev, 
      { 
        role: "user", 
        content: "Yes, update my content." 
      }
    ]);
    
    setMessages(prev => [
      ...prev, 
      { 
        role: "assistant", 
        content: "Great! I've updated your content. Let me know if you'd like to make any other improvements." 
      }
    ]);
    
    // Clear the pending content
    setPendingContent(null);
    
    toast({
      title: "Content Updated",
      description: `Your ${currentSection} has been updated.`,
    });
  };
  
  // For resume mode: Handle action confirmation (yes/no buttons)
  const handleResumeActionConfirmation = (confirmed: boolean) => {
    if (mode !== 'resume' || !pendingActions || !confirmed) {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Call onFormSubmit if provided
    if (onFormSubmit) onFormSubmit();
    
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
  
  return (
    <Card className="fixed inset-y-0 right-0 w-96 border-l shadow-lg rounded-none z-50">
      <div className="flex flex-col h-full">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">
              {mode === 'resume' ? 'Resume Assistant' : 'Content Assistant'}
            </h2>
            {mode === 'generate' && currentSection && (
              <Badge variant="outline" className="ml-2">
                {currentSection}
              </Badge>
            )}
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
                  code: ({node, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInlineCode = !match && !className;
                    
                    return isInlineCode 
                      ? <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
                      : <code className="block bg-muted p-2 rounded text-sm my-2 whitespace-pre-wrap" {...props}>{children}</code>;
                  }
                } as MarkdownComponents}
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
          
          {/* Pending actions UI with Yes/No buttons - for resume mode */}
          {mode === 'resume' && pendingActions && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">{pendingActions.message}</p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => handleResumeActionConfirmation(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center" 
                  onClick={() => handleResumeActionConfirmation(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  No
                </Button>
              </div>
            </div>
          )}
          
          {/* Pending content confirmation with Yes/No buttons - for generator mode */}
          {mode === 'generate' && pendingContent && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">Would you like to apply this suggested content?</p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => handleContentActionConfirmation(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Yes, update
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center" 
                  onClick={() => handleContentActionConfirmation(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  No, keep current
                </Button>
              </div>
            </div>
          )}
          
          {/* Free tier limit message */}
          {!isPremium && messageCount >= MESSAGE_LIMIT && (
            <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <div className="flex items-start">
                <Crown className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Message Limit Reached</p>
                  <p className="text-amber-700 mb-2">You've used all 10 free messages with the AI assistant.</p>
                  <Button 
                    size="sm" 
                    className="bg-amber-500 hover:bg-amber-600 text-white w-full justify-center"
                    onClick={() => window.location.href = "/pricing"}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
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
                {SUGGESTIONS[mode].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={!isPremium && messageCount >= MESSAGE_LIMIT}
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
          <form 
            onSubmit={handleSubmit} 
            className="flex gap-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.stopPropagation();
              }
            }}
          >
            <Input
              placeholder={mode === 'resume' 
                ? "Ask me anything about your resume..." 
                : "Ask me to help with your resume content..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !!apiError || (!isPremium && messageCount >= MESSAGE_LIMIT)}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !!apiError || (!isPremium && messageCount >= MESSAGE_LIMIT) || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
            {isPremium ? (
              <p>Premium access: Unlimited AI assistant usage</p>
            ) : (
              <p>
                Free tier: {MESSAGE_LIMIT - messageCount} message{MESSAGE_LIMIT - messageCount !== 1 ? 's' : ''} remaining
              </p>
            )}
            {!isPremium && (
              <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => window.location.href = "/pricing"}>
                <Crown className="h-3 w-3 mr-1 text-amber-500" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 