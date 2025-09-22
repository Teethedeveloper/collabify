import { useState } from "react";
import VideoGrid from "@/components/VideoCall/VideoGrid";
import VideoControls from "@/components/VideoCall/VideoControls";
import Chat from "@/components/Chat/Chat";
import Whiteboard from "@/components/Whiteboard/Whiteboard";
import ParticipantsList from "@/components/Participants/ParticipantsList";
import { useParams } from "react-router-dom";

const VideoRoom = () => {
  const { roomId } = useParams();
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Mock data - in real app this would come from WebRTC/Socket.io
  const participants = [
    { 
      id: "1", 
      name: "You", 
      isHost: true, 
      videoEnabled: true, 
      audioEnabled: true, 
      isScreenSharing: false,
      status: "online" as const,
      joinedAt: new Date(Date.now() - 600000) // 10 minutes ago
    },
    { 
      id: "2", 
      name: "Alice Cooper", 
      isHost: false, 
      videoEnabled: true, 
      audioEnabled: true, 
      isScreenSharing: false,
      status: "online" as const,
      joinedAt: new Date(Date.now() - 300000) // 5 minutes ago
    },
    { 
      id: "3", 
      name: "Bob Smith", 
      isHost: false, 
      videoEnabled: false, 
      audioEnabled: true, 
      isScreenSharing: false,
      status: "away" as const,
      joinedAt: new Date(Date.now() - 180000) // 3 minutes ago
    },
    { 
      id: "4", 
      name: "Carol Davis", 
      isHost: false, 
      videoEnabled: true, 
      audioEnabled: false, 
      isScreenSharing: false,
      status: "online" as const,
      joinedAt: new Date(Date.now() - 120000) // 2 minutes ago
    }
  ];

  const handleLeaveCall = () => {
    // In real app, clean up WebRTC connections and leave room
    window.location.href = '/';
  };

  return (
    <div className="h-screen bg-video-bg flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid - main area */}
        <div className="flex-1 relative">
          <VideoGrid participants={participants} currentUserId="1" />
          
          {/* Overlay panels */}
          {showWhiteboard && (
            <div className="absolute inset-4 bg-card border border-border rounded-lg z-20">
              <Whiteboard onClose={() => setShowWhiteboard(false)} />
            </div>
          )}
        </div>

        {/* Side panels */}
        {showChat && (
          <div className="w-80 border-l border-border bg-chat-bg">
            <Chat onClose={() => setShowChat(false)} />
          </div>
        )}

        {showParticipants && (
          <div className="w-64 border-l border-border bg-card">
            <ParticipantsList 
              participants={participants}
              onClose={() => setShowParticipants(false)}
            />
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <VideoControls
        roomCode={roomId || "ABC-123"}
        participantCount={participants.length}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  );
};

export default VideoRoom;