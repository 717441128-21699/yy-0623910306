import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import AlertCard from '@/components/AlertCard';
import { AlertLevel, AlertStatus } from '@/types';
import styles from './index.module.scss';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已处理' }
] as const;

const levelFilters: { key: AlertLevel | 'all'; label: string }[] = [
  { key: 'all', label: '全部级别' },
  { key: 'danger', label: '高危' },
  { key: 'warning', label: '警示' },
  { key: 'info', label: '关注' }
];

const EventsPage: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeLevel, setActiveLevel] = useState<AlertLevel | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const { alerts } = useAppContext();

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (activeStatus === 'pending' && a.status !== 'pending') return false;
      if (activeStatus === 'processing' && !['verifying', 'responding', 'reported'].includes(a.status)) return false;
      if (activeStatus === 'resolved' && a.status !== 'resolved') return false;
      if (activeLevel !== 'all' && a.level !== activeLevel) return false;
      if (searchText && !a.title.includes(searchText) && !a.summary.includes(searchText)) return false;
      return true;
    });
  }, [alerts, activeStatus, activeLevel, searchText]);

  const goToMaterials = () => {
    Taro.navigateTo({ url: '/pages/materials/index' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.topBar}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索事件关键词"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
        <View className={styles.entrance} onClick={goToMaterials}>
          <Text>📎</Text>
          <Text>素材夹</Text>
        </View>
      </View>

      <View className={styles.statusTabs}>
        {statusTabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeStatus === tab.key && styles.tabActive)}
            onClick={() => setActiveStatus(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.levelFilter}>
        {levelFilters.map(filter => (
          <View
            key={filter.key}
            className={classnames(
              styles.levelChip,
              activeLevel === filter.key && styles.chipActive,
              filter.key === 'danger' && styles.chipDanger,
              filter.key === 'warning' && styles.chipWarning,
              filter.key === 'info' && styles.chipInfo
            )}
            onClick={() => setActiveLevel(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无符合条件的事件</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default EventsPage;
