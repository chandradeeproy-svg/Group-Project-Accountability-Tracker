export type EvidenceEventType =
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_APPROVED";

// | "FILE_UPLOADED"
// | "COMMENT_ADDED"
// | "PEER_REVIEW_SUBMITTED";

export interface EvidenceEvent {
  event_id: string;
  project_id: string; 
  user_id: string;
  type: EvidenceEventType;
  source: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
