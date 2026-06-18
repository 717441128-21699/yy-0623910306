import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import AlertCard from '@/components/AlertCard';
import SectionHeader from '@/components/SectionHeader';
import { AlertEvent } from '@/types';
import styles from './index.module.scss';

const suggestionText = {
  verify: '先核实',
  respond: '需回应',
  report: '建议上报'
};

const HomePage: React.FC = () => {
  const { alerts } = useAppContext();

  const todayAlerts = useMemo(() => {
    const today = '2026-06-19';
    return alerts.filter(a => a.createdAt.startsWith(today));
  }, [alerts]);

  const dangerCount = todayAlerts.filter(a => a.level === 'danger').length;
  const warningCount = todayAlerts.filter(a => a.level === 'warning').length;
  const infoCount = todayAlerts.filter(a => a.level === 'info').length;
  const resolvedCount = todayAlerts.filter(a => a.status === 'resolved').length;

  const urgentAlert = todayAlerts.find(a => a.level === 'danger');

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
  });

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>下午好，值班同事</Text>
        <Text className={styles.subtitle}>当前时间 2026-06-19 14:30</Text>
        <View className={styles.dutyInfo}>
          <Text className={styles.dutyLabel}>今日值班：</Text>
          <Text className={styles.dutyName}>张主任 · 公共事务部</Text>
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
