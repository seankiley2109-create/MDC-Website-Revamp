export interface SecurityService {
  code: string;
  name: string;
  description: string;
  posUrl: string;
  highlights: string[];
  /** Gap categories from the security assessment this service directly addresses */
  gapCategories: string[];
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
    gapCategories: ['Data Protection', 'SaaS Resilience', 'Recovery'],
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
    gapCategories: ['Ransomware', 'Recovery', 'Threat Detection'],
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
    gapCategories: ['Endpoint Security', 'Device Compliance', 'Threat Detection', 'Integration'],
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
    gapCategories: ['Data Protection', 'Business Continuity', 'Data Visibility', 'Integration'],
  },
];

export function getSecurityService(code: string): SecurityService | undefined {
  return SECURITY_SERVICES.find(s => s.code === code);
}

/** Rank services by how many of the user's gap categories they address. */
export function rankSecurityServicesByGaps(gaps: string[]): SecurityService[] {
  const gapSet = new Set(gaps);
  return [...SECURITY_SERVICES]
    .map(svc => ({
      svc,
      score: svc.gapCategories.filter(c => gapSet.has(c)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ svc }) => svc);
}
