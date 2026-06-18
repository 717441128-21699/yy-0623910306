import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertEvent, WordPackage, Briefing, MaterialItem, AppState, AlertStatus } from '@/types';
import { mockAlerts } from '@/data/alerts';
import { mockSubscriptions, availableWordPackages } from '@/data/subscriptions';
import { mockBriefings } from '@/data/briefings';

interface AppContextType extends AppState {
  allWordPackages: WordPackage[];
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  updateAlertMeta: (id: string, meta: { location?: string; department?: string }) => void;
  addMaterial: (alertId: string, material: Omit<MaterialItem, 'id' | 'createdAt'>) => void;
  toggleSubscription: (id: string) => void;
  updateThreshold: (id: string, threshold: number) => void;
  subscribePackage: (id: string) => void;
  sendBriefing: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertEvent[]>(mockAlerts);
  const [subscriptions, setSubscriptions] = useState<WordPackage[]>(mockSubscriptions);
  const [briefings, setBriefings] = useState<Briefing[]>(mockBriefings);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

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
    setBriefings(prev => prev.map(b => b.id === id ? { ...b, isSent: true } : b));
    console.log('[AppContext] sendBriefing', { id });
  }, []);

  return (
    <AppContext.Provider value={{
      alerts,
      subscriptions,
      briefings,
      materials,
      allWordPackages: availableWordPackages,
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
