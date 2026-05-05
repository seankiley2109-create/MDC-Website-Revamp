import * as React from 'react';
import { Link, Section, Text } from 'react-email';
import {
  C,
  CTAButton,
  DataTable,
  Divider,
  EmailShell,
  FieldRow,
  SectionHeading,
  formatZADate,
} from './_shell';

export interface ResourceDownloadEmailProps {
  name:          string;
  email:         string;
  resourceTitle: string;
  resourceFile:  string;
}

export const PreviewProps: ResourceDownloadEmailProps = {
  name:          'Jane Smith',
  email:         'jane@acme.co.za',
  resourceTitle: 'Immutable Backups Guide',
  resourceFile:  '/resources/immutable-backups.pdf',
};

const APP_URL = 'https://montanadc.com';

// ===========================================================================
// ResourceDownloadStaffEmail — internal notification sent to sales
// ===========================================================================

export function ResourceDownloadStaffEmail(p: ResourceDownloadEmailProps) {
  const fileUrl = `${APP_URL}${p.resourceFile}`;
  return (
    <EmailShell title={`[Resource Download] ${p.resourceTitle}`} preview={`${p.name} downloaded ${p.resourceTitle}`}>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        A visitor has downloaded a resource from the website.
      </Text>

      <SectionHeading>Lead Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.email}`} style={{ color: C.accent }}>{p.email}</Link>
        </FieldRow>
        <FieldRow label="Resource">{p.resourceTitle}</FieldRow>
        <FieldRow label="File">
          <Link href={fileUrl} style={{ color: C.accent }}>{p.resourceFile}</Link>
        </FieldRow>
        <FieldRow label="Time">{formatZADate()}</FieldRow>
      </DataTable>

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.email}?subject=${encodeURIComponent(`Following up on your ${p.resourceTitle} download`)}`}>
          Follow Up with {p.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// ResourceDownloadAutoEmail — download link sent to the requester
// ===========================================================================

export default function ResourceDownloadAutoEmail(p: ResourceDownloadEmailProps) {
  const downloadUrl = `${APP_URL}${p.resourceFile}`;
  return (
    <EmailShell title={`Your download: ${p.resourceTitle}`} preview={`Your download is ready — ${p.resourceTitle}`}>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Your download is ready. Click the button below to access <strong>{p.resourceTitle}</strong> at any time.
      </Text>

      <Divider />
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <CTAButton href={downloadUrl}>Download {p.resourceTitle}</CTAButton>
      </Section>
      <Divider />

      <Text style={{ margin: '24px 0 0', fontSize: '14px', color: C.subtle }}>
        If you have questions about this topic or would like to speak with an advisor, reply to this email or call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>.
      </Text>
    </EmailShell>
  );
}
