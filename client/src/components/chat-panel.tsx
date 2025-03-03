import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot } from "lucide-react";
import { ChatMessage } from "@/lib/ai-service";

/**
 * Props for the ChatPanel component
 * @interface ChatPanelProps
 * @property {(message: string) => Promise<void>} onSend - Function to handle sending messages
 * @property {boolean} isLoading - Whether a message is currently being processed
 * @property {ChatMessage[]} messages - Array of chat messages
 */
interface ChatPanelProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  messages: ChatMessage[];
}

/**
 * Chat panel component for interacting with the AI assistant
 * 
 * @component
 * @param {ChatPanelProps} props - The component props
 * @returns {JSX.Element} The chat panel component
 */
export function ChatPanel({ onSend, isLoading, messages }: ChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">Resume AI Assistant</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me to help you improve your resume content and design
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your resume..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="button" 
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
