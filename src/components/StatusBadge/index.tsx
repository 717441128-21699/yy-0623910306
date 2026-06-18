import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { AlertStatus } from '@/types';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: AlertStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const textMap = {
    pending: '待处理',
    verifying: '核实中',
    responding: '回应中',
    reported: '已上报',
    resolved: '已处理'
  };

  return (
    <View className={classnames(styles.badge, styles[status])}>
      <Text>{textMap[status]}</Text>
    </View>
  );
};

export default StatusBadge;
