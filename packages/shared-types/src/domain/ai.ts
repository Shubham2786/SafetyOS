/**
 * AI Assistant & Multi-Agent Reasoning Domain Types
 */

export type OrbState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'STREAMING'
  | 'EXECUTING_TOOL'
  | 'CONFIDENT'
  | 'UNCERTAIN'
  | 'ERROR'
  | 'KILLED';

export interface ReasoningStep {
  id: string;
  stepNumber: number;
  type: 'OBSERVED' | 'RETRIEVED' | 'REASONED' | 'CALLED_TOOL' | 'RESPONDED';
  description: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: Record<string, unknown>;
  timestamp: string;
}

export interface Citation {
  id: string;
  title: string;
  sourceType: 'SOP' | 'REGULATION' | 'INCIDENT_HISTORY' | 'KNOWLEDGE_GRAPH' | 'SENSOR_LOG';
  url?: string;
  confidenceScore: number; // 0 to 1
  snippet?: string;
}

export interface CopilotMessage {
  id: string;
  threadId: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: string;
  orbState?: OrbState;
  reasoningSteps?: ReasoningStep[];
  citations?: Citation[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  humanInLoopActionRequired?: boolean;
}
