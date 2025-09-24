import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  avatar?: string;
}

interface VideoGridProps {
  participants?: Participant[];
  currentUserId?: string;
}

const VideoGrid = ({ 
  participants = [
    { id: "1", name: "You", isHost: true, videoEnabled: true, audioEnabled: true, isScreenSharing: false },
    { id: "2", name: "Alice Cooper", isHost: false, videoEnabled: true, audioEnabled: true, isScreenSharing: false },
    { id: "3", name: "Bob Smith", isHost: false, videoEnabled: false, audioEnabled: true, isScreenSharing: false },
    { id: "4", name: "Carol Davis", isHost: false, videoEnabled: true, audioEnabled: false, isScreenSharing: false }
  ],
  currentUserId = "1"
}: VideoGridProps) => {
  
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  const getVideoSize = (count: number, isScreenShare: boolean) => {
    if (isScreenShare) return "aspect-video";
    if (count === 1) return "aspect-video";
    return "aspect-square md:aspect-video";
  };

  const screenSharingParticipant = participants.find(p => p.isScreenSharing);

  return (
    <div className="h-full p-4">
      {screenSharingParticipant ? (
        // Screen sharing layout
        <div className="flex flex-col h-full gap-4">
          {/* Main screen share */}
          <Card className="flex-1 bg-participant-bg border-border overflow-hidden">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🖥️</span>
                  </div>
                  <p className="text-lg font-medium">{screenSharingParticipant.name}'s screen</p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  Screen Share
                </Badge>
              </div>
            </div>
          </Card>
          
          {/* Participants strip */}
          <div className="flex gap-2 h-24">
            {participants.map((participant) => (
              <ParticipantTile 
                key={participant.id} 
                participant={participant} 
                isCurrentUser={participant.id === currentUserId}
                size="small"
              />
            ))}
          </div>
        </div>
      ) : (
        // Normal grid layout
        <div className={`grid ${getGridClass(participants.length)} gap-4 h-full`}>
          {participants.map((participant) => (
            <ParticipantTile 
              key={participant.id} 
              participant={participant} 
              isCurrentUser={participant.id === currentUserId}
              className={getVideoSize(participants.length, false)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ParticipantTileProps {
  participant: Participant;
  isCurrentUser: boolean;
  size?: "normal" | "small";
  className?: string;
}

const ParticipantTile = ({ participant, isCurrentUser, size = "normal", className }: ParticipantTileProps) => {
  const tileClass = size === "small" 
    ? "w-20 h-16 min-w-20" 
    : `w-full h-full ${className}`;

  return (
    <Card className={`${tileClass} bg-participant-bg border-border overflow-hidden relative group`}>
      {participant.videoEnabled ? (
        // Video enabled - show mock video feed
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${size === "small" ? "w-8 h-8" : "w-24 h-24"} bg-muted rounded-full flex items-center justify-center`}>
              <span className={size === "small" ? "text-xs" : "text-2xl"}>
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Video disabled - show avatar placeholder
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className={`${size === "small" ? "w-8 h-8" : "w-24 h-24"} bg-primary/20 rounded-full flex items-center justify-center`}>
            <span className={`${size === "small" ? "text-xs" : "text-2xl"} text-primary font-medium`}>
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      
      {/* Overlays */}
      <div className="absolute top-2 left-2">
        {participant.isHost && (
          <Badge variant="secondary" className={`${size === "small" ? "text-xs px-1 py-0" : ""} bg-primary/80 text-primary-foreground`}>
            Host
          </Badge>
        )}
      </div>
      
      <div className={`absolute ${size === "small" ? "bottom-1 left-1" : "bottom-3 left-3"}`}>
        <div className="flex items-center gap-1">
          {!participant.audioEnabled && (
            <div className={`${size === "small" ? "w-4 h-4" : "w-6 h-6"} bg-destructive rounded-full flex items-center justify-center`}>
              <MicOff className={size === "small" ? "w-2 h-2" : "w-3 h-3"} />
            </div>
          )}
          {!participant.videoEnabled && (
            <div className={`${size === "small" ? "w-4 h-4" : "w-6 h-6"} bg-destructive rounded-full flex items-center justify-center`}>
              <VideoOff className={size === "small" ? "w-2 h-2" : "w-3 h-3"} />
            </div>
          )}
        </div>
      </div>
      
      <div className={`absolute ${size === "small" ? "bottom-1 right-1" : "bottom-3 right-3"}`}>
        <Badge variant="secondary" className={`${size === "small" ? "text-xs px-1 py-0" : ""} bg-black/50 text-white`}>
          {isCurrentUser ? "You" : participant.name}
        </Badge>
      </div>
    </Card>
  );
};

export default VideoGrid;