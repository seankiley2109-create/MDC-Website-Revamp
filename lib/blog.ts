export type BlogCategory =
  | "Cloud Backup"
  | "POPIA Compliance"
  | "Ransomware & Recovery"
  | "SaaS Protection"
  | "Data Governance"
  | "Quantum Security";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author: string;
  authorTitle: string;
  publishedAt: string; // ISO date "YYYY-MM-DD"
  readTime: string;
  tags: string[];
  featured?: boolean;
  status: "published" | "draft";
  content: string; // markdown
  serviceLink?: string;
  serviceLinkLabel?: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Cloud Backup",
  "POPIA Compliance",
  "Ransomware & Recovery",
  "SaaS Protection",
  "Data Governance",
  "Quantum Security",
];

export const CATEGORY_COLORS: Record<
  BlogCategory,
  { bg: string; border: string; text: string }
> = {
  "Cloud Backup": {
    bg: "bg-montana-teal/10",
    border: "border-montana-teal/20",
    text: "text-montana-teal",
  },
  "POPIA Compliance": {
    bg: "bg-montana-magenta/10",
    border: "border-montana-magenta/20",
    text: "text-montana-magenta",
  },
  "Ransomware & Recovery": {
    bg: "bg-montana-pink/10",
    border: "border-montana-pink/20",
    text: "text-montana-pink",
  },
  "SaaS Protection": {
    bg: "bg-montana-orange/10",
    border: "border-montana-orange/20",
    text: "text-montana-orange",
  },
  "Data Governance": {
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-white/70",
  },
  "Quantum Security": {
    bg: "bg-montana-coral/10",
    border: "border-montana-coral/20",
    text: "text-montana-coral",
  },
};

// ─── Article Registry ─────────────────────────────────────────────────────────
// Add new articles here. Only posts with status: "published" appear on the site.

