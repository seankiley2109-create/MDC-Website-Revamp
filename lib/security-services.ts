export interface SecurityService {
  code: string;
  name: string;
  description: string;
  posUrl: string;
  highlights: string[];
  recommended?: boolean;
}

export const SECURITY_SERVICES: SecurityService[] = [
  {
    code: 'druva-saas-endpoint',
    name: 'Druva SaaS & Endpoint Backup',
    description: 'Automated M365, Google Workspace, and endpoint backup with instant, granular recovery.',
    posUrl: '/pos?tab=cloud&service=druva-m365',
    highlights: [
      'Automated M365, OneDrive & SharePoint backup',
      'Instant granular and full-system recovery',
      'Immutable cloud storage with 99.999% SLA',
    ],
    recommended: true,
  },
  {
    code: 'druva-ransomware',
    name: 'Ransomware Protection',
    description: 'Druva premium tier with immutable storage, AI anomaly detection, and air-gapped recovery.',
    posUrl: '/pos?tab=enterprise',
    highlights: [
      'AI-powered anomaly detection',
      'Immutable and air-gapped storage',
      'Accelerated recovery with RTO/RPO guarantees',
    ],
  },
  {
    code: 'maas360-mdm',
    name: 'MaaS360 MDM / UEM',
    description: 'Unified endpoint management, automated policy enforcement, and integrated threat defence.',
    posUrl: '/pos?tab=cloud&service=maas360',
    highlights: [
      'Full device fleet visibility',
      'Automated policy enforcement at scale',
      'Integrated zero-trust threat defence',
    ],
  },
  {
    code: 'ibm-enterprise-backup',
    name: 'IBM Enterprise Backup',
    description: 'Bespoke architecture for complex, high-volume data protection environments.',
    posUrl: '/pos?tab=enterprise',
    highlights: [
      'Petabyte-scale data protection',
      'Multi-site geo-redundant replication',
      'Dedicated solution architect',
    ],
  },
];

export function getSecurityService(code: string): SecurityService | undefined {
  return SECURITY_SERVICES.find(s => s.code === code);
}
