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
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/ai-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

import { 
  aiAssistantService, 
  AIModel, 
  AssistantAction 
} from "@/services/ai-assistant-service";

interface AIGeneratorAssistantProps {
  // Current section being edited (summary, experience, etc.)
  currentSection: string;
  // Current content in the form field
  currentValue: string;
  // Callback to update the form field value
  onUpdateContent: (content: string) => void;
  // Additional data for context
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  // Callback when the assistant is closed
  onClose: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "👋 Hi! I'm your AI resume content assistant. I can help you write compelling content for each section of your resume. Let me know what you're looking for, and I can suggest improvements or create content from scratch."
};

const SUGGESTIONS = [
  "Write a professional summary for me",
  "Make this experience bullet more impactful",
  "Add quantifiable achievements to this point",
  "Help me highlight these skills better",
  "Improve this education section"
];

export function AIGeneratorAssistant({
  currentSection,
  currentValue,
  onUpdateContent,
  jobTitle,
  industry,
  experienceLevel,
  onClose
}: AIGeneratorAssistantProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isPremium = !!user?.isPremium;
  
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<AIModel>("gemini");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  // Update when current section or value changes
  useEffect(() => {
    // Add a system message when the section changes to provide context
    if (currentSection) {
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
  }, [currentSection]);
  
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
      const response = await fetch('/api/chat', {
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
      
      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.status}`);
      }
      
      const data = await response.json();
      
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
  
  const handleActionConfirmation = (confirmed: boolean) => {
    if (!pendingContent || !confirmed) {
      setPendingContent(null);
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
  
  return (
    <Card className="fixed inset-y-0 right-0 w-96 border-l shadow-lg rounded-none z-50">
      <div className="flex flex-col h-full">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Content Assistant</h2>
            <Badge variant="outline" className="ml-2">
              {currentSection}
            </Badge>
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
                <DropdownMenuItem 
                  onClick={() => toggleModel("gemini")}
                  className="flex items-center justify-between"
                >
                  <span>Gemini</span>
                  {model === "gemini" && <CheckCircle className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleModel("openai")}
                  className={cn(
                    "flex items-center justify-between",
                    !isPremium && "text-muted-foreground"
                  )}
                  disabled={!isPremium}
                >
                  <span>OpenAI (GPT)</span>
                  {isPremium && model === "openai" && <CheckCircle className="h-4 w-4 ml-2" />}
                  {!isPremium && <span className="text-xs ml-2">Premium</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="h-5 w-5" />
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
          
          {/* Pending content confirmation with Yes/No buttons */}
          {pendingContent && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">Would you like to apply this suggested content?</p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => handleActionConfirmation(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Yes, update
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center" 
                  onClick={() => handleActionConfirmation(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  No, keep current
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
          
          {/* Quick suggestions */}
          {showSuggestions && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-muted-foreground">Suggestions:</p>
              {SUGGESTIONS.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-sm h-auto py-2 px-3"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me to help with your resume content..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
} 