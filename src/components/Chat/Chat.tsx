import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Send, Paperclip, Smile, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "system";
  fileUrl?: string;
  fileName?: string;
}

interface ChatProps {
  onClose?: () => void;
}

const Chat = ({ onClose }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      content: "Welcome to the room! Start collaborating.",
      timestamp: new Date(Date.now() - 300000),
      type: "system"
    },
    {
      id: "2", 
      userId: "2",
      userName: "Alice Cooper",
      content: "Hey everyone! Thanks for joining the call.",
      timestamp: new Date(Date.now() - 240000),
      type: "text"
    },
    {
      id: "3",
      userId: "1",
      userName: "You",
      content: "Great to be here! Looking forward to our discussion.",
      timestamp: new Date(Date.now() - 180000),
      type: "text"
    },
    {
      id: "4",
      userId: "3",
      userName: "Bob Smith",
      content: "I've uploaded the presentation we discussed",
      timestamp: new Date(Date.now() - 120000),
      type: "file",
      fileName: "Q3-Results.pdf",
      fileUrl: "#"
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: "1",
      userName: "You",
      content: message,
      timestamp: new Date(),
      type: "text"
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: Date.now().toString(),
        userId: "1",
        userName: "You",
        content: `Shared a file: ${file.name}`,
        timestamp: new Date(),
        type: "file",
        fileName: file.name,
        fileUrl: URL.createObjectURL(file)
      };
      
      setMessages(prev => [...prev, newMessage]);
      toast({
        title: "File uploaded",
        description: `${file.name} has been shared with the room`,
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  };

  return (
    <div className="h-full flex flex-col bg-chat-bg">
      <CardHeader className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.userId === "1" ? "items-end" : "items-start"}`}>
              {msg.type === "system" ? (
                <div className="w-full text-center">
                  <Badge variant="secondary" className="text-xs">
                    {msg.content}
                  </Badge>
                </div>
              ) : (
                <>
                  {msg.userId !== "1" && (
                    <div className="text-xs text-muted-foreground mb-1">{msg.userName}</div>
                  )}
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.userId === "1" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.type === "file" ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{msg.fileName}</div>
                          <div className="text-xs opacity-80">Click to download</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">{msg.content}</div>
                    )}
                    <div className={`text-xs mt-1 ${
                      msg.userId === "1" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Input area */}
        <div className="p-4 bg-background/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-20 bg-background border-border"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFileUpload}
                  className="h-6 w-6 p-0"
                >
                  <Paperclip className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={sendMessage}
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
      />
    </div>
  );
};

export default Chat;