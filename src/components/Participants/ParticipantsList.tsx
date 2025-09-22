import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Crown, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  UserPlus,
  MoreVertical,
  Copy,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  status: "online" | "away" | "busy";
  joinedAt: Date;
}

interface ParticipantsListProps {
  participants: Participant[];
  onClose?: () => void;
}

const ParticipantsList = ({ participants, onClose }: ParticipantsListProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    
    toast({
      title: "Invitation sent!",
      description: `Invite sent to ${inviteEmail}`,
    });
    
    setInviteEmail("");
    setShowInvite(false);
  };

  const copyRoomLink = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Room link copied!",
      description: "Share this link to invite others",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-status-online";
      case "away": return "bg-status-away";
      case "busy": return "bg-status-busy";
      default: return "bg-muted";
    }
  };

  const formatJoinTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just joined";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <Card className="h-full flex flex-col bg-background border-border">
      <CardHeader className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Participants ({participants.length})
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Invite section */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowInvite(!showInvite)}
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Others
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyRoomLink}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          {showInvite && (
            <div className="space-y-2 animate-slide-up">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={sendInvite}
                  disabled={!inviteEmail.trim()}
                  className="flex-1"
                >
                  Send Invite
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInvite(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-y-auto">
        <div className="space-y-1 p-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(participant.status)}`}></div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {participant.name}
                    {participant.id === "1" && " (You)"}
                  </span>
                  {participant.isHost && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatJoinTime(participant.joinedAt)}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  participant.audioEnabled 
                    ? "bg-muted hover:bg-muted/80" 
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {participant.audioEnabled ? (
                    <Mic className="w-3 h-3" />
                  ) : (
                    <MicOff className="w-3 h-3" />
                  )}
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  participant.videoEnabled 
                    ? "bg-muted hover:bg-muted/80" 
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {participant.videoEnabled ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <VideoOff className="w-3 h-3" />
                  )}
                </div>

                {participant.id !== "1" && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Room settings for host */}
        {participants.some(p => p.id === "1" && p.isHost) && (
          <div className="p-4 space-y-3">
            <h3 className="font-medium text-sm">Room Settings</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Waiting Room
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Volume2 className="w-4 h-4 mr-2" />
                Mute All
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-destructive">
                End Meeting for All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;