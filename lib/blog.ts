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
    status: "published",
    serviceLink: "/contact?service=popia",
    serviceLinkLabel: "Speak to Our POPIA Team",
    content: `
Every organisation that processes personal information in South Africa is legally required to appoint an Information Officer under the Protection of Personal Information Act (POPIA). Yet in a significant number of organisations — including large enterprises — that appointment either hasn't happened, has been made informally without proper registration, or has been assigned to someone who doesn't understand what the role actually requires.

This is not a paperwork oversight. The Information Officer carries personal liability under POPIA. Getting this wrong has consequences for both the individual and the organisation.

## What POPIA Requires

Section 55(1) of POPIA states that the head of a private body is the Information Officer by default. For a company, that is the CEO or Managing Director. For a close corporation, it is the managing member. For a partnership, it is the managing partner.

In practice, most organisations delegate the role to a senior employee — a Chief Information Officer, Chief Compliance Officer, Legal Counsel, or Head of IT — but the default remains the head of the organisation until a formal delegation is registered with the Information Regulator.

The key word is *registered*. Informal delegation or internal appointment letters are not sufficient. The Information Regulator must be notified.

## The Eight Core Duties

POPIA Section 55(2) sets out the Information Officer's responsibilities. They are not administrative — they require active governance:

**1. Encourage compliance.** The Information Officer must actively drive the organisation's compliance with POPIA across all departments that process personal information. This is an ongoing operational responsibility, not a once-off project.

**2. Deal with requests made to the body.** All data subject access requests, requests for correction, and requests for deletion must be managed through the Information Officer's office within the POPIA-prescribed timeframes.

**3. Work with the Information Regulator.** If the Regulator initiates an investigation or requests information, the Information Officer is the organisation's primary point of contact and must cooperate.

**4. Develop, implement, monitor and maintain a POPIA compliance framework.** This includes internal policies, processing records, consent management mechanisms, and data retention schedules.

**5. Ensure data subject rights are protected.** The Information Officer must ensure that marketing opt-outs are respected, that data minimisation is practised, and that individuals can exercise their rights under Sections 23–25.

**6. Conduct impact assessments.** Before implementing new processing activities that present high privacy risks — new marketing systems, third-party data sharing arrangements, employee monitoring tools — the Information Officer should conduct or oversee a Privacy Impact Assessment.

**7. Manage data breach response.** In the event of a breach, the Information Officer is responsible for the Section 22 notification obligations: notifying the Information Regulator and affected data subjects as soon as reasonably possible.

**8. Maintain the PAIA Manual.** Section 51 of the Promotion of Access to Information Act requires private bodies to compile and maintain an information manual. The Information Officer is responsible for this document.

## Deputy Information Officers

Where an organisation processes large volumes of personal information, or operates across multiple business units or geographies, Section 55(3) allows the appointment of Deputy Information Officers. Deputies operate under the authority of the Information Officer and can be delegated specific duties — for example, one Deputy handling data subject requests while another manages vendor data processing agreements.

Deputies must also be registered with the Information Regulator.

For groups of companies, each legal entity that processes personal information should have its own registered Information Officer. The holding company's officer cannot cover subsidiaries.

## Personal Liability

This is the point most organisations underestimate. Under POPIA Section 107 and the associated Criminal Offences provisions, an Information Officer who wilfully or negligently obstructs the Information Regulator, fails to comply with an enforcement notice, or makes a false statement in proceedings can face criminal prosecution — not just organisational fines.

Administrative fines under POPIA can reach R10 million. These are levied against the organisation, not the individual. But criminal liability under Section 107 can result in imprisonment of up to 10 years.

The distinction matters: if the organisation has failed to comply with POPIA and an enforcement action follows, the Information Regulator will want to engage the registered Information Officer directly. An officer who cannot demonstrate that they actively discharged their duties — who treated the role as a title rather than a function — is in a difficult position.

## How to Register Correctly

### Step 1: Internal appointment

The head of the organisation (or board, for a company) formally appoints an employee as Information Officer by written resolution or board resolution. The appointment letter should specify:
- The individual's name and title
- The scope of the delegation
- The effective date
- Any Deputy Information Officers being appointed

### Step 2: Registration with the Information Regulator

Registration is completed via the Information Regulator's online portal at **inforegulator.org.za**. The process requires:
- The organisation's registration details (company number, registered address)
- The Information Officer's full name, contact details, and role
- Deputy Information Officer details (if applicable)

There is currently no registration fee for private bodies.

### Step 3: Internal notification

The Information Officer's details should be published in the organisation's PAIA Manual (Section 51 Manual) and made available to data subjects on request. Many organisations also publish this on their privacy notice page.

### Step 4: Equip the role

Registration is the beginning, not the end. The Information Officer should:
- Conduct a personal information audit to understand what data the organisation holds and why
- Review and update the organisation's privacy notice and consent mechanisms
- Establish a process for handling data subject requests within the 30-day POPIA deadline
- Ensure staff training on POPIA obligations is delivered and documented
- Build a data breach response plan before it is needed

## What Happens Without a Registered Officer

Operating without a registered Information Officer does not exempt an organisation from POPIA obligations — it simply means there is no individual accountable for ensuring they are met. When the Regulator receives a complaint from a data subject, or initiates an investigation, the absence of a registered officer is itself a compliance failure and typically escalates scrutiny rather than reducing it.

For organisations that handle the personal information of employees, customers, or third parties — which includes virtually every business in South Africa — POPIA registration is not optional.

Montana Data Company's POPIA Consulting service assists organisations with the full appointment and compliance framework process, from internal governance through to Information Regulator registration and ongoing compliance monitoring.
    `.trim(),
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
    status: "published",
    serviceLink: "/contact?service=ibm-backup",
    serviceLinkLabel: "Assess Your Recovery Posture",
    content: `
When a system fails or an attack hits, two numbers determine whether your organisation survives the event intact or spends weeks rebuilding from the damage. Those numbers are the Recovery Time Objective (RTO) and the Recovery Point Objective (RPO). Most executives have heard the terms. Very few know their actual figures — and even fewer know whether their backup infrastructure can actually meet them.

## Defining the Terms

**RTO — Recovery Time Objective** is the maximum acceptable length of time that a system, application, or business process can be offline after a failure. It answers the question: *how long can we afford to be down?*

If your finance system goes offline on a Monday morning and your RTO is four hours, you've committed to having it operational again by midday. If recovery takes eight hours, you've breached your RTO — and whatever downstream consequences that brings (lost revenue, regulatory breach, SLA penalties, reputational damage) are now in play.

**RPO — Recovery Point Objective** is the maximum acceptable amount of data loss measured in time. It answers the question: *how far back can we afford to roll back?*

If your RPO is two hours and an attack hits at 14:00, your last clean backup must be from no earlier than 12:00. Any transactions, records, or changes made between the backup point and the incident are lost. If that window contains two hours of payment processing, customer registrations, or stock movements, the business impact is real and quantifiable.

## Why These Two Numbers Are Different

RTO and RPO are often confused or conflated. The distinction matters:

- RTO is about **time to recovery** — how fast can you restore operations?
- RPO is about **data integrity at the point of recovery** — how much do you lose when you get back?

A system with an RTO of one hour and an RPO of 24 hours can recover quickly — but will do so with yesterday's data. A system with an RPO of 15 minutes and an RTO of 72 hours has very recent data available but takes three days to restore. Neither scenario is necessarily right; the correct balance depends entirely on what the system does and what the business can tolerate.

## How to Determine Your Numbers

Neither RTO nor RPO should be guessed. They should be derived from business impact analysis — a structured assessment of what each system does, what happens when it fails, and at what point the failure becomes critical.

For each key system or process, work through these questions:

**For RTO:**
- What revenue or operational activity stops if this system is unavailable?
- At what point does a short outage become a business-critical event? (1 hour? 4 hours? 24 hours?)
- Are there manual workarounds, and how long can they realistically sustain operations?
- Do any regulatory or contractual SLAs impose a hard deadline?

**For RPO:**
- How frequently does meaningful data change in this system? (Every minute? Every hour? Daily?)
- What is the cost of reconstructing data from external sources if needed?
- Are there audit, legal, or regulatory requirements that define minimum data retention points?
- Would customers or partners be affected by a data rollback to the last backup point?

The answers will differ substantially between systems. A real-time payment processing database may have an RPO of near-zero. An internal HR document management system may tolerate a 24-hour RPO without meaningful impact.

## Industry Benchmarks

General benchmarks by system criticality:

| System Type | Typical RTO | Typical RPO |
|---|---|---|
| Core banking / payment systems | < 1 hour | Near-zero (synchronous replication) |
| ERP / accounting | 2–4 hours | 1–4 hours |
| Email and collaboration | 4–8 hours | 4–24 hours |
| CRM | 4–8 hours | 4–24 hours |
| Internal file shares | 8–24 hours | 24 hours |
| Archive / compliance systems | 24–72 hours | 24–48 hours |

These are starting points for conversation, not universal standards. Regulated industries — financial services under the FSCA, healthcare under the HPCSA, or critical infrastructure operators — will have specific requirements that may set a lower ceiling than these benchmarks.

## How RTO and RPO Drive Backup Architecture

Once you know your numbers, they become requirements that your backup architecture must satisfy. Not the other way around.

**RPO drives backup frequency.** An RPO of one hour means you need backups taken at least every hour. An RPO of 15 minutes may require continuous data protection or near-synchronous replication rather than scheduled snapshots.

**RTO drives recovery speed and infrastructure.** A four-hour RTO sounds comfortable until you're trying to restore 10TB of data over a network connection. The recovery speed of your backup solution — measured in actual throughput, not theoretical maximums — must be validated against your RTO under realistic conditions.

**Both numbers drive where data lives.** Tape-based backup has low cost but typically cannot meet an RTO under 24 hours. Cloud backup with local caching can meet aggressive RTOs. Synchronous replication to a standby environment can meet near-zero RTOs but at significantly higher cost.

## The Mistake Most Organisations Make

They set RTO and RPO targets in a business continuity document, then never test whether the backup infrastructure actually meets them.

A backup that runs nightly and stores data offsite may look like it satisfies a 24-hour RPO. But if restoring from that backup takes 36 hours, the RTO is broken. If the backup job silently failed three months ago and nobody noticed, both numbers are fiction.

Recovery capability should be tested on a schedule — at minimum annually, ideally quarterly for critical systems. A test restore that completes successfully under controlled conditions is the only evidence that your RTO and RPO commitments are real rather than aspirational.

## What to Do with This Information

If you don't currently have documented RTO and RPO targets for your key systems, the first step is a Business Impact Analysis. This does not need to be a lengthy exercise — for most organisations, a structured conversation with the heads of each business unit will surface the critical systems and their tolerance thresholds within a few days.

Once targets are set, evaluate your current backup infrastructure against them honestly. The questions to ask:
- What is our actual backup frequency for each system? (Check the logs, not the policy document.)
- What is our demonstrated restore speed for each system? (Run a test restore — not a theoretical calculation.)
- If our primary site were unavailable, where would we restore from, and how long would it take?
- Who is responsible for monitoring backup job completion and alerting on failures?

Montana Data Company conducts Recovery Architecture Reviews that map documented RTO/RPO targets against actual backup configuration and tested restore performance, identifying gaps and recommending specific remediation steps.
    `.trim(),
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
    status: "published",
    serviceLink: "/contact?service=ransomware",
    serviceLinkLabel: "Strengthen Your Ransomware Defences",
    content: `
The average ransomware recovery takes 22 days. That figure comes from Sophos's annual State of Ransomware report, and it is consistent across multiple years and geographies. Three weeks of degraded operations, emergency contractor costs, lost revenue, and reputational damage — before the organisation is fully back to normal.

Most IT teams, when asked, estimate they could recover in a few days. The gap between estimate and reality is where ransomware operators make their money.

## Why Recovery Takes So Long

Understanding the timeline requires understanding what recovery actually involves. It is rarely a single restore operation. It is a multi-phase process where each phase has dependencies on the one before it, and many phases cannot proceed in parallel.

### Phase 1: Containment (Hours 0–48)

Before any recovery can begin, the attack must be stopped. This means:

- **Identifying the scope of compromise.** Which systems are encrypted? Which endpoints are infected? Is the attacker still present in the environment, or was this a detonation-and-leave attack? Answering these questions requires forensic analysis that most internal IT teams cannot conduct at speed.
- **Isolating affected systems.** Encrypted systems must be taken offline to prevent further spread. In organisations with flat network architectures or poorly segmented environments, this can mean taking large portions of the network offline.
- **Identifying the ransomware variant.** Different variants require different responses. Some have known decryptors available through tools like NoMoreRansom.org. Most modern variants do not.

This phase routinely takes 24–72 hours even with experienced incident responders engaged. Organisations without a pre-arranged incident response retainer typically add 24–48 hours before any qualified help is on site.

### Phase 2: Assessment (Days 2–5)

Once the active threat is contained, the organisation needs to understand what it's working with:

- **Backup integrity verification.** Are the backups clean? Many ransomware strains dwell in environments for weeks before detonating — long enough to have encrypted or corrupted recent backup sets. Verifying that the most recent clean backup is actually clean, and identifying the furthest-back clean restore point, takes time.
- **Scope of data loss.** What was encrypted? What data is confirmed unrecoverable without the decryption key? What is the business impact of the data loss?
- **Decision: restore vs. pay vs. partial recovery.** The organisation must decide whether to restore from backup, whether paying the ransom is viable (most cybersecurity authorities and insurers strongly advise against it), or whether a hybrid approach combining partial decryption with backup restoration is possible.

This phase often takes three to five days. The backup integrity verification step is routinely underestimated.

### Phase 3: Environment Rebuild (Days 5–15)

This is where most of the calendar time is consumed. The sequence:

1. Rebuild or reimage compromised endpoints and servers — not just restore data, but rebuild operating systems to ensure no malware persists
2. Restore data from verified clean backups
3. Restore applications and verify they function correctly against the restored data
4. Restore dependencies and integrations between systems (this step is consistently underestimated)
5. Test that business processes work end-to-end

The rebuild step is the killer. A 500-person organisation might have 500 endpoints that need reimaging. Even at 30 minutes per endpoint with automated tooling, that is 250 hours of work. Without automation — which most organisations don't have ready — it is far longer.

Data restoration speed depends on backup architecture. Restoring from cloud backup over a typical enterprise internet connection — not a dedicated recovery link — can mean transferring terabytes at speeds that make the recovery window measured in days rather than hours.

### Phase 4: Validation and Return to Operations (Days 15–22)

Restored systems must be validated before business operations resume:
- Application functionality testing
- Data integrity checks
- User acceptance testing for critical business processes
- Security hardening and patching to close the initial attack vector
- Monitoring deployment to detect any persistence that survived the rebuild

Many organisations underinvest in this phase and return to operations before it is complete, only to discover corrupted data or missed attack vectors days later.

## What Compresses the Timeline

The difference between a 22-day recovery and a 4-hour recovery is not luck. It is architecture.

**Immutable backups eliminate the backup integrity problem.** When backups are stored in immutable cloud storage — meaning they cannot be modified, encrypted, or deleted by anything, including a compromised admin account — the backup integrity verification phase is fast. You know the backups are clean because the attacker could not touch them. This removes one of the most time-consuming uncertainties from the early recovery phase.

**Pre-staged recovery environments reduce rebuild time.** Organisations that maintain documented, tested runbooks for restoring each critical system — and that have pre-configured recovery infrastructure rather than building it during an incident — can execute recovery in parallel rather than sequentially.

**Network segmentation limits scope.** An attack contained to one network segment means fewer systems to rebuild. Micro-segmentation, zero-trust network architecture, and properly maintained firewall rules all reduce the blast radius and therefore the rebuild scope.

**Tested restore speeds set realistic expectations.** If you know from quarterly restore tests that your critical ERP can be restored in two hours from the last backup point, you can commit to that timeline under pressure. If you've never tested it, you're guessing during the worst possible moment.

**Incident response retainer means no delay in Phase 1.** The 24–48 hour delay in getting qualified incident response help on site — which affects organisations without a pre-arranged retainer — has an outsized impact on the overall timeline because everything else depends on containment being complete.

## The 4-Hour Recovery Scenario

A 4-hour recovery from a ransomware event is achievable. The prerequisites:

1. **Immutable, air-gapped backup** with the last backup point within the RPO window
2. **Pre-built recovery environment** (cloud-based standby infrastructure) that can accept a restore without needing to be provisioned from scratch
3. **Documented, tested runbook** that has been executed successfully in a drill within the last six months
4. **Incident response retainer** with a provider who can be engaged immediately
5. **Network segmentation** that limits the attack to a defined blast radius

None of these prerequisites are exotic. All of them require deliberate investment before an incident occurs.

## The Question to Ask Your Team Today

Ask your IT team: *if ransomware detonated at 9am tomorrow, when would we be operational again?*

Then ask them to justify that estimate with evidence — the last tested restore time, the last backup integrity verification, the documented runbook, the incident response arrangement.

If the answer to any of those follow-up questions is "we haven't done that," the 22-day average is probably optimistic for your organisation.

Montana Data Company builds ransomware-resilient backup architectures using IBM and Druva platforms, including immutable cloud storage, anomaly detection, and tested recovery runbooks. We also conduct Recovery Readiness Reviews that simulate the first 48 hours of a ransomware incident and identify gaps before they matter.
    `.trim(),
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
