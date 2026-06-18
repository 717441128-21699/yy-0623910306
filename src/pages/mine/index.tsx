import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppContext } from '@/store/app-context';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { alerts, subscriptions } = useAppContext();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [silentEnabled, setSilentEnabled] = useState(false);

  const pendingCount = alerts.filter(a => a.status !== 'resolved').length;
  const activeSubs = subscriptions.filter(s => s.isActive).length;

  const handleMenuClick = (label: string) => {
    Taro.showToast({ title: `${label} 功能开发中`, icon: 'none' });
    console.log('[MinePage] menu clicked', { label });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>
            <Text>张</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>张主任</Text>
            <Text className={styles.userDept}>公共事务部 · 总监</Text>
            <View className={styles.userRole}>
              <Text>值班负责人</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.profileStat}>
          <Text className={styles.profileStatNum}>{pendingCount}</Text>
          <Text className={styles.profileStatLabel}>待处理事件</Text>
        </View>
        <View className={styles.profileStat}>
          <Text className={styles.profileStatNum}>{activeSubs}</Text>
          <Text className={styles.profileStatLabel}>活跃词包</Text>
        </View>
        <View className={styles.profileStat}>
          <Text className={styles.profileStatNum}>12</Text>
          <Text className={styles.profileStatLabel}>本月处理</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>通知设置</View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}><Text>🔔</Text></View>
          <Text className={styles.menuLabel}>推送通知</Text>
          <Switch
            className={styles.switch}
            checked={pushEnabled}
            color="#1E3A8A"
            onChange={(e) => setPushEnabled(e.detail.value)}
          />
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}><Text>🌙</Text></View>
          <Text className={styles.menuLabel}>夜间免打扰</Text>
          <Text className={styles.menuExtra}>22:00-07:00</Text>
          <Switch
            className={styles.switch}
            checked={silentEnabled}
            color="#1E3A8A"
            onChange={(e) => setSilentEnabled(e.detail.value)}
          />
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('预警阈值')}>
          <View className={styles.menuIcon}><Text>📊</Text></View>
          <Text className={styles.menuLabel}>全局预警阈值</Text>
          <Text className={styles.menuExtra}>平衡</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>团队协作</View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('团队成员')}>
          <View className={styles.menuIcon}><Text>👥</Text></View>
          <Text className={styles.menuLabel}>团队成员</Text>
          <Text className={styles.menuExtra}>8人</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('值班排班')}>
          <View className={styles.menuIcon}><Text>📅</Text></View>
          <Text className={styles.menuLabel}>值班排班</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('操作日志')}>
          <View className={styles.menuIcon}><Text>📋</Text></View>
          <Text className={styles.menuLabel}>操作日志</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>其他</View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('意见反馈')}>
          <View className={styles.menuIcon}><Text>💬</Text></View>
          <Text className={styles.menuLabel}>意见反馈</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('关于我们')}>
          <View className={styles.menuIcon}><Text>ℹ️</Text></View>
          <Text className={styles.menuLabel}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.version}>政务预警 v1.0.0</Text>
    </ScrollView>
  );
};

export default MinePage;
