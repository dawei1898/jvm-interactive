export enum JVMPart {
  CLASS_LOADER = 'CLASS_LOADER',
  METHOD_AREA = 'METHOD_AREA',
  HEAP = 'HEAP',
  HEAP_YOUNG = 'HEAP_YOUNG',
  HEAP_OLD = 'HEAP_OLD',
  STACK = 'STACK',
  PC_REGISTER = 'PC_REGISTER',
  NATIVE_STACK = 'NATIVE_STACK',
  EXECUTION_ENGINE = 'EXECUTION_ENGINE',
  GC = 'GC'
}

export interface JVMComponentData {
  id: JVMPart;
  name: string;
  description: string;
  details: string;
  color: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'action' | 'error';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}