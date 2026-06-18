import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import WordPackageCard from '@/components/WordPackageCard';
import SectionHeader from '@/components/SectionHeader';
import { SubscriptionCategory } from '@/types';
import styles from './index.module.scss';

const categories: { key: SubscriptionCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'industry', label: '行业监管' },
  { key: 'local_policy', label: '地方政策' },
  { key: 'executive', label: '高管关联' },
  { key: 'project', label: '项目属地' }
];

const SubscribePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SubscriptionCategory | 'all'>('all');
  const { subscriptions, allWordPackages } = useAppContext();

  const subscribedIds = useMemo(() => new Set(subscriptions.map(s => s.id)), [subscriptions]);

  const filteredSubscribed = useMemo(() => {
    if (activeCategory === 'all') return subscriptions;
    return subscriptions.filter(s => s.category === activeCategory);
  }, [subscriptions, activeCategory]);

  const filteredAvailable = useMemo(() => {
    const available = allWordPackages.filter(p => !subscribedIds.has(p.id));
    if (activeCategory === 'all') return available;
    return available.filter(p => p.category === activeCategory);
  }, [allWordPackages, subscribedIds, activeCategory]);

  return (
    <ScrollView scrollY className={styles.page}>
      <ScrollView scrollX className={styles.categoryBar}>
        {categories.map(cat => (
          <View
            key={cat.key}
            className={classnames(styles.categoryItem, activeCategory === cat.key && styles.active)}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>词包订阅说明</Text>
          <Text className={styles.tipText}>选择需要关注的词包并设置提醒阈值（分值越高越敏感），当相关话题讨论量或负面情绪超过阈值时，您将收到即时推送提醒。</Text>
        </View>

        <SectionHeader title={`已订阅（${filteredSubscribed.length}）`} />
        {filteredSubscribed.map(pkg => (
          <WordPackageCard key={pkg.id} pkg={pkg} />
        ))}
        {filteredSubscribed.length === 0 && (
          <View style={{ padding: '48rpx 0', textAlign: 'center', color: '#94A3B8', fontSize: '26rpx' }}>
            <Text>该分类暂无已订阅词包</Text>
          </View>
        )}

        {filteredAvailable.length > 0 && (
          <>
            <SectionHeader title="更多词包" />
            {filteredAvailable.map(pkg => (
              <WordPackageCard key={pkg.id} pkg={pkg} showSubscribe />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SubscribePage;
