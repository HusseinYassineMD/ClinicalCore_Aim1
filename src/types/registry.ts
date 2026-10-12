export interface RegistryDatasetSummary {
  uniqueParticipants?: number;
  uniqueUdsIds?: number;
  totalRecords?: number;
  byDiagnosis?: Record<string, number>;
  bySex?: Record<string, number>;
  byInBrs?: Record<string, number>;
  topDataTypes?: Record<string, number>;
  hasBiomarkerFlags?: Record<string, number>;
  byStatus?: Record<string, number>;
  autopsiesPerformed?: number;
  withConsentDate?: number;
  deceased?: number;
  withAutopsyFlag?: number;
  withConsent?: number;
  byVisit?: Record<string, number>;
  topForms?: Record<string, number>;
  visitYears?: Record<string, number>;
  byStatusRedcap?: Record<string, number>;
}

export interface RegistryDatasetMeta {
  id: string;
  category: "ATN" | "BRS" | "UDS" | "Package" | "REDCap";
  label: string;
  description: string;
  sourceFile: string;
  rowCount: number;
  columnCount: number;
  fileSizeMb: number;
  fileModified: string;
  summary: RegistryDatasetSummary;
}

export interface RegistryManifest {
  lastUpdated: string;
  categories: string[];
  complete?: boolean;
  inventoryNote?: string;
  fileInventory?: string[];
  totals?: {
    datasets: number;
    rows: number;
    maxColumns: number;
  };
  datasets: RegistryDatasetMeta[];
}
