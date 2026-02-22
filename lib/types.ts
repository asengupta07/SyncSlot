export interface TimeInterval {
  start: string; // ISO 8601 UTC
  end: string;
}

export interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

export interface MatchResult {
  windows: MatchWindow[];
  perfectMatch: boolean;
}

export interface GroupWithMembers {
  _id: string;
  name: string;
  description?: string;
  creatorId: string;
  joinCode: string;
  startDate: string;
  endDate: string;
  members: Array<{ _id: string; name: string; email?: string }>;
  finalisedSlot?: TimeInterval;
  createdAt: string;
}
