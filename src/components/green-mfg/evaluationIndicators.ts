// 绿色工厂评价指标表（通则） GB/T 36132-2025 数据
// 字段含义见附件通则；本文件用于详情页展示与企业填报。

export type IndicatorType = "正向定量" | "逆向定量" | "正向定性";

/** 序号 1：当“有适用国家强制性能源消耗限额标准”时，企业按产品填报 */
export interface ProductEnergyEntry {
  name: string;          // 产品名称
  unit: string;          // 单位（tce/产品单位 或 kgce/产品单位）
  leadValue: string;     // 引领值（适用国家强制性能源消耗限额标准1级水平）
  baseValue: string;     // 基准值（适用国家强制性能源消耗限额标准2级水平）
  weight: string;        // 加权参数（三级指标对应的产品综合能耗（吨标煤））
  reportValue: string;   // 本年度指标值
  proofs: string[];      // 证明材料
}

export const EMPTY_PRODUCT_ENERGY_ENTRY: ProductEnergyEntry = {
  name: "",
  unit: "",
  leadValue: "",
  baseValue: "",
  weight: "",
  reportValue: "",
  proofs: [],
};

export interface IndicatorRow {
  id: string; // 唯一标识（用于更新时匹配）
  no: number; // 显示序号
  l1: string; // 一级指标
  l2: string; // 二级指标
  l3: string; // 三级指标
  type: IndicatorType;
  unit: string;
  leadValue?: string; // 引领值
  baseValue?: string; // 基准值
  weight?: string; // 加权参数
  reportValue?: string; // 企业填报：本年度指标值
  proofs: string[]; // 证明材料 (PDF/图片)
  govRemark?: string; // 政府审核备注
  proofRequirement: string; // 证明材料要求
  /** 一级指标在该行是否需要展示（用于合并） */
  showL1?: boolean;
  l1RowSpan?: number;
  /** 二级指标在该行是否需要展示 */
  showL2?: boolean;
  l2RowSpan?: number;
  /** 序号列是否展示（用于多子行合并），默认 true */
  showNo?: boolean;
  noRowSpan?: number;
  /** 加权参数列是否展示（用于多子行合并），默认 true */
  showWeight?: boolean;
  weightRowSpan?: number;
  /** 证明材料要求列是否展示（用于多子行合并），默认 true */
  showProofReq?: boolean;
  proofReqRowSpan?: number;
  /** 是否为子行（更紧凑的行高） */
  isSubRow?: boolean;
  /** 仅序号 1：是否有适用国家强制性能源消耗限额标准 */
  hasStandard?: "有" | "无";
  /** 仅序号 1 且 hasStandard='有' 时使用：产品一/二/三的填报数据 */
  products?: ProductEnergyEntry[];
  /** 仅序号 4：能碳管理系统平台功能符合数量 — 复选框选项 */
  platformFunctions?: string[];
  /** 当本年度指标值为单选项时使用 */
  reportOptions?: string[];
}

/** 序号 4：能碳管理系统平台功能符合项 候选 */
export const PLATFORM_FUNCTION_OPTIONS = [
  "能耗查询",
  "能源消费量和强度计算",
  "能源消费分析与用能策略推荐",
  "能效对标",
  "能流分析",
  "能效平衡与优化",
  "用能与碳排放预算管理",
  "碳排放核算",
  "碳足迹核算",
  "供应链碳管理",
  "碳核查支撑",
  "碳资产管理",
] as const;

