export type AlertLevel = 'danger' | 'warning' | 'info';

export type AlertStatus = 'pending' | 'verifying' | 'responding' | 'reported' | 'resolved';

export type MaterialType = 'comment' | 'media' | 'official';

export type SubscriptionCategory = 'industry' | 'local_policy' | 'executive' | 'project';

export interface AlertEvent {
  id: string;
  title: string;
  level: AlertLevel;
  category: SubscriptionCategory;
  triggerReason: string;
  suggestion: 'verify' | 'respond' | 'report';
  status: AlertStatus;
  location?: string;
  department?: string;
  discussionCount: number;
  negativeRatio: number;
  createdAt: string;
  updatedAt: string;
  summary: string;
  keywords: string[];
  materials: MaterialItem[];
}

export interface MaterialItem {
  id: string;
  type: MaterialType;
  title: string;
  source: string;
  content: string;
  url?: string;
  createdAt: string;
}

export interface WordPackage {
  id: string;
  name: string;
  category: SubscriptionCategory;
  description: string;
  keywords: string[];
  threshold: number;
  isActive: boolean;
  subscribedAt?: string;
}

export type BriefingTarget = 'legal' | 'brand' | 'pr';

export interface BriefingSendStatus {
  legal: boolean;
  brand: boolean;
  pr: boolean;
}

export interface Briefing {
  id: string;
  date: string;
  title: string;
  summary: string;
  highRiskCount: number;
  warningCount: number;
  infoCount: number;
  resolvedCount: number;
  events: AlertEvent[];
  generatedAt: string;
  isSent: boolean;
  sendStatus: BriefingSendStatus;
}

export interface AppState {
  alerts: AlertEvent[];
  subscriptions: WordPackage[];
  briefings: Briefing[];
  materials: MaterialItem[];
}
