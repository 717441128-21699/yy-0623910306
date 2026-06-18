import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import SectionHeader from '@/components/SectionHeader';
import { Briefing, AlertLevel, BriefingTarget } from '@/types';
import styles from './index.module.scss';

const levelClassMap: Record<AlertLevel, string> = {
  danger: 'dotDanger',
  warning: 'dotWarning',
  info: 'dotInfo'
};

const targetMeta: Record<BriefingTarget, { name: string; icon: string }> = {
  legal: { name: '法务', icon: '⚖' },
  brand: { name: '品牌', icon: '🎯' },
  pr: { name: '公关', icon: '📢' }
};

const EMPTY_SEND: BriefingSendStatus = { legal: false, brand: false, pr: false };
const ALL_SEND: BriefingSendStatus = { legal: true, brand: true, pr: true };

const BriefingPage: React.FC = () => {
  const { todayBriefing, briefings, sendBriefingToTarget, sendBriefingAll } = useAppContext();
  const historyBriefings = useMemo(() => briefings.slice(1), [briefings]);
  const allTargets: BriefingTarget[] = ['legal', 'brand', 'pr'];
  const todaySend = todayBriefing.sendStatus ?? EMPTY_SEND;
  const allDone = allTargets.every(t => todaySend[t]);

  const handleSendSingle = (target: BriefingTarget) => {
    if (todaySend[target]) {
      Taro.showToast({ title: `${targetMeta[target].name}已发送`, icon: 'none' });
      return;
    }
    sendBriefingToTarget(todayBriefing.id, target);
    Taro.showToast({ title: `已发送给${targetMeta[target].name}`, icon: 'success' });
    console.log('[BriefingPage] send to single target', { target });
  };

  const handleSendAll = () => {
    if (allDone) {
      Taro.showToast({ title: '已全部发送', icon: 'none' });
      return;
    }
    sendBriefingAll(todayBriefing.id);
    Taro.showToast({ title: '已同步发送给所有负责人', icon: 'success' });
    console.log('[BriefingPage] send all targets');
  };

  const handlePreview = () => {
    Taro.showToast({ title: '预览功能开发中', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.todayCard}>
        <View className={styles.todayHeader}>
          <Text className={styles.todayLabel}>今日简报 · 自动生成于 {todayBriefing.generatedAt.slice(11, 16)}</Text>
          <View className={styles.todayStatus}>
            <Text>{allDone ? '已全部发送' : `${allTargets.filter(t => todaySend[t]).length}/3 已发送`}</Text>
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

      <View className={styles.targetStatus}>
        <Text className={styles.targetTitle}>发送对象</Text>
        <View className={styles.targetRow}>
          {allTargets.map(t => {
            const meta = targetMeta[t];
            const done = todaySend[t];
            return (
              <View key={t} className={classnames(styles.targetItem, done && styles.targetDone)}>
                <View className={styles.targetIcon}>
                  <Text>{done ? '✓' : meta.icon}</Text>
                </View>
                <Text className={styles.targetName}>{meta.name}</Text>
                <Text className={styles.targetState}>{done ? '已发送' : '待发送'}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.historySection}>
        <SectionHeader title="历史简报" />
        {historyBriefings.map(b => (
          <HistoryCard key={b.id} briefing={b} />
        ))}
      </View>

      <View className={styles.sendBar}>
        <Button className={styles.previewBtn} onClick={handlePreview}>预览简报全文</Button>
        {allTargets.map(t => (
          <Button
            key={t}
            className={classnames(styles.singleSendBtn, todaySend[t] && styles.singleDone)}
            onClick={() => handleSendSingle(t)}
          >
            {todaySend[t] ? `✓ ${targetMeta[t].name}已发` : `发给${targetMeta[t].name}`}
          </Button>
        ))}
        <Button
          className={classnames(styles.sendAllBtn, allDone && styles.allDone)}
          onClick={handleSendAll}
        >
          {allDone ? '✓ 已同步给法务 / 品牌 / 公关' : '一键发送给所有负责人'}
        </Button>
      </View>
    </ScrollView>
  );
};

const HistoryCard: React.FC<{ briefing: Briefing }> = ({ briefing }) => {
  const allTargets: BriefingTarget[] = ['legal', 'brand', 'pr'];
  const send = briefing.sendStatus ?? (briefing.isSent ? ALL_SEND : EMPTY_SEND);
  const doneCount = allTargets.filter(t => send[t]).length;
  return (
    <View className={styles.historyCard}>
      <View className={styles.historyHeader}>
        <Text className={styles.historyDate}>{briefing.date}</Text>
        <View className={classnames(styles.historyTag, briefing.isSent ? styles.sent : styles.unsent)}>
          <Text>{briefing.isSent ? `已发送 ${doneCount}/3` : '草稿'}</Text>
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
      <View className={styles.historyTargets}>
        <View className={styles.historyTargetRow}>
          {allTargets.map(t => {
            const meta = targetMeta[t];
            const done = send[t];
            return (
              <View
                key={t}
                className={classnames(styles.historyTargetItem, done && styles.historyTargetDone)}
              >
                <Text className={styles.historyTargetIcon}>{done ? '✓' : meta.icon}</Text>
                <Text>{meta.name}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default BriefingPage;
