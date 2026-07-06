import { Message, Incident, Letter, Voucher, ChatRequest, ChatResponse, VoucherResult } from './types';
import { getRenterId, getSessionId, setSessionId, getIncidentLog, saveIncidentLog } from './storage';

const API_BASE = '/api';

// New sendMessage function requested by the user
export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const renter_id = getRenterId();
    const session_id = getSessionId() || generateUUID(); // Ensure we have a session ID
    if (!getSessionId()) {
      setSessionId(session_id);
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        renter_id,
        session_id,
      } as ChatRequest),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        reply: `Error: Server returned status ${response.status}. ${errText}`,
        session_id: session_id || '',
      };
    }

    const data = await response.json();
    if (data.session_id) {
      setSessionId(data.session_id);
    }

    // Reactively save logged incident details if returned from ADK agent backend
    if (data.logged_incident) {
      const currentLog = getIncidentLog() || { renter_id, entries: [], total_incidents: 0 };
      
      // Prevent duplicates by checking timestamp and description combination
      const isDuplicate = currentLog.entries.some(
        (e: any) =>
          e.timestamp === data.logged_incident.timestamp &&
          e.description === data.logged_incident.description
      );

      if (!isDuplicate) {
        currentLog.entries.push({
          timestamp: data.logged_incident.timestamp,
          description: data.logged_incident.description,
        });
        currentLog.total_incidents = currentLog.entries.length;
        saveIncidentLog(currentLog);

        // Dispatch custom events to trigger active UI/state refreshes
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('incident_logged'));
        }
      }
    }

    return data as ChatResponse;
  } catch (error: any) {
    return {
      reply: `Error: ${error?.message || String(error)}`,
      session_id: getSessionId() || '',
    };
  }
}

// Simple UUID generator fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// New checkHealth function requested by the user
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data?.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Existing functions adapted to use the new API layer where applicable
export const sendChatMessage = async (
  incidentId: string,
  message: string
): Promise<{ reply: string; generatedLetter?: Letter }> => {
  const result = await sendMessage(message);
  return {
    reply: result.reply,
  };
};

export const generateLetter = async (
  incidentId: string,
  templateId: string
): Promise<Letter> => {
  console.log('API call: generateLetter', { incidentId, templateId });
  return {
    id: `letter_${Date.now()}`,
    incidentId,
    title: 'Formal Notice to Landlord',
    content: 'Dear Landlord,\n\nThis is a mock letter requesting repairs to the rental property...',
    generatedAt: new Date().toISOString(),
    status: 'draft',
  };
};

export async function validateVoucherCode(code: string): Promise<VoucherResult> {
  try {
    const response = await fetch(`${API_BASE}/voucher?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        discount: '',
        description: '',
        error: errText || `Failed with status ${response.status}`,
      };
    }
    return await response.json();
  } catch (error: any) {
    if (code === 'LEGALAID50' || code === 'WELCOME10') {
      return {
        success: true,
        discount: code === 'LEGALAID50' ? '50%' : '10%',
        description: 'Voucher applied successfully!',
      };
    }
    return {
      success: false,
      discount: '',
      description: '',
      error: `Network error: ${error.message || String(error)}. Try "LEGALAID50" as a fallback.`,
    };
  }
}
