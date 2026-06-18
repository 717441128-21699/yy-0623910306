import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { MaterialItem as MaterialItemType } from '@/types';
import styles from './index.module.scss';

interface MaterialItemProps {
  material: MaterialItemType;
}

const typeText = {
  comment: '评论',
  media: '媒体',
  official: '官方'
};

const MaterialItem: React.FC<MaterialItemProps> = ({ material }) => {
  return (
    <View className={styles.item}>
      <View className={styles.header}>
        <View className={classnames(styles.typeTag, styles[material.type])}>
          <Text>{typeText[material.type]}</Text>
        </View>
        <Text className={styles.time}>{material.createdAt.slice(5, 16)}</Text>
      </View>
      <Text className={styles.title}>{material.title}</Text>
      <Text className={styles.source}>来源：{material.source}</Text>
      <Text className={styles.content}>{material.content}</Text>
    </View>
  );
};

export default MaterialItem;
