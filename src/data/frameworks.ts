import coverTemplateSvg from '../assets/frameworks/competition-cover-template.svg';
import coverTemplateSource from '../assets/frameworks/competition-cover-template.svg?raw';
import eventSecuritySvg from '../assets/frameworks/event-security-tiered-governance.svg';
import eventSecuritySource from '../assets/frameworks/event-security-tiered-governance.svg?raw';
import adaptiveGovernanceSvg from '../assets/frameworks/four-stage-adaptive-governance.svg';
import adaptiveGovernanceSource from '../assets/frameworks/four-stage-adaptive-governance.svg?raw';
import highConflictPolicySvg from '../assets/frameworks/high-conflict-policy.svg';
import highConflictPolicySource from '../assets/frameworks/high-conflict-policy.svg?raw';
import nestedMechanismSvg from '../assets/frameworks/nested-public-private-tiaokuai.svg';
import nestedMechanismSource from '../assets/frameworks/nested-public-private-tiaokuai.svg?raw';
import problemMechanismResultSvg from '../assets/frameworks/problem-mechanism-result.svg';
import problemMechanismResultSource from '../assets/frameworks/problem-mechanism-result.svg?raw';

export type FrameworkFileType = 'svg' | 'png' | 'jpg';

export type FrameworkSource = 'sample' | 'local' | 'github';

export type FrameworkCategory =
  | '政策执行框架'
  | '基层治理机制'
  | '综合治理与国家在场'
  | '公私条块关系'
  | 'AI治理与公共信任'
  | '生态治理与价值共创'
  | '案例比赛通用模板'
  | '其他';

export type FrameworkType =
  | '机制图'
  | '时间轴'
  | '左右结构'
  | '封面图'
  | '总结页'
  | '理论框架'
  | '流程图'
  | '矩阵图'
  | '其他';

export interface FrameworkItem {
  id: string;
  title: string;
  category: FrameworkCategory;
  type: FrameworkType;
  scene: string;
  description: string;
  tags: string[];
  imagePath: string;
  fileType: FrameworkFileType;
  source: FrameworkSource;
  sourceType?: FrameworkSource;
  svgSource?: string;
  citation?: string;
  notes?: string;
  talkScript?: string;
  createdAt?: string;
  updatedAt?: string;
  fileName?: string;
  githubSyncedAt?: string;
  githubImagePath?: string;
  githubRecordId?: string;
}

export type GitHubFrameworkRecord = Omit<
  FrameworkItem,
  'source' | 'sourceType' | 'svgSource' | 'githubSyncedAt' | 'githubImagePath' | 'githubRecordId'
> & {
  sourceType: 'github';
  createdAt: string;
  updatedAt: string;
};

export type GitHubFrameworkItem = FrameworkItem & {
  source: 'github';
  sourceType: 'github';
  createdAt: string;
  updatedAt: string;
};

export const frameworkCategories: FrameworkCategory[] = [
  '政策执行框架',
  '基层治理机制',
  '综合治理与国家在场',
  '公私条块关系',
  'AI治理与公共信任',
  '生态治理与价值共创',
  '案例比赛通用模板',
  '其他',
];

export const frameworkTypes: FrameworkType[] = [
  '机制图',
  '时间轴',
  '左右结构',
  '封面图',
  '总结页',
  '理论框架',
  '流程图',
  '矩阵图',
  '其他',
];

export const frameworks: FrameworkItem[] = [
  {
    id: 'high-conflict-policy',
    title: '高模糊—高冲突政策执行框架',
    category: '政策执行框架',
    type: '理论框架',
    scene: '政策执行案例、冲突型治理议题、公共政策课程汇报',
    description:
      '用于解释目标模糊、利益冲突与执行者裁量之间的关系，适合放在理论分析或机制解释部分。',
    tags: ['政策执行', '高模糊', '高冲突', '执行裁量', '协商治理'],
    imagePath: highConflictPolicySvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: highConflictPolicySource,
  },
  {
    id: 'problem-mechanism-result',
    title: '基层治理问题—机制—结果图',
    category: '基层治理机制',
    type: '机制图',
    scene: '基层治理案例分析、综合治理复盘、案例比赛主体逻辑页',
    description:
      '以“问题识别—机制建构—治理结果”为主线，帮助呈现案例分析中的因果链条。',
    tags: ['基层治理', '综合治理', '问题机制结果', '党建统合', '数字赋能'],
    imagePath: problemMechanismResultSvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: problemMechanismResultSource,
  },
  {
    id: 'four-stage-adaptive-governance',
    title: '四阶段适应性治理演化图',
    category: '基层治理机制',
    type: '时间轴',
    scene: '治理过程复盘、事件演化分析、案例时间线展示',
    description:
      '适合表现治理方案从识别、试探、扩散到制度化的阶段演进，强调动态调适。',
    tags: ['适应性治理', '时间轴', '阶段演化', '风险治理', '制度化'],
    imagePath: adaptiveGovernanceSvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: adaptiveGovernanceSource,
  },
  {
    id: 'nested-public-private-tiaokuai',
    title: '公私条块模糊嵌套机制图',
    category: '公私条块关系',
    type: '左右结构',
    scene: '政社协同、公私合作、条块关系与边界模糊议题',
    description:
      '用于展示公共部门与社会/市场主体之间在条块结构、资源供给和责任共担中的嵌套关系。',
    tags: ['公私模糊', '条块关系', '政社协同', '边界协商', '价值共创'],
    imagePath: nestedMechanismSvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: nestedMechanismSource,
  },
  {
    id: 'event-security-tiered-governance',
    title: '大型活动安全保障梯次治理图',
    category: '综合治理与国家在场',
    type: '总结页',
    scene: '大型活动治理、安全保障复盘、风险治理总结页',
    description:
      '用梯次结构呈现从常态预防到核心风险控制的安全保障体系，适合作为结论页或经验总结页。',
    tags: ['风险治理', '大型活动', '安全保障', '梯次治理', '闭环改进'],
    imagePath: eventSecuritySvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: eventSecuritySource,
  },
  {
    id: 'competition-cover-template',
    title: '案例比赛黑白封面模板',
    category: '案例比赛通用模板',
    type: '封面图',
    scene: '案例比赛封面、课程展示首页、学术汇报开场页',
    description:
      '黑白克制的案例展示封面模板，可用于统一汇报风格，并承载标题、团队和日期信息。',
    tags: ['案例封面', '黑白模板', '学术汇报', '案例比赛', '版式'],
    imagePath: coverTemplateSvg,
    fileType: 'svg',
    source: 'sample',
    svgSource: coverTemplateSource,
  },
];
