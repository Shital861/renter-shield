export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'active' | 'resolved' | 'pending';
  createdAt: string;
  updatedAt: string;
  description: string;
  messages: Message[];
  letters: Letter[];
}

export interface Letter {
  id: string;
  incidentId: string;
  title: string;
  content: string;
  generatedAt: string;
  status: 'draft' | 'sent';
}

export interface Voucher {
  code: string;
  isValid: boolean;
  discountPercentage?: number;
  description?: string;
}

export interface ChatRequest {
  message: string;
  renter_id: string;
  session_id: string | null;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
}

export interface IncidentEntry {
  timestamp: string;    // ISO-8601
  description: string;
}

export interface IncidentLog {
  renter_id: string;
  entries: IncidentEntry[];
  total_incidents: number;
}

export interface VoucherResult {
  success: boolean;
  discount: string;
  description: string;
  error?: string;
}

export type IssueType = "heating" | "mold" | "eviction" | "entry_notice" | "deposit";
export type StateCode = "CA" | "NY" | "TX" | "FL" | "WA";
export type LetterTone = "friendly" | "formal" | "legal_notice";
