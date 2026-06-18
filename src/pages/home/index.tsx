import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import AlertCard from '@/components/AlertCard';
import SectionHeader from '@/components/SectionHeader';
import { AlertEvent } from '@/types';
import styles from './index.module.scss';

const suggestionText: Record<'verify' | 'respond' | 'report', string> = {
  verify: '先核实',
  respond: '需回应',
  report: '建议上报'
};

const pad = (n: number) => String(n).padStart(2, '0');
const nowStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const HomePage: React.FC = () => {
  const { alerts, pickPushEvent } = useAppContext();
  const [pushVisible, setPushVisible] = useState(false);
  const [currentPush, setCurrentPush] = useState<AlertEvent | null>(null);
  const [nowDisplay, setNowDisplay] = useState(nowStr());
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clockTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayK = useMemo(() => todayKey(), []);
  const todayAlerts = useMemo(() => alerts.filter(a => a.createdAt.startsWith(todayK)), [alerts, todayK]);

  const dangerCount = todayAlerts.filter(a => a.level === 'danger').length;
  const warningCount = todayAlerts.filter(a => a.level === 'warning').length;
  const infoCount = todayAlerts.filter(a => a.level === 'info').length;
  const resolvedCount = todayAlerts.filter(a => a.status === 'resolved').length;

  const urgentAlert = todayAlerts.find(a => a.level === 'danger');

  const triggerPush = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    const picked = pickPushEvent();
    if (picked) {
      setCurrentPush(picked);
      setPushVisible(true);
      dismissTimer.current = setTimeout(() => setPushVisible(false), 7000);
      console.log('[HomePage] dynamic push triggered', { id: picked.id, title: picked.title });
    } else {
      Taro.showToast({ title: '暂无新的预警事件', icon: 'none' });
      console.log('[HomePage] no push candidates');
    }
  };

  const handlePushClick = () => {
    setPushVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (currentPush) {
      Taro.navigateTo({ url: `/pages/event-detail/index?id=${currentPush.id}` });
    }
  };

  const dismissPush = () => {
    setPushVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  };

  const handleUrgentClick = (alert: AlertEvent) => {
    Taro.navigateTo({ url: `/pages/event-detail/index?id=${alert.id}` });
  };

  const goToEvents = () => Taro.switchTab({ url: '/pages/events/index' });
  const goToMaterials = () => Taro.navigateTo({ url: '/pages/materials/index' });
  const goToSubscribe = () => Taro.switchTab({ url: '/pages/subscribe/index' });

  useDidShow(() => {
    console.log('[HomePage] page show');
    setNowDisplay(nowStr());
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(triggerPush, 2500);
  });

  useEffect(() => {
    clockTimer.current = setInterval(() => setNowDisplay(nowStr()), 30000);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (clockTimer.current) clearInterval(clockTimer.current);
    };
  }, []);

  return (
    <ScrollView scrollY className={styles.page}>
      {currentPush && (
        <View className={classnames(styles.pushNotify, pushVisible && styles.pushShow)}>
          <View className={styles.pushCard} onClick={handlePushClick}>
            <View className={styles.pushHeader}>
              <View className={styles.pushAppName}>
                <View className={styles.pushIcon}><Text>政</Text></View>
                <Text>政务预警</Text>
              </View>
              <Text className={styles.pushTime}>刚刚</Text>
            </View>
            <View className={classnames(styles.pushLevel, currentPush.level === 'danger' ? styles.pushLevelDanger : styles.pushLevelWarning)}>
              <Text>{currentPush.level === 'danger' ? '高危预警' : '警示提醒'}</Text>
            </View>
            <Text className={styles.pushTitle}>{currentPush.title}</Text>
            <Text className={styles.pushTrigger}>触发原因：{currentPush.triggerReason}</Text>
            <View className={styles.pushFooter}>
              <View className={styles.pushSuggestion}>
                <Text>建议：{suggestionText[currentPush.suggestion]}</Text>
              </View>
              <View className={styles.pushAction}>
                <Text>查看详情</Text>
                <Text>›</Text>
              </View>
            </View>
            <View className={styles.pushDismiss} onClick={(e) => { e.stopPropagation(); dismissPush(); }}>
              <Text>×</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.header}>
        <Text className={styles.greeting}>下午好，值班同事</Text>
        <Text className={styles.subtitle}>当前时间 {nowDisplay}</Text>
        <View className={styles.dutyInfo}>
          <Text className={styles.dutyLabel}>今日值班：</Text>
          <Text className={styles.dutyName}>张主任 · 公共事务部</Text>
          <Button className={styles.simulateBtn} onClick={triggerPush}>
            <Text>🔔</Text>
            <Text>模拟推送</Text>
          </Button>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={classnames(styles.statCard, styles.danger)}>
          <Text className={styles.statNum}>{dangerCount}</Text>
          <Text className={styles.statLabel}>高危</Text>
        </View>
        <View className={classnames(styles.statCard, styles.warning)}>
          <Text className={styles.statNum}>{warningCount}</Text>
          <Text className={styles.statLabel}>警示</Text>
        </View>
        <View className={classnames(styles.statCard, styles.info)}>
          <Text className={styles.statNum}>{infoCount}</Text>
          <Text className={styles.statLabel}>关注</Text>
        </View>
        <View className={classnames(styles.statCard, styles.resolved)}>
          <Text className={styles.statNum}>{resolvedCount}</Text>
          <Text className={styles.statLabel}>已处理</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickRow}>
          <View className={styles.quickItem} onClick={goToEvents}>
            <View className={styles.quickIcon}><Text>事</Text></View>
            <Text className={styles.quickText}>全部事件</Text>
          </View>
          <View className={styles.quickItem} onClick={goToMaterials}>
            <View className={styles.quickIcon}><Text>素</Text></View>
            <Text className={styles.quickText}>素材夹</Text>
          </View>
          <View className={styles.quickItem} onClick={goToSubscribe}>
            <View className={styles.quickIcon}><Text>词</Text></View>
            <Text className={styles.quickText}>词包配置</Text>
          </View>
        </View>

        {urgentAlert && (
          <View className={styles.urgentSection}>
            <SectionHeader title="紧急预警" />
            <View className={styles.urgentCard} onClick={() => handleUrgentClick(urgentAlert)}>
              <View className={styles.urgentHeader}>
                <View className={styles.urgentLabel}><Text>紧急</Text></View>
                <Text className={styles.urgentTime}>{urgentAlert.createdAt.slice(11, 16)}</Text>
              </View>
              <Text className={styles.urgentTitle}>{urgentAlert.title}</Text>
              <Text className={styles.urgentTrigger}>{urgentAlert.triggerReason}</Text>
              <View className={styles.urgentFooter}>
                <View className={styles.urgentSuggestion}>
                  <Text>{suggestionText[urgentAlert.suggestion]}</Text>
                </View>
                <Text className={styles.urgentArrow}>›</Text>
              </View>
            </View>
          </View>
        )}

        <SectionHeader
          title="今日预警"
          extra={<Text onClick={goToEvents} style={{ color: '#1E3A8A' }}>查看全部 ›</Text>}
        />
        {todayAlerts.length > 0 ? (
          todayAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '56rpx', color: '#CBD5E1' }}>✓</Text>
            <Text style={{ display: 'block', marginTop: '16rpx', fontSize: '26rpx', color: '#94A3B8' }}>今日暂无预警事件</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
