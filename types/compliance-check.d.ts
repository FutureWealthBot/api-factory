export type ComplianceStatus = 'pass' | 'fail' | 'warn';

export type ComplianceCheck = {
  law: string;
  status: ComplianceStatus;
  note?: string;
};

export type ComplianceReportArtifact = 'openapi' | 'policy' | 'release';

export type ComplianceReport = {
  artifact: ComplianceReportArtifact;
  app_id: string;
  checks: ComplianceCheck[];
  overall: 'pass' | 'block';
  timestamp: string; // ISO date-time
};

export default ComplianceReport;
