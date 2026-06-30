export const dataexportZh: Record<string, string> = {
  panelTitle: "下载数据",
  panelDesc:
    "将底层数据集导出为 CSV 或 JSON，以便离线分析。在客户端生成，无需服务器请求。",
  datasetOccupations: "职业数据",
  datasetOccupationsDesc:
    "所有职业的自动化风险、概率、薪资、就业规模与就业前景。CSV 为扁平格式（技能及历史数组不含在内）。",
  datasetCountries: "国家/地区数据",
  datasetCountriesDesc:
    "各国 AI 使用指数、扩散率、准备就绪得分及政府 AI 准备指数。CSV 为扁平格式（嵌套子指标不含在内）。",
  datasetSources: "数据来源",
  datasetSourcesDesc:
    "完整引用列表，包含发布方、年份、许可证及链接。JSON 包含顶层元数据。",
  btnCsv: "CSV",
  btnJson: "JSON",
  btnDownloading: "下载中…",
  ariaDownload: "以 {format} 格式下载 {dataset}",
  srAnnounce: "{dataset} {format} 下载已开始",
  footerNote:
    "JSON 保留所有字段，包括嵌套数组与对象。CSV 为扁平结构，嵌套内容不包含在内。",
};