const ALL_POSTS: BlogPost[] = [
  // ── ARTICLE 1 ──────────────────────────────────────────────────────────────
  {
    slug: "m365-backup",
    title: "What Microsoft 365 Doesn't Back Up — And What You Stand to Lose",
    excerpt:
      "Microsoft 365 is not a backup solution. Here's exactly what falls through the gaps — accidental deletion, ransomware, admin errors, and licence removal — and what South African organisations need to do about it.",
    category: "SaaS Protection",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-05-06",
    readTime: "9 min read",
    tags: ["Microsoft 365", "SaaS Backup", "Druva", "POPIA", "Cloud Backup"],
    featured: true,
    status: "published",
    serviceLink: "/contact?service=m365-licensing",
    serviceLinkLabel: "Get an M365 Backup Assessment",
    content: `
Microsoft 365 is the productivity backbone of most South African enterprises. Email in Exchange Online, documents in SharePoint, files in OneDrive, conversations in Teams — all of it lives in Microsoft's cloud. When IT directors tell us they haven't invested in a separate backup solution because "it's all in the cloud," we understand the reasoning. We also know how it ends.

Microsoft operates its cloud infrastructure with exceptional reliability. But reliability is not the same as protection. Your data can disappear from a Microsoft 365 tenant in ways that Microsoft's own infrastructure cannot recover from — and the fine print of your service agreement already tells you this.

## What Microsoft Actually Provides

Microsoft builds redundancy into its infrastructure to protect against hardware failure, data-centre outages, and service disruptions. If a storage node fails, your data survives on a replica. If an entire data centre goes offline, another region takes over. This protects **Microsoft** — it ensures the service remains available.

What it does not protect against is your own actions, or the actions of someone inside your organisation.

Microsoft does provide some built-in recovery features:

- **Recycle Bins** in SharePoint and OneDrive retain deleted items for 93 days before permanent deletion.
- **Deleted Items** and **Recoverable Items** folders in Exchange Online allow recovery within configurable retention windows.
- **Version history** in SharePoint and OneDrive keeps previous file versions for a limited period.
- **Microsoft 365 Backup** (a paid add-on) offers faster point-in-time restore for SharePoint, OneDrive, and Exchange — but does not cover all services and comes at additional cost per licence.

These are useful features. They are not a backup strategy.

## The Four Gaps Microsoft Cannot Close

### 1. Accidental Deletion Beyond the Retention Window

The 93-day recycle bin window in SharePoint sounds generous — until you consider that data loss is often discovered weeks or months after it occurs. A project folder deleted by a departing employee in January may not be missed until March. A misconfigured archiving rule that quietly purged records may go unnoticed until an audit request lands.

Once the retention window closes, the data is permanently deleted. Microsoft will confirm this in writing if you contact their support team.

This is not a theoretical risk. In our experience engaging with enterprise IT teams across South Africa, "we didn't know it was gone until we needed it" is the single most common precursor to an emergency data recovery conversation — and by that point, there is often nothing to recover.

### 2. Ransomware and Malicious Deletion

Modern ransomware attacks specifically target cloud-connected drives. OneDrive sync clients, SharePoint connectors, and Exchange integrations mean that encrypted or destroyed files can propagate to your Microsoft 365 tenant within minutes of a workstation infection.

Ransomware operators have also adapted to exploit Microsoft 365's own retention mechanisms. Techniques that cycle through file versions, exhaust version history limits, delete recovery items, and purge audit logs have been documented in active campaigns. If the attack is sophisticated enough, the version history you were counting on may no longer exist by the time you realise what has happened.

A compromised administrator account — accessed via phishing, credential stuffing, or a leaked token — can delete an entire SharePoint site collection, purge Exchange mailboxes, revoke licence assignments, and destroy Teams channel history within a single session. If the recycle bin is emptied before detection, there is no Microsoft-side recovery path.

### 3. Tenant Misconfigurations and Administrator Errors

Microsoft 365 tenants are complex environments. Retention policies, eDiscovery holds, compliance labels, sensitivity policies, and DLP rules interact in ways that even experienced administrators regularly misconfigure.

A common scenario: a retention policy applied to "All Mailboxes" is modified to exclude a distribution list. The intent is to remove the policy from shared mailboxes no longer in scope. The actual result is that the policy lifts from 40 active inboxes, which are purged during the next scheduled compliance clear. No malicious intent. No recovery path.

Administrator errors of this kind are among the most common causes of data loss in Microsoft 365 environments — and they fall entirely outside Microsoft's responsibility under the **Shared Responsibility Model**. That model states clearly: Microsoft is responsible for the infrastructure; the customer is responsible for the data.

### 4. Licence Removal and Account Deprovisioning

When a user's Microsoft 365 licence is removed, a deletion timer starts. Exchange Online mailboxes are typically retained for 30 days after licence removal before permanent deletion. OneDrive files are retained for the period configured in your admin centre (default: 30 days, maximum: 180 days).

This creates a serious problem in organisations with high employee turnover, frequent restructuring, or aggressive licence management. Data belonging to former employees — often the most audit-critical data in the event of litigation or a POPIA data subject request — is quietly deleted on a schedule that most IT teams are not actively monitoring.

In several engagements we've conducted, organisations discovered months after the fact that mailboxes for former senior staff had been silently deleted, taking with them years of client correspondence that would have been material in ongoing disputes.

## The POPIA Dimension

South Africa's Protection of Personal Information Act (POPIA) introduces a specific compliance obligation to this risk. The Act requires organisations to take "appropriate, reasonable technical and organisational measures" to prevent loss, damage, or unlawful destruction of personal information.

A Microsoft 365 tenant without a third-party backup cannot demonstrably meet this requirement:

**Data subject access requests** under POPIA Section 23 require the ability to locate and provide all personal information held on an identified data subject. If records have been deleted beyond Microsoft's retention window — whether through normal operations, an admin error, or an attack — compliance becomes impossible.

**Data breach notification** under POPIA Section 22 requires organisations to determine the scope of a breach thoroughly. Without backup logs showing what existed before a destructive event, accurately scoping the breach is not feasible.

**Regulated retention periods** in financial services (under FAIS and FSCA rules), legal practice, and healthcare (under HPCSA records guidelines) extend significantly beyond Microsoft's 93-day recycle bin window. Relying solely on Microsoft's built-in retention does not satisfy these obligations.

The Information Regulator has made clear that "it's in the cloud" is not a defence for inadequate data protection. Your organisation remains the responsible party for the personal information you process — regardless of where it is stored.

## What Purpose-Built Backup Actually Provides

A third-party SaaS backup solution — such as **Druva**, which Montana Data Company deploys and manages — addresses each of these gaps with capabilities that Microsoft's platform does not offer:

**Point-in-time recovery.** Snapshots of Exchange Online, SharePoint, OneDrive, and Teams taken daily or more frequently allow restoration to any point in time across the full backup history — not limited to Microsoft's 93-day window. Recovery from a ransomware event that occurred six months ago is possible in minutes.

**Ransomware-specific protection.** Backup copies reside in immutable cloud storage completely outside the blast radius of a compromised Microsoft 365 tenant. Anomaly detection identifies abnormal deletion or encryption patterns and can trigger automated alerts or preservation holds.

**Granular restore.** Restore a single email, an individual SharePoint folder, or an entire mailbox without a full-tenant restore. This is critical for litigation support, internal investigations, and POPIA data subject access requests.

**Offboarding and licence protection.** Backup coverage extends to data belonging to deprovisioned accounts, ensuring former employee records are retained for the full legally required period regardless of licence status or admin actions.

**Audit-ready documentation.** An independent, tamper-evident record of data state at each backup point is available for internal investigations, external audits, and legal proceedings.

## Five Questions to Test Your Exposure Right Now

Ask your IT team:

1. If a SharePoint site collection were accidentally deleted today, what is the maximum data we could lose?
2. If ransomware encrypted 10,000 OneDrive files three months ago and we only discovered it now, can we recover?
3. Are retention policies covering all mailboxes — including shared mailboxes, resource accounts, and distribution lists?
4. What is our OneDrive retention period after user deprovisioning, and is anyone monitoring that timer?
5. Can we produce a complete archive of any individual's email history for the past five years in response to a POPIA access request?

If any answer is "I'm not sure" or "no," your organisation has unacceptable exposure in the Microsoft 365 environment.

Montana Data Company offers a **complimentary M365 Backup Gap Assessment** that maps your current tenant configuration against POPIA retention requirements and delivers a practical remediation plan. Reach out to arrange a consultation.
    `.trim(),
  },

  // ── ARTICLE 2 (draft) ──────────────────────────────────────────────────────
  {
    slug: "popia-information-officer",
    title:
      "POPIA Information Officer: Duties, Liability, and How to Appoint One",
    excerpt:
      "Every organisation that processes personal information must appoint an Information Officer. Here's what the role requires, what the liability looks like, and the steps to formalise your appointment correctly.",
    category: "POPIA Compliance",
    author: "Montana Data Company",
    authorTitle: "Compliance Team",
    publishedAt: "2026-05-13",
    readTime: "10 min read",
    tags: ["POPIA", "Information Officer", "Compliance", "South Africa"],
    status: "draft",
    serviceLink: "/contact?service=popia",
    serviceLinkLabel: "Speak to Our POPIA Team",
    content: "",
  },

  // ── ARTICLE 3 (draft) ──────────────────────────────────────────────────────
  {
    slug: "rto-rpo-explained",
    title: "RTO vs RPO: A Plain-Language Guide for Executives",
    excerpt:
      "Recovery Time Objective and Recovery Point Objective are the two numbers that define your organisation's true tolerance for downtime. Most executives don't know theirs. Here's how to find out.",
    category: "Data Governance",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-05-20",
    readTime: "7 min read",
    tags: ["RTO", "RPO", "Disaster Recovery", "Business Continuity"],
    status: "draft",
    serviceLink: "/contact?service=ibm-backup",
    serviceLinkLabel: "Assess Your Recovery Posture",
    content: "",
  },

  // ── ARTICLE 4 (draft) ──────────────────────────────────────────────────────
  {
    slug: "ransomware-recovery-time",
    title: "How Long Does Ransomware Recovery Take?",
    excerpt:
      "The average ransomware recovery takes 22 days. Here's why, what the phases look like, and how the right architecture can compress that to hours instead of weeks.",
    category: "Ransomware & Recovery",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-05-27",
    readTime: "8 min read",
    tags: [
      "Ransomware",
      "Incident Response",
      "Recovery Time",
      "Immutable Backup",
    ],
    status: "draft",
    serviceLink: "/contact?service=ransomware",
    serviceLinkLabel: "Strengthen Your Ransomware Defences",
    content: "",
  },

  // ── ARTICLE 5 (draft) ──────────────────────────────────────────────────────
  {
    slug: "immutable-backup-explained",
    title: "Immutable Backup: What It Is and Why Your Current Backup Isn't Enough",
    excerpt:
      "Traditional backups can be deleted by ransomware. Immutable backups cannot. Here's the technical difference, and why the distinction matters when an attack is already in progress.",
    category: "Ransomware & Recovery",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-06-03",
    readTime: "8 min read",
    tags: ["Immutable Backup", "Ransomware", "3-2-1 Backup", "Cloud Backup"],
    status: "draft",
    serviceLink: "/contact?service=ibm-backup",
    serviceLinkLabel: "Upgrade to Immutable Protection",
    content: "",
  },

  // ── ARTICLE 6 (draft) ──────────────────────────────────────────────────────
  {
    slug: "popia-vs-gdpr",
    title: "POPIA vs GDPR: Key Differences Every Global Business Must Know",
    excerpt:
      "If your organisation handles data from both South African and EU residents, you're subject to two separate frameworks. Here's where POPIA and GDPR align — and where they diverge.",
    category: "POPIA Compliance",
    author: "Montana Data Company",
    authorTitle: "Compliance Team",
    publishedAt: "2026-06-10",
    readTime: "9 min read",
    tags: ["POPIA", "GDPR", "Compliance", "Data Protection", "South Africa"],
    status: "draft",
    serviceLink: "/contact?service=popia",
    serviceLinkLabel: "Get POPIA Compliance Support",
    content: "",
  },

  // ── ARTICLE 7 (draft) ──────────────────────────────────────────────────────
  {
    slug: "popia-data-breach-notification",
    title: "POPIA Data Breach Notification: A Step-by-Step Guide",
    excerpt:
      "POPIA Section 22 requires notification to the Information Regulator and affected data subjects within a reasonable time. Here's exactly what that process looks like and how to be ready before an incident occurs.",
    category: "POPIA Compliance",
    author: "Montana Data Company",
    authorTitle: "Compliance Team",
    publishedAt: "2026-06-17",
    readTime: "11 min read",
    tags: [
      "POPIA",
      "Data Breach",
      "Incident Response",
      "Information Regulator",
    ],
    status: "draft",
    serviceLink: "/assessments/popia",
    serviceLinkLabel: "Take the POPIA Assessment",
    content: "",
  },

  // ── ARTICLE 8 (draft) ──────────────────────────────────────────────────────
  {
    slug: "popia-compliance-financial-services",
    title:
      "POPIA Compliance for Financial Services: FSCA, FAIS, and the Data Protection Overlap",
    excerpt:
      "Financial services organisations face the tightest data compliance requirements in South Africa. Here's how POPIA intersects with your existing FSCA and FAIS obligations — and where the gaps are.",
    category: "POPIA Compliance",
    author: "Montana Data Company",
    authorTitle: "Compliance Team",
    publishedAt: "2026-06-24",
    readTime: "12 min read",
    tags: [
      "POPIA",
      "Financial Services",
      "FSCA",
      "FAIS",
      "Compliance",
      "South Africa",
    ],
    status: "draft",
    serviceLink: "/contact?service=popia",
    serviceLinkLabel: "Speak to Our Compliance Team",
    content: "",
  },

  // ── ARTICLE 9 (draft) ──────────────────────────────────────────────────────
  {
    slug: "ibm-guardium-explained",
    title: "What Is IBM Guardium and Which Organisations Actually Need It?",
    excerpt:
      "IBM Guardium provides real-time database activity monitoring, sensitive data discovery, and compliance reporting. Here's who needs it, what it does, and how it compares to native database auditing.",
    category: "Data Governance",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-07-01",
    readTime: "10 min read",
    tags: ["IBM Guardium", "Database Security", "Data Governance", "Compliance"],
    status: "draft",
    serviceLink: "/contact?service=guardium",
    serviceLinkLabel: "Enquire About IBM Guardium",
    content: "",
  },

  // ── ARTICLE 10 (draft) ─────────────────────────────────────────────────────
  {
    slug: "business-continuity-plan-south-africa",
    title:
      "How to Build a Business Continuity Plan for South African Organisations",
    excerpt:
      "A business continuity plan that sits in a drawer is not a plan. Here's a practical framework — from risk identification to test schedules — tailored to the South African regulatory and infrastructure context.",
    category: "Data Governance",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-07-08",
    readTime: "14 min read",
    tags: [
      "Business Continuity",
      "Disaster Recovery",
      "BCP",
      "Risk Management",
      "South Africa",
    ],
    status: "draft",
    serviceLink: "/contact?service=ibm-backup",
    serviceLinkLabel: "Build Your Resilience Architecture",
    content: "",
  },

  // ── ARTICLE 11 (draft) ─────────────────────────────────────────────────────
  {
    slug: "post-quantum-cryptography-guide",
    title:
      "Post-Quantum Cryptography: What Executives Need to Know Before 2030",
    excerpt:
      "Quantum computers will eventually break RSA and ECC encryption. The window to prepare is now, not when it happens. Here's a plain-language guide to the threat, the NIST standards, and the steps your organisation should take today.",
    category: "Quantum Security",
    author: "Montana Data Company",
    authorTitle: "Security Team",
    publishedAt: "2026-07-15",
    readTime: "11 min read",
    tags: [
      "Post-Quantum",
      "Cryptography",
      "NIST",
      "Encryption",
      "Cyber Resilience",
    ],
    status: "draft",
    serviceLink: "/contact?service=quantum",
    serviceLinkLabel: "Assess Your Quantum Readiness",
    content: "",
  },

  // ── ARTICLE 12 (draft) ─────────────────────────────────────────────────────
  {
    slug: "popia-readiness-checklist",
    title:
      "POPIA Readiness Checklist: 20 Questions Every CIO Should Be Able to Answer",
    excerpt:
      "POPIA compliance is not a once-off project — it's an ongoing operational posture. Use this checklist to identify gaps before the Information Regulator does.",
    category: "POPIA Compliance",
    author: "Montana Data Company",
    authorTitle: "Compliance Team",
    publishedAt: "2026-07-22",
    readTime: "10 min read",
    tags: ["POPIA", "Compliance Checklist", "CIO", "Data Governance"],
    status: "draft",
    serviceLink: "/assessments/popia",
    serviceLinkLabel: "Take the Free POPIA Assessment",
    content: "",
  },

  // ── ARTICLE 13 (draft) ─────────────────────────────────────────────────────
  {
    slug: "salesforce-backup-risks",
    title: "Salesforce Data Loss: 5 Scenarios Nobody Talks About",
    excerpt:
      "Salesforce doesn't guarantee data recovery. Here are five ways organisations lose CRM data permanently — and what a proper backup strategy looks like for the world's most critical sales platform.",
    category: "SaaS Protection",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-07-29",
    readTime: "8 min read",
    tags: ["Salesforce", "SaaS Backup", "CRM", "Data Loss", "Druva"],
    status: "draft",
    serviceLink: "/contact?service=m365-licensing",
    serviceLinkLabel: "Protect Your SaaS Data",
    content: "",
  },

  // ── ARTICLE 14 (draft) ─────────────────────────────────────────────────────
  {
    slug: "3-2-1-1-0-backup-rule",
    title: "The 3-2-1-1-0 Backup Rule: Why the Original Rule Isn't Enough Anymore",
    excerpt:
      "The classic 3-2-1 backup rule was written before ransomware could encrypt your backup target. Here's the updated 3-2-1-1-0 rule, what each digit means, and how to implement it in a modern enterprise.",
    category: "Cloud Backup",
    author: "Montana Data Company",
    authorTitle: "Data Protection Team",
    publishedAt: "2026-08-05",
    readTime: "7 min read",
    tags: ["3-2-1 Backup", "Immutable Backup", "Backup Strategy", "Ransomware"],
    status: "draft",
    serviceLink: "/contact?service=ibm-backup",
    serviceLinkLabel: "Design Your Backup Architecture",
    content: "",
  },

  // ── ARTICLE 15 (draft) ─────────────────────────────────────────────────────
  {
    slug: "byod-data-risk",
    title: "BYOD Data Risk: What Leaves with the Employee",
    excerpt:
      "When an employee leaves with their personal device, what organisational data leaves with them? Here's an honest assessment of BYOD data risk and how MaaS360 UEM changes the equation.",
    category: "Data Governance",
    author: "Montana Data Company",
    authorTitle: "Security Team",
    publishedAt: "2026-08-12",
    readTime: "8 min read",
    tags: ["BYOD", "MDM", "UEM", "MaaS360", "Data Loss Prevention"],
    status: "draft",
    serviceLink: "/contact?service=maas360",
    serviceLinkLabel: "Enquire About MaaS360",
    content: "",
  },
];

// ─── Query Helpers ─────────────────────────────────────────────────────────────

export function getAllPosts(): Omit<BlogPost, "content">[] {
  return ALL_POSTS.filter((p) => p.status === "published")
    .map(({ content: _content, ...meta }) => meta)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug && p.status === "published");
}

export function getRelatedPosts(
  slug: string,
  category: BlogCategory,
  limit = 3
): Omit<BlogPost, "content">[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return ALL_POSTS.filter((p) => p.status === "published").map((p) => p.slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
