export const dataexportEn: Record<string, string> = {
  panelTitle: "Download Data",
  panelDesc:
    "Export the underlying datasets as CSV or JSON for offline analysis. Generated client-side — no server request.",
  datasetOccupations: "Occupations",
  datasetOccupationsDesc:
    "Automation risk, probability, salary, employment, and outlook for all occupations. CSV is flat (skills and history arrays excluded).",
  datasetCountries: "Countries",
  datasetCountriesDesc:
    "AI usage index, diffusion rates, readiness scores, and government AI readiness by country. CSV is flat (nested sub-indices excluded).",
  datasetSources: "Data Sources",
  datasetSourcesDesc:
    "Full citation list with publishers, years, licenses, and URLs. JSON includes top-level metadata.",
  btnCsv: "CSV",
  btnJson: "JSON",
  btnDownloading: "Downloading…",
  ariaDownload: "Download {dataset} as {format}",
  srAnnounce: "{dataset} {format} download started",
  footerNote:
    "JSON preserves all fields including nested arrays and objects. CSV is flat — nested structures are excluded.",
};
