import { Briefing } from '@/types';
import { mockAlerts } from './alerts';

export const mockBriefings: Briefing[] = [
  {
    id: 'b001',
    date: '2026-06-19',
    title: '2026年6月19日政务风险值班简报',
    summary: '今日共监测到预警事件7起，其中高危2起、警示3起、关注2起，已处理1起。重点关注数据安全法修订草案及董事长言论舆情。',
    highRiskCount: 2,
    warningCount: 3,
    infoCount: 2,
    resolvedCount: 1,
    events: mockAlerts,
    generatedAt: '2026-06-19 18:00:00',
    isSent: false
  },
  {
    id: 'b002',
    date: '2026-06-18',
    title: '2026年6月18日政务风险值班简报',
    summary: '昨日共监测到预警事件5起，其中高危1起、警示2起、关注2起，已处理4起。整体风险态势平稳。',
    highRiskCount: 1,
    warningCount: 2,
    infoCount: 2,
    resolvedCount: 4,
    events: [],
    generatedAt: '2026-06-18 18:00:00',
    isSent: true
  },
  {
    id: 'b003',
    date: '2026-06-17',
    title: '2026年6月17日政务风险值班简报',
    summary: '前日共监测到预警事件4起，其中警示2起、关注2起，已全部处理。',
    highRiskCount: 0,
    warningCount: 2,
    infoCount: 2,
    resolvedCount: 4,
    events: [],
    generatedAt: '2026-06-17 18:00:00',
    isSent: true
  },
  {
    id: 'b004',
    date: '2026-06-16',
    title: '2026年6月16日政务风险值班简报',
    summary: '前日共监测到预警事件6起，其中高危1起、警示2起、关注3起，已处理5起。',
    highRiskCount: 1,
    warningCount: 2,
    infoCount: 3,
    resolvedCount: 5,
    events: [],
    generatedAt: '2026-06-16 18:00:00',
    isSent: true
  },
  {
    id: 'b005',
    date: '2026-06-15',
    title: '2026年6月15日政务风险值班简报',
    summary: '前日共监测到预警事件3起，均为关注级别，已全部处理。',
    highRiskCount: 0,
    warningCount: 0,
    infoCount: 3,
    resolvedCount: 3,
    events: [],
    generatedAt: '2026-06-15 18:00:00',
    isSent: true
  }
];
