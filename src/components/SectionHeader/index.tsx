import React, { ReactNode } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  extra?: ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, extra }) => {
  return (
    <View className={styles.header}>
      <Text className={styles.title}>{title}</Text>
      {extra && <View className={styles.extra}>{extra}</View>}
    </View>
  );
};

export default SectionHeader;
