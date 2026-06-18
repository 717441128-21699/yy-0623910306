import { WordPackage } from '@/types';

export const mockSubscriptions: WordPackage[] = [
  {
    id: 's001',
    name: '行业监管政策',
    category: 'industry',
    description: '关注数据安全、反垄断、行业准入等国家级监管政策动态',
    keywords: ['数据安全法', '反垄断', '合规', '行业监管', '市场准入'],
    threshold: 60,
    isActive: true,
    subscribedAt: '2026-03-15 10:00:00'
  },
  {
    id: 's002',
    name: '地方政策动态',
    category: 'local_policy',
    description: '跟踪北上广深及项目所在地的产业、环保、税收政策',
    keywords: ['产业政策', '环保政策', '税收优惠', '地方政府', '园区政策'],
    threshold: 50,
    isActive: true,
    subscribedAt: '2026-03-15 10:00:00'
  },
  {
    id: 's003',
    name: '高管涉政关联',
    category: 'executive',
    description: '监测公司高管公开言论、活动参与及媒体报道中的敏感关联',
    keywords: ['董事长', 'CEO', '高管', '公开活动', '媒体采访'],
    threshold: 45,
    isActive: true,
    subscribedAt: '2026-03-15 10:00:00'
  },
  {
    id: 's004',
    name: '合作项目属地舆情',
    category: 'project',
    description: '收集各生产基地、项目所在地的民生投诉和政策变动',
    keywords: ['项目地', '属地', '群众投诉', '环保投诉', '征地'],
    threshold: 55,
    isActive: true,
    subscribedAt: '2026-03-15 10:00:00'
  }
];

export const availableWordPackages: WordPackage[] = [
  ...mockSubscriptions,
  {
    id: 's005',
    name: '资本市场动态',
    category: 'industry',
    description: '关注证券监管政策、信息披露要求及股东权益变动',
    keywords: ['证监会', '信息披露', '股东', '股价', '减持'],
    threshold: 50,
    isActive: false
  },
  {
    id: 's006',
    name: 'ESG与可持续发展',
    category: 'industry',
    description: '跟踪双碳目标、社会责任报告要求及ESG评级体系变化',
    keywords: ['ESG', '碳中和', '社会责任', '绿色金融', '可持续发展'],
    threshold: 45,
    isActive: false
  },
  {
    id: 's007',
    name: '国际贸易政策',
    category: 'industry',
    description: '监测进出口管制、关税调整及跨境经营合规要求',
    keywords: ['出口管制', '关税', '跨境合规', '贸易摩擦', '制裁'],
    threshold: 65,
    isActive: false
  }
];
