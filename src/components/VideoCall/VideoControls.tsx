import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  Settings,
  Users,
  MessageSquare,
  PenTool,
  Copy,
  Volume2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoControlsProps {
  roomCode?: string;
  participantCount?: number;
  onToggleChat?: () => void;
  onToggleWhiteboard?: () => void;
  onToggleParticipants?: () => void;
  onLeaveCall?: () => void;
}

const VideoControls = ({ 
  roomCode = "ABC-123",
  participantCount = 4,
  onToggleChat,
  onToggleWhiteboard,
  onToggleParticipants,
  onLeaveCall
}: VideoControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Room code copied!",
      description: "Share this code with others to invite them",
    });
  };

  const handleLeaveCall = () => {
    if (onLeaveCall) {
      onLeaveCall();
    } else {
      window.location.href = '/';
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen share stopped" : "Screen share started",
      description: isScreenSharing ? "You stopped sharing your screen" : "You're now sharing your screen",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-video-controls/95 backdrop-blur-lg border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Room info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Room: {roomCode}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomCode}
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participantCount}</span>
            </div>
            {isRecording && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="destructive" className="animate-pulse">
                  ● REC
                </Badge>
              </>
            )}
          </div>

          {/* Center section - Main controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="h-12 w-12 rounded-full"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className="h-12 w-12 rounded-full"
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={toggleScreenShare}
              className="h-12 w-12 rounded-full"
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeaveCall}
              className="h-12 w-12 rounded-full"
            >
              <Phone className="w-5 h-5" />
            </Button>
          </div>

          {/* Right section - Additional controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleParticipants}
              className="hover:bg-white/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Participants
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleChat}
              className="hover:bg-white/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleWhiteboard}
              className="hover:bg-white/10"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Whiteboard
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/10"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Audio
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;