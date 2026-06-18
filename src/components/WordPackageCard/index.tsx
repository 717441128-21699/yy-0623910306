import React from 'react';
import { View, Text, Button, Switch } from '@tarojs/components';
import { WordPackage, SubscriptionCategory } from '@/types';
import { useAppContext } from '@/store/app-context';
import styles from './index.module.scss';

interface WordPackageCardProps {
  pkg: WordPackage;
  showSubscribe?: boolean;
}

const categoryText: Record<SubscriptionCategory, string> = {
  industry: '行业监管',
  local_policy: '地方政策',
  executive: '高管关联',
  project: '项目属地'
};

const WordPackageCard: React.FC<WordPackageCardProps> = ({ pkg, showSubscribe }) => {
  const { subscriptions, toggleSubscription, updateThreshold, subscribePackage } = useAppContext();
  const isSubscribed = subscriptions.some(s => s.id === pkg.id);
  const sub = subscriptions.find(s => s.id === pkg.id);
  const displayThreshold = sub?.threshold ?? pkg.threshold;
  const isActive = sub?.isActive ?? pkg.isActive;

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sub && displayThreshold > 10) {
      updateThreshold(pkg.id, displayThreshold - 5);
    }
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sub && displayThreshold < 100) {
      updateThreshold(pkg.id, displayThreshold + 5);
    }
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    subscribePackage(pkg.id);
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.name}>{pkg.name}</Text>
        {!showSubscribe && (
          <Switch
            className={styles.switch}
            checked={isActive}
            color="#1E3A8A"
            onChange={() => toggleSubscription(pkg.id)}
          />
        )}
        {showSubscribe && !isSubscribed && (
          <Button className={styles.subscribeBtn} onClick={handleSubscribe}>
            订阅
          </Button>
        )}
        {showSubscribe && isSubscribed && (
          <View className={styles.subscribedTag}>已订阅</View>
        )}
      </View>

      <View className={styles.categoryTag}>
        <Text>{categoryText[pkg.category]}</Text>
      </View>

      <Text className={styles.desc}>{pkg.description}</Text>

      <View className={styles.keywordsRow}>
        {pkg.keywords.map(kw => (
          <View key={kw} className={styles.keyword}>
            <Text>{kw}</Text>
          </View>
        ))}
      </View>

      {isSubscribed && (
        <View className={styles.thresholdRow}>
          <Text className={styles.thresholdLabel}>提醒阈值</Text>
          <View className={styles.thresholdValue}>
            <View className={styles.thresholdControl}>
              <Button className={styles.btn} onClick={handleMinus}>-</Button>
            </View>
            <Text className={styles.thresholdNum}>{displayThreshold}</Text>
            <Text className={styles.thresholdUnit}>分</Text>
            <View className={styles.thresholdControl}>
              <Button className={styles.btn} onClick={handlePlus}>+</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default WordPackageCard;
