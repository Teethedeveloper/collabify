export type ParticipantStatus = "online" | "away" | "offline";

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  status: ParticipantStatus;
  joinedAt: string; // use string because API usually returns ISO timestamp
}
