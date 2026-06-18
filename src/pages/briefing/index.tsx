import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import SectionHeader from '@/components/SectionHeader';
import { Briefing, AlertLevel } from '@/types';
import styles from './index.module.scss';

const levelClassMap: Record<AlertLevel, string> = {
  danger: 'dotDanger',
  warning: 'dotWarning',
  info: 'dotInfo'
};

const BriefingPage: React.FC = () => {
  const { todayBriefing, briefings, sendBriefing } = useAppContext();
  const historyBriefings = useMemo(() => briefings.slice(1), [briefings]);

  const handleSend = (id: string) => {
    sendBriefing(id);
    Taro.showToast({ title: '已同步发送', icon: 'success' });
    console.log('[BriefingPage] send briefing', { id });
  };

  const handlePreview = () => {
    Taro.showToast({ title: '预览功能开发中', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      {todayBriefing && (
        <View className={styles.todayCard}>
          <View className={styles.todayHeader}>
            <Text className={styles.todayLabel}>今日简报 · 自动生成于 {todayBriefing.generatedAt.slice(11, 16)}</Text>
            <View className={styles.todayStatus}>
              <Text>{todayBriefing.isSent ? '已发送' : '待发送'}</Text>
            </View>
          </View>
          <Text className={styles.todayTitle}>{todayBriefing.title}</Text>
          <Text className={styles.todaySummary}>{todayBriefing.summary}</Text>
          <View className={styles.todayStats}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.dangerColor)}>{todayBriefing.highRiskCount}</Text>
              <Text className={styles.statLabel}>高危</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.warningColor)}>{todayBriefing.warningCount}</Text>
              <Text className={styles.statLabel}>警示</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.infoColor)}>{todayBriefing.infoCount}</Text>
              <Text className={styles.statLabel}>关注</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statNum, styles.resolvedColor)}>{todayBriefing.resolvedCount}</Text>
              <Text className={styles.statLabel}>已处理</Text>
            </View>
          </View>

          {todayBriefing.events.length > 0 && (
            <View className={styles.eventList}>
              {todayBriefing.events.slice(0, 5).map(e => (
                <View key={e.id} className={styles.eventItem}>
                  <View className={classnames(styles.eventDot, styles[levelClassMap[e.level]])} />
                  <Text className={styles.eventText}>{e.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View className={styles.historySection}>
        <SectionHeader title="历史简报" />
        {historyBriefings.map(b => (
          <HistoryCard key={b.id} briefing={b} />
        ))}
      </View>

      <View className={styles.sendBar}>
        <Button className={styles.previewBtn} onClick={handlePreview}>预览</Button>
        {todayBriefing?.isSent ? (
          <Button className={styles.sentBtn} disabled>
            ✓ 已发送给法务/品牌/公关
          </Button>
        ) : (
          <Button className={styles.sendBtn} onClick={() => todayBriefing && handleSend(todayBriefing.id)}>
            发送给相关负责人
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const HistoryCard: React.FC<{ briefing: Briefing }> = ({ briefing }) => {
  return (
    <View className={styles.historyCard}>
      <View className={styles.historyHeader}>
        <Text className={styles.historyDate}>{briefing.date}</Text>
        <View className={classnames(styles.historyTag, briefing.isSent ? styles.sent : styles.unsent)}>
          <Text>{briefing.isSent ? '已发送' : '草稿'}</Text>
        </View>
      </View>
      <Text className={styles.historySummary}>{briefing.summary}</Text>
      <View className={styles.historyStats}>
        <View className={styles.historyStat}>
          <Text className={styles.histNum}>{briefing.highRiskCount}</Text>
          <Text>高危</Text>
        </View>
        <View className={styles.historyStat}>
          <Text className={styles.histNum}>{briefing.warningCount}</Text>
          <Text>警示</Text>
        </View>
        <View className={styles.historyStat}>
          <Text className={styles.histNum}>{briefing.infoCount}</Text>
          <Text>关注</Text>
        </View>
        <View className={styles.historyStat}>
          <Text className={styles.histNum}>{briefing.resolvedCount}</Text>
          <Text>已处理</Text>
        </View>
      </View>
    </View>
  );
};

export default BriefingPage;
