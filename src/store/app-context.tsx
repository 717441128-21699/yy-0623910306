import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { AlertEvent, WordPackage, Briefing, MaterialItem, AppState, AlertStatus } from '@/types';
import { mockAlerts } from '@/data/alerts';
import { mockSubscriptions, availableWordPackages } from '@/data/subscriptions';
import { mockBriefings } from '@/data/briefings';

interface AppContextType extends AppState {
  allWordPackages: WordPackage[];
  todayBriefing: Briefing;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  updateAlertMeta: (id: string, meta: { location?: string; department?: string }) => void;
  addMaterial: (alertId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) => void;
  toggleSubscription: (id: string) => void;
  updateThreshold: (id: string, threshold: number) => void;
  subscribePackage: (id: string) => void;
  sendBriefing: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const formatDate = (d: Date) => d.toISOString().slice(0, 10);
const formatFull = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19);

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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertEvent[]>(mockAlerts);
  const [subscriptions, setSubscriptions] = useState<WordPackage[]>(mockSubscriptions);
  const [historyBriefings, setHistoryBriefings] = useState<Briefing[]>(mockBriefings.slice(1));
  const [todayBriefingSent, setTodayBriefingSent] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  const todayBriefing = useMemo<Briefing>(() => {
    const todayStr = formatDate(new Date(2026, 5, 19));
    const todayAlerts = alerts.filter(a => a.createdAt.startsWith(todayStr));
    return {
      id: 'b_today',
      date: todayStr,
      title: `2026年6月19日政务风险值班简报`,
      summary: buildSummary(todayAlerts),
      highRiskCount: todayAlerts.filter(a => a.level === 'danger').length,
      warningCount: todayAlerts.filter(a => a.level === 'warning').length,
      infoCount: todayAlerts.filter(a => a.level === 'info').length,
      resolvedCount: todayAlerts.filter(a => a.status === 'resolved').length,
      events: todayAlerts,
      generatedAt: formatFull(new Date(2026, 5, 19, 18, 0, 0)),
      isSent: todayBriefingSent
    };
  }, [alerts, todayBriefingSent]);

  const briefings = useMemo<Briefing[]>(() => [todayBriefing, ...historyBriefings], [todayBriefing, historyBriefings]);

  const updateAlertStatus = useCallback((id: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : a));
    console.log('[AppContext] updateAlertStatus', { id, status });
  }, []);

  const updateAlertMeta = useCallback((id: string, meta: { location?: string; department?: string }) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...meta, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : a));
    console.log('[AppContext] updateAlertMeta', { id, meta });
  }, []);

  const addMaterial = useCallback((alertId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) => {
    const newMaterial: MaterialItem = {
      ...material,
      id: 'm' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
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
        subscribedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      setSubscriptions(prev => [...prev, newPkg]);
      console.log('[AppContext] subscribePackage', { id, newPkg });
    }
  }, [subscriptions]);

  const sendBriefing = useCallback((id: string) => {
    if (id === 'b_today') {
      setTodayBriefingSent(true);
      console.log('[AppContext] sendBriefing today');
    } else {
      setHistoryBriefings(prev => prev.map(b => b.id === id ? { ...b, isSent: true } : b));
      console.log('[AppContext] sendBriefing history', { id });
    }
  }, []);

  return (
    <AppContext.Provider value={{
      alerts,
      subscriptions,
      briefings,
      materials,
      allWordPackages: availableWordPackages,
      todayBriefing,
      updateAlertStatus,
      updateAlertMeta,
      addMaterial,
      toggleSubscription,
      updateThreshold,
      subscribePackage,
      sendBriefing
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
