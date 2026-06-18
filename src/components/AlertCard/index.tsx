import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { AlertEvent } from '@/types';
import LevelTag from '../LevelTag';
import StatusBadge from '../StatusBadge';
import styles from './index.module.scss';

interface AlertCardProps {
  alert: AlertEvent;
}

const suggestionText = {
  verify: '先核实',
  respond: '需回应',
  report: '建议上报'
};

const categoryText = {
  industry: '行业监管',
  local_policy: '地方政策',
  executive: '高管关联',
  project: '项目属地'
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/event-detail/index?id=${alert.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{alert.title}</Text>
        <LevelTag level={alert.level} />
      </View>

      <View className={styles.tagRow}>
        <StatusBadge status={alert.status} />
        <View className={styles.metaItem}>
          <Text>{categoryText[alert.category]}</Text>
        </View>
      </View>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text>讨论量 {alert.discussionCount.toLocaleString()}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text>负面占比 {alert.negativeRatio}%</Text>
        </View>
        <View className={styles.metaItem}>
          <Text>{alert.createdAt.slice(5, 16)}</Text>
        </View>
      </View>

      <View className={styles.ownerRow}>
        <View className={classnames(styles.ownerTag, styles.locationTag, !alert.location && styles.ownerEmpty)}>
          <Text>📍 {alert.location || '待标记属地'}</Text>
        </View>
        <View className={classnames(styles.ownerTag, styles.deptTag, !alert.department && styles.ownerEmpty)}>
          <Text>🏢 {alert.department || '待分配部门'}</Text>
        </View>
      </View>

      <View className={styles.trigger}>
        <Text>{alert.triggerReason}</Text>
      </View>

      <View className={styles.suggestionRow}>
        <View className={styles.suggestion}>
          <Text className={styles.suggestionLabel}>处置建议：</Text>
          <View className={classnames(styles.suggestionBadge, styles[alert.suggestion])}>
            <Text>{suggestionText[alert.suggestion]}</Text>
          </View>
        </View>
        <Text className={styles.arrow}>›</Text>
      </View>
    </View>
  );
};

export default AlertCard;
