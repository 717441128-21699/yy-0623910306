import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppContext } from '@/store/app-context';
import LevelTag from '@/components/LevelTag';
import StatusBadge from '@/components/StatusBadge';
import MaterialItem from '@/components/MaterialItem';
import { AlertStatus, AlertLevel, MaterialType, SubscriptionCategory } from '@/types';
import styles from './index.module.scss';

const categoryText: Record<SubscriptionCategory, string> = {
  industry: '行业监管',
  local_policy: '地方政策',
  executive: '高管关联',
  project: '项目属地'
};

const suggestionText = {
  verify: '先核实',
  respond: '需回应',
  report: '建议上报'
};

const statusList: { key: AlertStatus; label: string }[] = [
  { key: 'pending', label: '待处理' },
  { key: 'verifying', label: '核实中' },
  { key: 'responding', label: '回应中' },
  { key: 'reported', label: '已上报' },
  { key: 'resolved', label: '已处理' }
];

const EventDetailPage: React.FC = () => {
  const router = useRouter();
  const { alerts, updateAlertStatus, updateAlertMeta, addMaterial } = useAppContext();
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<{ type: MaterialType; title: string; source: string; content: string }>({
    type: 'comment',
    title: '',
    source: '',
    content: ''
  });

  const alertId = router.params.id || 'a001';
  const alert = useMemo(() => alerts.find(a => a.id === alertId) || alerts[0], [alerts, alertId]);

  if (!alert) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ color: '#94A3B8' }}>事件不存在</Text>
        </View>
      </View>
    );
  }

  const handleStatusChange = (status: AlertStatus) => {
    updateAlertStatus(alert.id, status);
    Taro.showToast({ title: '状态已更新', icon: 'success' });
    console.log('[EventDetail] status changed', { id: alert.id, status });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.content) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    addMaterial(alert.id, newMaterial);
    setShowMaterialModal(false);
    setNewMaterial({ type: 'comment', title: '', source: '', content: '' });
    Taro.showToast({ title: '已加入素材夹', icon: 'success' });
    console.log('[EventDetail] material added', { alertId: alert.id, newMaterial });
  };

  const handleReport = () => {
    updateAlertStatus(alert.id, 'reported');
    Taro.showToast({ title: '已上报给上级', icon: 'success' });
  };

  const handleResolve = () => {
    updateAlertStatus(alert.id, 'resolved');
    Taro.showToast({ title: '已标记为已处理', icon: 'success' });
  };

  const goToMaterials = () => {
    Taro.navigateTo({ url: '/pages/materials/index' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.content}>
        <View className={styles.headerCard}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{alert.title}</Text>
            <LevelTag level={alert.level} />
          </View>
          <View className={styles.tagRow}>
            <StatusBadge status={alert.status} />
            <View style={{ display: 'inline-flex', alignItems: 'center', height: '40rpx', padding: '0 16rpx', borderRadius: '8rpx', background: 'rgba(30, 58, 138, 0.08)', color: '#1E3A8A', fontSize: '22rpx', fontWeight: '500' }}>
              <Text>{categoryText[alert.category]}</Text>
            </View>
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>讨论量：</Text>
              <Text className={styles.infoValue}>{alert.discussionCount.toLocaleString()}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>负面占比：</Text>
              <Text className={styles.infoValue} style={{ color: alert.negativeRatio > 50 ? '#DC2626' : '#475569' }}>{alert.negativeRatio}%</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>发布时间：</Text>
              <Text className={styles.infoValue}>{alert.createdAt.slice(5, 16)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>更新时间：</Text>
              <Text className={styles.infoValue}>{alert.updatedAt.slice(5, 16)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>AI 处置建议</View>
          <View className={styles.suggestionBox}>
            <View className={styles.suggestionIcon}>
              <Text>!</Text>
            </View>
            <View className={styles.suggestionContent}>
              <Text className={styles.suggestionLabel}>建议采取以下行动</Text>
              <Text className={styles.suggestionText}>{suggestionText[alert.suggestion]}</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>触发原因</View>
          <View className={styles.triggerBox}>
            <Text className={styles.triggerText}>{alert.triggerReason}</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>事件摘要</View>
          <Text className={styles.summary}>{alert.summary}</Text>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>属地与责任部门</View>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>属地</Text>
              <Text className={styles.metaValue}>{alert.location || '待标记'}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>责任部门</Text>
              <Text className={styles.metaValue}>{alert.department || '待分配'}</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>处理状态</View>
          <View className={styles.statusOptions}>
            {statusList.map(s => (
              <View
                key={s.key}
                className={classnames(styles.statusOption, alert.status === s.key && styles.statusActive)}
                onClick={() => handleStatusChange(s.key)}
              >
                <Text>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>关键词</View>
          <View className={styles.keywordsRow}>
            {alert.keywords.map(kw => (
              <View key={kw} className={styles.keywordTag}>
                <Text>#{kw}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text style={{ flex: 1 }}>相关素材</Text>
            <Text style={{ fontSize: '24rpx', color: '#1E3A8A' }} onClick={goToMaterials}>查看全部 ›</Text>
          </View>
          {alert.materials.length > 0 ? (
            alert.materials.map(m => (
              <MaterialItem key={m.id} material={m} />
            ))
          ) : (
            <View style={{ padding: '32rpx 0', textAlign: 'center', color: '#94A3B8', fontSize: '26rpx' }}>
              <Text>暂无素材，点击下方按钮添加</Text>
            </View>
          )}
          <Button className={styles.addMaterialBtn} onClick={() => setShowMaterialModal(true)}>
            + 添加素材（评论/媒体/官方）
          </Button>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handleReport}>上报</Button>
        <Button className={styles.primaryBtn} onClick={handleResolve}>标记已处理</Button>
      </View>

      {showMaterialModal && (
        <View className={styles.modalMask} onClick={() => setShowMaterialModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加素材</Text>
              <Text className={styles.modalClose} onClick={() => setShowMaterialModal(false)}>×</Text>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>素材类型</Text>
              <View className={styles.typeOptions}>
                {(['comment', 'media', 'official'] as MaterialType[]).map(t => (
                  <View
                    key={t}
                    className={classnames(styles.typeOption, newMaterial.type === t && styles.typeActive)}
                    onClick={() => setNewMaterial({ ...newMaterial, type: t })}
                  >
                    <Text>{t === 'comment' ? '评论' : t === 'media' ? '媒体报道' : '官方信息'}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>标题</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入素材标题"
                value={newMaterial.title}
                onInput={(e) => setNewMaterial({ ...newMaterial, title: e.detail.value })}
              />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>来源</Text>
              <Input
                className={styles.formInput}
                placeholder="如：微博、财经头条、中国政府网"
                value={newMaterial.source}
                onInput={(e) => setNewMaterial({ ...newMaterial, source: e.detail.value })}
              />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>内容</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请粘贴或输入素材内容"
                value={newMaterial.content}
                onInput={(e) => setNewMaterial({ ...newMaterial, content: e.detail.value })}
              />
            </View>
            <Button className={styles.submitBtn} onClick={handleAddMaterial}>加入素材夹</Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default EventDetailPage;