export const EVALUATION_INDICATORS: IndicatorRow[] = [
  {
    id: "1",
    no: 1,
    l1: "能源低碳化",
    showL1: true,
    l1RowSpan: 7,
    l2: "能源消耗强度",
    showL2: true,
    l2RowSpan: 1,
    l3: "单位产值综合能耗（无适用国家强制性能源消耗限额标准时选用）",
    type: "逆向定量",
    unit: "kgce/万元",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    reportValue: "21.52",
    proofs: ["1.单位产值综合能耗_计算过程及其附件.pdf", "2.《能源购进、消费与库存》.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、报统计部门《工业产销总值及主要产品产量》（B204-1）、《能源购进、消费与库存》（205-1表）；3、《能源加工转换与回收利用》（205-2表）（如有）、《主要耗能工业企业单位产品能源消费情况》（205-3表）（如有）、《能源生产、销售与库存》（205-6表）（如有）；4、《重点用能单位能源利用状况报告》（如有）。",
    hasStandard: "无",
    products: [
      { ...EMPTY_PRODUCT_ENERGY_ENTRY },
      { ...EMPTY_PRODUCT_ENERGY_ENTRY },
      { ...EMPTY_PRODUCT_ENERGY_ENTRY },
    ],
  },
  {
    id: "2",
    no: 2,
    l1: "能源低碳化",
    l2: "碳排放强度",
    showL2: true,
    l2RowSpan: 1,
    l3: "单位产值碳排放量",
    type: "逆向定量",
    unit: "kgCO2/万元",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    reportValue: "24.58",
    proofs: ["1.单位产值碳排放量计算过程及其附件.pdf", "2.《工业产销总值及主要产品产量表》（B204-1表）.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、温室气体排放报告（依据相关核算标准给出的报告模板）；3、报统计部门《工业产销总值及主要产品产量》（B204-1）。",
  },
  {
    id: "3-1",
    no: 3,
    showNo: true,
    noRowSpan: 4,
    l1: "能源低碳化",
    l2: "可再生能源利用率",
    showL2: true,
    l2RowSpan: 4,
    l3: "可再生能源利用率-年综合能源消费量10000吨标煤以上的用能单位",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    showWeight: true,
    weightRowSpan: 4,
    reportValue: "",
    proofs: [],
    showProofReq: true,
    proofReqRowSpan: 4,
    proofRequirement:
      "1、指标计算过程及其附件；2、《能源购进、消费与库存》（205-1表）、《能源加工转换与回收利用》（205-2表）（如有）、《能源生产、销售与库存》（205-6表）（如有）；3、《可再生能源电力消纳核算清单》；4、可再生能源消费凭证（绿色电力市场化交易合同、交易结算凭证、绿证 GEC 等）；非电力形式可再生能源利用相关合同、协议等。注：《可再生能源电力消纳核算清单》可由电力交易机构出具或企业自行整理填报。",
  },
  {
    id: "3-2",
    no: 3,
    showNo: false,
    isSubRow: true,
    l1: "能源低碳化",
    l2: "可再生能源利用率",
    l3: "可再生能源利用率-年综合能源消费量5000吨及以上不满10000吨标煤的用能单位",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    showWeight: false,
    reportValue: "",
    proofs: [],
    showProofReq: false,
    proofRequirement: "",
  },
  {
    id: "3-3",
    no: 3,
    showNo: false,
    isSubRow: true,
    l1: "能源低碳化",
    l2: "可再生能源利用率",
    l3: "可再生能源利用率-年综合能源消费量3000吨及以上不满5000吨标煤的用能单位",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    showWeight: false,
    reportValue: "",
    proofs: [],
    showProofReq: false,
    proofRequirement: "",
  },
  {
    id: "3-4",
    no: 3,
    showNo: false,
    isSubRow: true,
    l1: "能源低碳化",
    l2: "可再生能源利用率",
    l3: "可再生能源利用率-年综合能源消费量3000吨标煤以下的用能单位",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "8",
    showWeight: false,
    reportValue: "20.60",
    proofs: ["1.可再生能源利用率计算过程及其附件.pdf", "2.可再生能源电力消纳清单.pdf", "3.光伏照片.pdf"],
    showProofReq: false,
    proofRequirement: "",
  },
  {
    id: "4",
    no: 4,
    l1: "能源低碳化",
    l2: "能碳管理系统平台功能符合数量",
    showL2: true,
    l2RowSpan: 1,
    l3: "能碳管理系统平台功能符合数量",
    type: "正向定量",
    unit: "项",
    leadValue: "8",
    baseValue: "/",
    weight: "6",
    reportValue: "",
    platformFunctions: ["能耗查询", "能源消费量和强度计算"],
    proofs: ["1.平台截图.pdf"],
    proofRequirement:
      "1、平台系统架构设计文档，说明与相关业务功能的对应关系；2、平台开发采购合同、部署验收报告（如有）；3、平台功能实现或效果验证材料，例如用户操作手册、功能截图（大屏看板、APP能耗实时展示等功能界面）等。",
  },
  {
    id: "5-1",
    no: 5,
    showNo: true,
    noRowSpan: 2,
    l1: "资源高效化",
    showL1: true,
    l1RowSpan: 5,
    l2: "节约原材料",
    showL2: true,
    l2RowSpan: 2,
    l3: "减少生产过程中原辅材料消耗的应用案例",
    type: "正向定性",
    unit: "/",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "提供本单位减少生产过程中原辅材料消耗的应用案例",
    reportOptions: ["提供本单位减少生产过程中原辅材料消耗的应用案例", "未提供"],
    proofs: ["1.节约原材料自评价报告.pdf", "2.设计开发控制程序.pdf"],
    proofRequirement: "1、提供本单位减少生产过程中原辅材料消耗的应用案例。",
  },
  {
    id: "6",
    no: 6,
    l1: "资源高效化",
    l2: "节约原材料",
    l3: "使用再生材料、回收再利用材料或可回收材料替代原生材料、不可回收材料改善应用案例",
    type: "正向定性",
    unit: "/",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "提供本单位使用再生材料、回收再利用材料或可回收材料替代原生材料、不可回收材料改善应用案例",
    proofs: ["1.回料使用比率规范.pdf", "2.回料掺比表2024.pdf"],
    proofRequirement: "1、提供本单位使用再生材料、回收再利用材料或可回收材料替代原生材料、不可回收材料改善应用案例。",
  },
  {
    id: "7",
    no: 7,
    l1: "资源高效化",
    l2: "取水强度",
    showL2: true,
    l2RowSpan: 1,
    l3: "单位产值取水量（无适用工业用水定额国家标准时选用）",
    type: "逆向定量",
    unit: "m3/万元",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "/",
    proofs: [],
    proofRequirement:
      "1、指标计算过程及其附件；2、报统计部门《工业产销总值及主要产品产量》（B204-1）、《工业企业用水情况》（205-4表）；3、工业用水统计台账。",
  },
  {
    id: "8",
    no: 8,
    l1: "资源高效化",
    l2: "工业用水重复利用率",
    showL2: true,
    l2RowSpan: 1,
    l3: "工业用水重复利用率",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "/",
    proofs: [],
    proofRequirement:
      "1、指标计算过程及其附件；2、报统计部门《工业企业用水情况》（205-4表）；3、重复用水量证明，例如循环水量、串联水量、废水处理回用水量等计量或记录台账；4、重复用水设施、关键区域现场实景照片。",
  },
  {
    id: "9",
    no: 9,
    l1: "资源高效化",
    l2: "一般工业固体废物综合利用率",
    showL2: true,
    l2RowSpan: 1,
    l3: "一般工业固体废物综合利用率",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "100.00",
    proofs: ["1.一般工业固体废物综合利用率计算过程及其附件.pdf", "2.固体废物管理台账统计汇总表.pdf", "3.综合利用文件.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、一般工业固体废物统计台账，包含年度产生量、综合利用量、综合利用往年贮存量等指标计算关键参数信息；3、报生态环境部门《工业企业污染物和温室气体排放及治理情况》（基101表）（如有）；4、综合利用证明，例如资源化技术方案、工艺流程图等自行利用说明；委外综合利用协议及综合利用单位资质证明、转移量确认单或相关凭证。",
  },
  {
    id: "10",
    no: 10,
    l1: "生产洁净化",
    showL1: true,
    l1RowSpan: 3,
    l2: "生产工艺设备先进性",
    showL2: true,
    l2RowSpan: 1,
    l3: "采用《国家工业和信息化领域节能降碳技术装备推荐目录》《国家鼓励的工业节水工艺、技术和装备目录》《国家工业资源综合利用先进适用工艺技术设备目录》《国家鼓励发展的重大环保技术装备目录》《绿色技术推广目录》《国家重点推广的低碳技术目录》《国家污染防治技术指导目录》《产业结构调整指导目录》范围内的先进技术和设备的数量",
    type: "正向定量",
    unit: "项",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "2",
    proofs: ["1.采用相关生产工艺和设备的说明.pdf"],
    proofRequirement: "1、采用相关生产工艺和设备的说明。",
  },
  {
    id: "11",
    no: 11,
    l1: "生产洁净化",
    l2: "绿色低碳改造升级",
    showL2: true,
    l2RowSpan: 2,
    l3: "近3年实施绿色低碳改造升级年平均项目数量",
    type: "正向定量",
    unit: "项",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "1.00",
    proofs: ["1.节能技改项目清单.pdf"],
    proofRequirement:
      "1、近三年绿色低碳改造升级项目清单（按项目完成时间在近三年计）；2、项目相关合同及立项、审批、验收材料（如有）；3、项目结题报告（包含节能、降碳、减污、节材等效益计算说明）（如有）。",
  },
  {
    id: "12",
    no: 12,
    l1: "生产洁净化",
    l2: "绿色低碳改造升级",
    l3: "近3年绿色低碳改造升级项目投资额占比",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "8.86",
    proofs: ["1.近三年绿色低碳改造升级项目投资额占比计算过程及其附件.pdf", "2.节能技改项目清单.pdf", "3.光伏发电项目安装合同.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、近三年绿色低碳改造升级项目清单（按项目完成时间在近三年计）；3、项目投资证明，例如项目合同、验收材料、支付凭证、专项审计报告等；4、报统计部门《工业产销总值及主要产品产量》（B204-1）。",
  },
  {
    id: "13",
    no: 13,
    l1: "产品绿色化",
    showL1: true,
    l1RowSpan: 3,
    l2: "主要污染物年均排放浓度",
    showL2: true,
    l2RowSpan: 1,
    l3: "废气主要污染物年均排放浓度优于许可排放浓度限值的最低比例（不涉及工业废气排放的企业不填）",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "100.00",
    proofs: ["1.主要污染物年均排放浓度计算过程及其附件（废气：颗粒物1#排气筒）.pdf", "2.主要污染物年均排放浓度计算过程及其附件.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、排污许可相关文件，例如排污许可证正本、副本，排污登记表；3、排污许可证执行报告年报（如有）；4、报生态环境部门《工业企业污染物和温室气体排放及治理情况》（基101表）（如有）；5、污染物在线监测记录（包含年均排放浓度数据）；如不能提供，请提交环境检测报告（监测频次至少季度1次/季节性生产单位应保证在生产期内监测次数不少于4次或不低于每月1次）；6、污染物治理措施说明。",
  },
  {
    id: "14",
    no: 14,
    l1: "产品绿色化",
    l2: "绿色设计",
    showL2: true,
    l2RowSpan: 1,
    l3: "绿色设计典型应用案例",
    type: "正向定性",
    unit: "/",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "提供绿色设计典型应用案例",
    proofs: ["1.设计开发控制程序.pdf", "2.生态设计自评价报告.pdf", "3.回料使用比率规范.pdf"],
    proofRequirement:
      "1、绿色设计典型应用案例（围绕轻量化、无害化、长寿命、节能、易回收、可拆解、易再生等方面提供绿色设计典型应用案例，全面展示企业研发人员在设计环节运用绿色设计理念开展绿色设计）。",
  },
  {
    id: "15",
    no: 15,
    l1: "产品绿色化",
    l2: "产品碳足迹",
    showL2: true,
    l2RowSpan: 1,
    l3: "开展碳足迹核算产品类别占比",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "100.00",
    proofs: ["1.产品碳足迹计算过程及其附件.pdf", "2.《工业产销总值及主要产品产量表》（B204-1表）.pdf", "3.产品碳足迹核查报告.pdf"],
    proofRequirement:
      "1、指标计算过程及其附件；2、报统计部门《工业产销总值及主要产品产量》（B204-1）；3、提供评价年相关产品碳足迹报告（参考 GB/T 24067 等相关依据标准给出的报告模板）。",
  },
  {
    id: "16",
    no: 16,
    l1: "用地集约化",
    showL1: true,
    l1RowSpan: 3,
    l2: "土地产出率",
    showL2: true,
    l2RowSpan: 3,
    l3: "单位用地面积产值",
    type: "正向定量",
    unit: "万元/m2",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "0.33",
    proofs: ["1.单位用地面积产值计算过程及其附件.pdf", "2.《工业产销总值及主要产品产量表》（B204-1）.pdf"],
    proofRequirement: "1、指标计算过程及其附件；2、报统计部门《工业产销总值及主要产品产量》（B204-1）。",
  },
  {
    id: "17",
    no: 17,
    l1: "用地集约化",
    l2: "土地产出率",
    l3: "建筑系数",
    type: "正向定量",
    unit: "%",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "30.00",
    proofs: ["1.建筑系数计算过程及其附件.pdf", "2.建设用地规划许可证.pdf"],
    proofRequirement: "1、指标计算过程及其附件；2、项目建设工程规划许可证及附图；3、厂区总平面图。",
  },
  {
    id: "18",
    no: 18,
    l1: "用地集约化",
    l2: "土地产出率",
    l3: "容积率",
    type: "正向定量",
    unit: "/",
    leadValue: "/",
    baseValue: "/",
    weight: "/",
    reportValue: "0.96",
    proofs: ["1.容积率计算过程及其附件.pdf", "2.建设用地规划许可证.pdf"],
    proofRequirement: "1、指标计算过程及其附件；2、项目建设工程规划许可证及附图；3、厂区总平面图。",
  },
];

export const EVALUATION_TOTAL_SCORE = 77.08;
