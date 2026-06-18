import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { AlertEvent, WordPackage, Briefing, MaterialItem, AppState, AlertStatus, BriefingTarget, BriefingSendStatus, AlertLevel, SubscriptionCategory } from '@/types';
import { mockSubscriptions, availableWordPackages } from '@/data/subscriptions';

interface AppContextType extends AppState {
  allWordPackages: WordPackage[];
  todayBriefing: Briefing;
  getPushCandidates: () => AlertEvent[];
  pickPushEvent: () => AlertEvent | null;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  updateAlertMeta: (id: string, meta: { location?: string; department?: string }) => void;
  addMaterial: (alertId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) => void;
  toggleSubscription: (id: string) => void;
  updateThreshold: (id: string, threshold: number) => void;
  subscribePackage: (id: string) => void;
  sendBriefingToTarget: (id: string, target: BriefingTarget) => void;
  sendBriefingAll: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatFull = (d: Date) => `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const formatCN = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

const buildSummary = (today: AlertEvent[]) => {
  if (today.length === 0) return '今日未监测到预警事件，整体风险态势平稳。';
  const danger = today.filter(a => a.level === 'danger');
  const warning = today.filter(a => a.level === 'warning');
  const resolved = today.filter(a => a.status === 'resolved');
  const parts: string[] = [];
  parts.push(`今日共监测到预警事件${today.length}起`);
  if (danger.length) parts.push(`其中高危${danger.length}起`);
  if (warning.length) parts.push(`警示${warning.length}起`);
  parts.push(`关注${today.length - danger.length - warning.length}起`);
  parts.push(`已处理${resolved.length}起`);
  if (danger.length > 0) {
    parts.push(`重点关注：${danger[0].title.slice(0, 20)}...`);
  }
  return parts.join('，') + '。';
};

const TODAY = new Date();
const todayStr = formatDate(TODAY);
const yesterdayStr = formatDate(new Date(TODAY.getTime() - 86400000));
const day2Str = formatDate(new Date(TODAY.getTime() - 86400000 * 2));
const day3Str = formatDate(new Date(TODAY.getTime() - 86400000 * 3));
const day4Str = formatDate(new Date(TODAY.getTime() - 86400000 * 4));

const TIME_META: Record<string, string> = {
  [todayStr]: '今日',
  [yesterdayStr]: '昨日',
  [day2Str]: '前日',
  [day3Str]: '大前日',
  [day4Str]: '4日前'
};

const buildAlerts = (): AlertEvent[] => [
  {
    id: 'a001',
    title: '行业监管新规：数据安全法修订草案公开征求意见',
    level: 'danger',
    category: 'industry',
    triggerReason: '2小时内相关讨论量激增420%，负面情绪占比68%',
    suggestion: 'report',
    status: 'pending',
    location: '全国',
    department: '法务部',
    discussionCount: 12850,
    negativeRatio: 68,
    createdAt: `${todayStr} 09:15:00`,
    updatedAt: `${todayStr} 10:30:00`,
    summary: `${TIME_META[todayStr]}人大常委会公布《数据安全法（修订草案）》征求意见稿，新增多项企业数据合规义务，涉及跨境数据传输、个人信息保护等核心条款，行业内讨论热度迅速攀升。`,
    keywords: ['数据安全法', '合规', '跨境数据', '个人信息'],
    materials: [
      {
        id: 'm001',
        type: 'official',
        title: '全国人大常委会关于《数据安全法（修订草案）》的说明',
        source: '中国人大网',
        content: '修订草案共7章65条，主要修改包括：完善数据分类分级保护制度，强化重要数据保护，规范数据处理活动...',
        createdAt: `${todayStr} 09:00:00`
      }
    ]
  },
  {
    id: 'a002',
    title: '地方政策：上海发布产业园区碳中和实施细则',
    level: 'warning',
    category: 'local_policy',
    triggerReason: '属地政策讨论量上升180%，涉及我司华东园区项目',
    suggestion: 'verify',
    status: 'verifying',
    location: '上海市',
    department: '公共事务部',
    discussionCount: 3420,
    negativeRatio: 32,
    createdAt: `${todayStr} 08:45:00`,
    updatedAt: `${todayStr} 09:50:00`,
    summary: `${TIME_META[todayStr]}上海市发改委印发《产业园区碳中和实施细则》，对高耗能企业设定阶梯电价和排放配额，我司上海张江园区可能受影响。`,
    keywords: ['碳中和', '上海', '产业园区', '阶梯电价'],
    materials: []
  },
  {
    id: 'a003',
    title: '企业高管关联：董事长出席某行业论坛言论被解读',
    level: 'danger',
    category: 'executive',
    triggerReason: '高管相关话题讨论量1小时内上升800%，负面评论快速扩散',
    suggestion: 'respond',
    status: 'responding',
    location: '北京市',
    department: '品牌公关部',
    discussionCount: 28600,
    negativeRatio: 75,
    createdAt: `${todayStr} 11:20:00`,
    updatedAt: `${todayStr} 11:45:00`,
    summary: `${TIME_META[todayStr]}公司董事长在行业论坛的发言被部分媒体断章取义，引发网络热议，多个自媒体账号发布带有倾向性的解读文章，需及时回应。`,
    keywords: ['董事长', '论坛', '言论', '媒体'],
    materials: [
      {
        id: 'm002',
        type: 'media',
        title: '某财经媒体：行业龙头董事长表态引发市场关注',
        source: '财经头条',
        content: '在今日举办的行业高峰论坛上，公司董事长就未来发展战略发表演讲，其中关于行业竞争格局的表述引发多方解读...',
        createdAt: `${todayStr} 11:05:00`
      },
      {
        id: 'm003',
        type: 'comment',
        title: '热门评论摘录',
        source: '微博',
        content: '这个表态是不是意味着公司战略转向？作为小股东有点担心，希望能有官方说明。',
        createdAt: `${todayStr} 11:30:00`
      }
    ]
  },
  {
    id: 'a004',
    title: '合作项目属地舆情：西南项目地群众环保诉求升温',
    level: 'warning',
    category: 'project',
    triggerReason: '项目属地环保相关讨论量上升260%，当地论坛出现多条投诉帖',
    suggestion: 'verify',
    status: 'pending',
    location: '四川省成都市',
    department: '项目部',
    discussionCount: 1890,
    negativeRatio: 54,
    createdAt: `${todayStr} 07:30:00`,
    updatedAt: `${todayStr} 08:20:00`,
    summary: `${TIME_META[todayStr]}我司西南数据中心项目所在地附近居民在地方论坛反映施工扬尘和夜间噪音问题，部分帖子呼吁环保部门介入调查。`,
    keywords: ['数据中心', '环保', '扬尘', '噪音'],
    materials: []
  },
  {
    id: 'a005',
    title: '行业监管：市场监管总局发布反垄断年度报告',
    level: 'info',
    category: 'industry',
    triggerReason: '监管政策讨论量平稳上升，年度例行发布',
    suggestion: 'verify',
    status: 'resolved',
    location: '全国',
    department: '法务部',
    discussionCount: 890,
    negativeRatio: 12,
    createdAt: `${yesterdayStr} 16:00:00`,
    updatedAt: `${yesterdayStr} 17:30:00`,
    summary: `${TIME_META[yesterdayStr]}市场监管总局发布上年度反垄断执法报告，回顾全年执法案件，我司未涉及相关案例，整体风险可控。`,
    keywords: ['反垄断', '市场监管总局', '年度报告'],
    materials: []
  },
  {
    id: 'a006',
    title: '地方政策：深圳拟出台科技创新企业扶持新政',
    level: 'info',
    category: 'local_policy',
    triggerReason: '科技创新政策讨论量上升，正面情绪占比82%',
    suggestion: 'verify',
    status: 'pending',
    location: '深圳市',
    department: '公共事务部',
    discussionCount: 2100,
    negativeRatio: 8,
    createdAt: `${todayStr} 10:00:00`,
    updatedAt: `${todayStr} 10:45:00`,
    summary: `${TIME_META[todayStr]}深圳市科创委就《科技创新企业扶持办法》公开征求意见，涉及税收优惠、研发补贴、人才住房等多项利好政策，我司可能符合申报条件。`,
    keywords: ['深圳', '科技创新', '扶持政策', '税收优惠'],
    materials: []
  },
  {
    id: 'a007',
    title: '合作项目属地舆情：华北基地周边交通规划调整',
    level: 'info',
    category: 'project',
    triggerReason: '属地交通规划讨论量上升，涉及我司物流通道',
    suggestion: 'verify',
    status: 'verifying',
    location: '河北省廊坊市',
    department: '运营部',
    discussionCount: 560,
    negativeRatio: 15,
    createdAt: `${todayStr} 06:15:00`,
    updatedAt: `${todayStr} 07:00:00`,
    summary: `${TIME_META[todayStr]}廊坊市公布新一批交通基础设施建设规划，我司华北生产基地周边高速出入口可能调整，需评估对物流运输的影响。`,
    keywords: ['交通规划', '物流', '高速'],
    materials: []
  },
  {
    id: 'a008',
    title: '行业监管：关于开展数据合规专项检查的通知',
    level: 'warning',
    category: 'industry',
    triggerReason: '行业监管讨论量上升150%，多省同步启动专项检查',
    suggestion: 'report',
    status: 'reported',
    location: '全国',
    department: '法务部',
    discussionCount: 4500,
    negativeRatio: 48,
    createdAt: `${day2Str} 14:20:00`,
    updatedAt: `${yesterdayStr} 09:00:00`,
    summary: `${TIME_META[day2Str]}网信办等多部门联合印发通知，将在全国范围内开展数据合规专项检查，我司已上报相关应对方案。`,
    keywords: ['数据合规', '专项检查', '网信办'],
    materials: []
  },
  {
    id: 'a009',
    title: '高管关联：CEO接受媒体专访谈及国际化战略',
    level: 'info',
    category: 'executive',
    triggerReason: '高管相关话题讨论量温和上升，正面情绪为主',
    suggestion: 'verify',
    status: 'resolved',
    location: '北京市',
    department: '品牌公关部',
    discussionCount: 1200,
    negativeRatio: 10,
    createdAt: `${day3Str} 10:00:00`,
    updatedAt: `${day3Str} 15:30:00`,
    summary: `${TIME_META[day3Str]}CEO在专访中阐述公司国际化发展战略，整体舆情偏正面，无需额外应对。`,
    keywords: ['CEO', '专访', '国际化'],
    materials: []
  }
];

const EMPTY_SEND: BriefingSendStatus = { legal: false, brand: false, pr: false };

const buildHistoryBriefing = (dateStr: string, events: AlertEvent[], sendStatus: BriefingSendStatus): Briefing => {
  const isSent = sendStatus.legal && sendStatus.brand && sendStatus.pr;
  const [y, m, d] = dateStr.split('-');
  return {
    id: 'b_' + dateStr,
    date: dateStr,
    title: `${y}年${parseInt(m)}月${parseInt(d)}日政务风险值班简报`,
    summary: buildSummary(events),
    highRiskCount: events.filter(a => a.level === 'danger').length,
    warningCount: events.filter(a => a.level === 'warning').length,
    infoCount: events.filter(a => a.level === 'info').length,
    resolvedCount: events.filter(a => a.status === 'resolved').length,
    events,
    generatedAt: `${dateStr} 18:00:00`,
    isSent,
    sendStatus
  };
};

const initialAlerts = buildAlerts();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertEvent[]>(initialAlerts);
  const [subscriptions, setSubscriptions] = useState<WordPackage[]>(mockSubscriptions);
  const [todaySendStatus, setTodaySendStatus] = useState<BriefingSendStatus>(EMPTY_SEND);
  const [historySendMap] = useState<Record<string, BriefingSendStatus>>(() => ({
    [yesterdayStr]: { legal: true, brand: true, pr: true },
    [day2Str]: { legal: true, brand: true, pr: true },
    [day3Str]: { legal: true, brand: true, pr: true },
    [day4Str]: { legal: true, brand: true, pr: true }
  }));
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [pushedIds, setPushedIds] = useState<Set<string>>(new Set());

  const getCategoryThreshold = (cat: SubscriptionCategory): number => {
    const sub = subscriptions.find(s => s.category === cat && s.isActive);
    return sub?.threshold ?? 60;
  };

  const getPushCandidates = useCallback((): AlertEvent[] => {
    return alerts.filter(a => {
      if (a.status === 'resolved') return false;
      if (pushedIds.has(a.id)) return false;
      const threshold = getCategoryThreshold(a.category);
      const negScore = a.negativeRatio;
      const discScore = Math.min(100, Math.floor(a.discussionCount / 300));
      const levelBonus = a.level === 'danger' ? 30 : a.level === 'warning' ? 10 : 0;
      const totalScore = Math.round(negScore * 0.5 + discScore * 0.3 + levelBonus);
      return totalScore >= threshold;
    });
  }, [alerts, subscriptions, pushedIds]);

  const pickPushEvent = useCallback((): AlertEvent | null => {
    const candidates = getPushCandidates();
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const lvl = (l: AlertLevel) => l === 'danger' ? 3 : l === 'warning' ? 2 : 1;
      return lvl(b.level) - lvl(a.level);
    });
    const pick = candidates[0];
    setPushedIds(prev => new Set(prev).add(pick.id));
    Taro.vibrateShort({ type: 'heavy' }).catch(() => {});
    console.log('[AppContext] pickPushEvent', { id: pick.id, title: pick.title });
    return pick;
  }, [getPushCandidates]);

  const todayBriefing = useMemo<Briefing>(() => {
    const todayAlerts = alerts.filter(a => a.createdAt.startsWith(todayStr));
    const isSent = todaySendStatus.legal && todaySendStatus.brand && todaySendStatus.pr;
    return {
      id: 'b_today',
      date: todayStr,
      title: `${formatCN(TODAY)}政务风险值班简报`,
      summary: buildSummary(todayAlerts),
      highRiskCount: todayAlerts.filter(a => a.level === 'danger').length,
      warningCount: todayAlerts.filter(a => a.level === 'warning').length,
      infoCount: todayAlerts.filter(a => a.level === 'info').length,
      resolvedCount: todayAlerts.filter(a => a.status === 'resolved').length,
      events: todayAlerts,
      generatedAt: `${todayStr} 18:00:00`,
      isSent,
      sendStatus: todaySendStatus
    };
  }, [alerts, todaySendStatus]);

  const historyBriefings = useMemo<Briefing[]>(() => {
    return [yesterdayStr, day2Str, day3Str, day4Str].map(ds => {
      const dayEvents = initialAlerts.filter(a => a.createdAt.startsWith(ds));
      return buildHistoryBriefing(ds, dayEvents, historySendMap[ds] || EMPTY_SEND);
    });
  }, [historySendMap]);

  const briefings = useMemo<Briefing[]>(() => [todayBriefing, ...historyBriefings], [todayBriefing, historyBriefings]);

  const updateAlertStatus = useCallback((id: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status, updatedAt: formatFull(new Date()) } : a));
    console.log('[AppContext] updateAlertStatus', { id, status });
  }, []);

  const updateAlertMeta = useCallback((id: string, meta: { location?: string; department?: string }) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...meta, updatedAt: formatFull(new Date()) } : a));
    console.log('[AppContext] updateAlertMeta', { id, meta });
  }, []);

  const addMaterial = useCallback((alertId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) => {
    const newMaterial: MaterialItem = {
      ...material,
      id: 'm' + Date.now(),
      createdAt: formatFull(new Date())
    };
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, materials: [...a.materials, newMaterial] } : a));
    setMaterials(prev => [...prev, newMaterial]);
    console.log('[AppContext] addMaterial', { alertId, material: newMaterial });
  }, []);

  const toggleSubscription = useCallback((id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    console.log('[AppContext] toggleSubscription', { id });
  }, []);

  const updateThreshold = useCallback((id: string, threshold: number) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, threshold } : s));
    console.log('[AppContext] updateThreshold', { id, threshold });
  }, []);

  const subscribePackage = useCallback((id: string) => {
    const pkg = availableWordPackages.find(p => p.id === id);
    if (pkg && !subscriptions.find(s => s.id === id)) {
      const newPkg: WordPackage = {
        ...pkg,
        isActive: true,
        subscribedAt: formatFull(new Date())
      };
      setSubscriptions(prev => [...prev, newPkg]);
      console.log('[AppContext] subscribePackage', { id, newPkg });
    }
  }, [subscriptions]);

  const sendBriefingToTarget = useCallback((id: string, target: BriefingTarget) => {
    if (id === 'b_today') {
      setTodaySendStatus(prev => ({ ...prev, [target]: true }));
    }
    console.log('[AppContext] sendBriefingToTarget', { id, target });
  }, []);

  const sendBriefingAll = useCallback((id: string) => {
    if (id === 'b_today') {
      setTodaySendStatus({ legal: true, brand: true, pr: true });
    }
    console.log('[AppContext] sendBriefingAll', { id });
  }, []);

  return (
    <AppContext.Provider value={{
      alerts,
      subscriptions,
      briefings,
      materials,
      allWordPackages: availableWordPackages,
      todayBriefing,
      getPushCandidates,
      pickPushEvent,
      updateAlertStatus,
      updateAlertMeta,
      addMaterial,
      toggleSubscription,
      updateThreshold,
      subscribePackage,
      sendBriefingToTarget,
      sendBriefingAll
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
