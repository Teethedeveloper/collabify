import { useState } from "react";
import { useParams } from "react-router-dom";
import VideoGrid from "@/components/VideoCall/VideoGrid";
import VideoControls from "@/components/VideoCall/VideoControls";
import Chat from "@/components/Chat/Chat";
import Whiteboard from "@/components/Whiteboard/Whiteboard";
import type { Participant } from "@/types/participant";
import ParticipantsList from "@/components/Participants/ParticipantsList";


const VideoRoom = () => {
  const { roomId } = useParams();
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Mock participants - replace with real-time WebRTC/Socket.io data
  const participants: Participant[] = [
    {
      id: "1",
      name: "You",
      isHost: true,
      videoEnabled: true,
      audioEnabled: true,
      isScreenSharing: false,
      status: "online",
      joinedAt: new Date(Date.now() - 600_000), // 10 mins ago
    },
    {
      id: "2",
      name: "Alice Cooper",
      isHost: false,
      videoEnabled: true,
      audioEnabled: true,
      isScreenSharing: false,
      status: "online",
      joinedAt: new Date(Date.now() - 300_000),
    },
    {
      id: "3",
      name: "Bob Smith",
      isHost: false,
      videoEnabled: false,
      audioEnabled: true,
      isScreenSharing: false,
      status: "away",
      joinedAt: new Date(Date.now() - 180_000),
    },
    {
      id: "4",
      name: "Carol Davis",
      isHost: false,
      videoEnabled: true,
      audioEnabled: false,
      isScreenSharing: false,
      status: "online",
      joinedAt: new Date(Date.now() - 120_000),
    },
  ];

  // Leave the call - clean up in real app
  const handleLeaveCall = () => {
    // TODO: cleanup WebRTC/Socket connections
    window.location.href = "/";
  };

  return (
    <div className="h-screen bg-video-bg flex flex-col overflow-hidden">
      {/* Main video & side panels */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <VideoGrid participants={participants} currentUserId="1" />

          {showWhiteboard && (
            <div className="absolute inset-4 bg-card border border-border rounded-lg z-20">
              <Whiteboard onClose={() => setShowWhiteboard(false)} />
            </div>
          )}
        </div>

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
