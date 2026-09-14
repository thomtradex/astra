export type OperationalChainNodeType =
  'PROJECT' | 'WORK_ORDER' | 'ASSET' | 'MAINTENANCE' | 'SITE' | 'CUSTOMER';

export interface OperationalChainNode {
  type: OperationalChainNodeType;
  id: string;
  label: string;
  state?: string;
}

export interface OperationalChainEdge {
  from: OperationalChainNode;
  to: OperationalChainNode;
  relationship: string;
}

export interface OperationalChain {
  id: string;
  title: string;
  explanation: string;
  impact: string;
  recommendedAction: string;
  nodes: OperationalChainNode[];
  edges: OperationalChainEdge[];
}
