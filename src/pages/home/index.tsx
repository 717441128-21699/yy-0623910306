import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import AlertCard from '@/components/AlertCard';
import SectionHeader from '@/components/SectionHeader';
import { AlertEvent, AlertLevel } from '@/types';
import styles from './index.module.scss';

const suggestionText = {
  verify: '先核实',
  respond: '需回应',
  report: '建议上报'
};

const simAlerts = [
  {
    title: '突发：监管总局发布行业新规征求意见稿',
    level: 'danger' as AlertLevel,
    trigger: '15分钟内相关讨论量激增520%，负面情绪占比72%，超过高危阈值',
    suggestion: 'report' as const,
    alertId: 'a_sim_1'
  },
  {
    title: '属地政策：华东项目地环保标准拟上调',
    level: 'warning' as AlertLevel,
    trigger: '当地论坛1小时内新增38条环保投诉帖，舆情热度快速上升',
    suggestion: 'verify' as const,
    alertId: 'a_sim_2'
  },
  {
    title: '高管关联：CEO公开演讲被财经媒体重点报道',
    level: 'danger' as AlertLevel,
    trigger: '高管相关话题负面评论占比上升至65%，建议快速回应',
    suggestion: 'respond' as const,
    alertId: 'a_sim_3'
  }
];

const HomePage: React.FC = () => {
  const { alerts } = useAppContext();
  const [pushVisible, setPushVisible] = useState(false);
  const [currentPush, setCurrentPush] = useState(simAlerts[0]);
  const simIndex = useRef(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayAlerts = useMemo(() => {
    const today = '2026-06-19';
    return alerts.filter(a => a.createdAt.startsWith(today));
  }, [alerts]);

  const dangerCount = todayAlerts.filter(a => a.level === 'danger').length;
  const warningCount = todayAlerts.filter(a => a.level === 'warning').length;
  const infoCount = todayAlerts.filter(a => a.level === 'info').length;
  const resolvedCount = todayAlerts.filter(a => a.status === 'resolved').length;

  const urgentAlert = todayAlerts.find(a => a.level === 'danger');

  const triggerPush = (useNext = true) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (useNext) {
      simIndex.current = (simIndex.current + 1) % simAlerts.length;
      setCurrentPush(simAlerts[simIndex.current]);
    }
    setPushVisible(true);
    Taro.vibrateShort({ type: 'heavy' }).catch(() => {});
    dismissTimer.current = setTimeout(() => {
      setPushVisible(false);
    }, 6000);
    console.log('[HomePage] push notification triggered', { currentPush: simAlerts[simIndex.current] });
  };

  const handlePushClick = () => {
    setPushVisible(false);
    const realAlert = urgentAlert || todayAlerts[0];
    if (realAlert) {
      Taro.navigateTo({
        url: `/pages/event-detail/index?id=${realAlert.id}`
      });
    }
  };

  const dismissPush = () => {
    setPushVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  };

  const handleUrgentClick = (alert: AlertEvent) => {
    Taro.navigateTo({
      url: `/pages/event-detail/index?id=${alert.id}`
    });
  };

  const goToEvents = () => {
    Taro.switchTab({ url: '/pages/events/index' });
  };

  const goToMaterials = () => {
    Taro.navigateTo({ url: '/pages/materials/index' });
  };

  const goToSubscribe = () => {
    Taro.switchTab({ url: '/pages/subscribe/index' });
  };

  useDidShow(() => {
    console.log('[HomePage] page show');
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      triggerPush(false);
    }, 2500);
  });

  useEffect(() => {
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  return (
    <ScrollView scrollY className={styles.page}>
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
          <Text className={styles.pushTrigger}>触发原因：{currentPush.trigger}</Text>
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

      <View className={styles.header}>
        <Text className={styles.greeting}>下午好，值班同事</Text>
        <Text className={styles.subtitle}>当前时间 2026-06-19 14:30</Text>
        <View className={styles.dutyInfo}>
          <Text className={styles.dutyLabel}>今日值班：</Text>
          <Text className={styles.dutyName}>张主任 · 公共事务部</Text>
          <Button className={styles.simulateBtn} onClick={() => triggerPush(true)}>
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
                <View className={styles.urgentLabel}>
                  <Text>紧急</Text>
                </View>
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
        {todayAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </View>
    </ScrollView>
  );
};

export default HomePage;
