import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { AlertLevel } from '@/types';
import styles from './index.module.scss';

interface LevelTagProps {
  level: AlertLevel;
}

const LevelTag: React.FC<LevelTagProps> = ({ level }) => {
  const textMap = {
    danger: '高危',
    warning: '警示',
    info: '关注'
  };

  return (
    <View className={classnames(styles.tag, styles[level])}>
      <Text>{textMap[level]}</Text>
    </View>
  );
};

export default LevelTag;
