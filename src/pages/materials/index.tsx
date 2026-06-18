import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import MaterialItem from '@/components/MaterialItem';
import { MaterialType } from '@/types';
import styles from './index.module.scss';

const tabs: { key: MaterialType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'comment', label: '评论' },
  { key: 'media', label: '媒体' },
  { key: 'official', label: '官方' }
];

const MaterialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MaterialType | 'all'>('all');
  const { alerts } = useAppContext();

  const allMaterials = useMemo(() => {
    return alerts.flatMap(a => a.materials);
  }, [alerts]);

  const filteredMaterials = useMemo(() => {
    if (activeTab === 'all') return allMaterials;
    return allMaterials.filter(m => m.type === activeTab);
  }, [allMaterials, activeTab]);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.typeTabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(m => (
            <MaterialItem key={m.id} material={m} />
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📎</Text>
            <Text className={styles.emptyTitle}>暂无素材</Text>
            <Text className={styles.emptyDesc}>在事件详情中可添加评论、媒体报道、官方信息到素材夹</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MaterialsPage;
