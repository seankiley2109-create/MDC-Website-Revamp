# Montana Data Company — Blog Roadmap

This document is the single source of truth for the blog content programme. Update it as articles are written and published.

---

## Infrastructure Status

| Component | Status | Notes |
|---|---|---|
| `/blog` listing page | ✅ Done | Server component, category filter, featured post, CTA banner |
| `/blog/[slug]` article page | ✅ Done | Article schema, breadcrumbs, sidebar CTAs, related articles |
| `lib/blog.ts` registry | ✅ Done | All 15 articles registered; article 1 published, 2–15 drafts |
| `CategoryFilter` client component | ✅ Done | URL-param based filtering, category counts |
| `ArticleContent` renderer | ✅ Done | react-markdown with Tailwind typography prose styles |
| Blog added to navbar | ✅ Done | Inserted between Resources and Assessments |

---

## Article Queue

### Legend
- ✅ **Published** — Live on site. Content in `lib/blog.ts`.
- 🔧 **In Progress** — Being written now.
- 📋 **Planned** — Metadata registered; content field empty in `lib/blog.ts`.

---

### Month 1 — Foundation (Quick Wins)

| # | Slug | Title | Category | Target Keyword | Est. Words | Status |
|---|------|-------|----------|----------------|-----------|--------|
| 1 | `m365-backup` | What Microsoft 365 Doesn't Back Up | SaaS Protection | microsoft 365 backup south africa | ~1,400 | ✅ Published |
| 2 | `popia-information-officer` | POPIA Information Officer: Duties, Liability & Appointment | POPIA Compliance | popia information officer | ~1,800 | ✅ Published |
| 3 | `rto-rpo-explained` | RTO vs RPO: A Plain-Language Guide for Executives | Data Governance | rto rpo explained | ~1,500 | ✅ Published |
| 4 | `ransomware-recovery-time` | How Long Does Ransomware Recovery Take? | Ransomware & Recovery | ransomware recovery time | ~1,700 | ✅ Published |

---

### Month 2 — Authority Building

| # | Slug | Title | Category | Target Keyword | Est. Words | Status |
|---|------|-------|----------|----------------|-----------|--------|
| 5 | `immutable-backup-explained` | Immutable Backup: What It Is and Why Your Current Backup Isn't Enough | Ransomware & Recovery | immutable backup | ~1,400 | 📋 Planned |
| 6 | `popia-vs-gdpr` | POPIA vs GDPR: Key Differences | POPIA Compliance | popia vs gdpr | ~1,800 | 📋 Planned |
| 7 | `popia-data-breach-notification` | POPIA Data Breach Notification: Step-by-Step | POPIA Compliance | popia data breach notification | ~2,000 | 📋 Planned |
| 8 | `popia-compliance-financial-services` | POPIA for Financial Services: FSCA, FAIS & Data Protection | POPIA Compliance | popia financial services | ~2,200 | 📋 Planned |

---

### Month 3 — Expansion

| # | Slug | Title | Category | Target Keyword | Est. Words | Status |
|---|------|-------|----------|----------------|-----------|--------|
| 9 | `ibm-guardium-explained` | What Is IBM Guardium and Which Organisations Need It? | Data Governance | ibm guardium | ~1,800 | 📋 Planned |
| 10 | `business-continuity-plan-south-africa` | How to Build a Business Continuity Plan for SA Organisations | Data Governance | business continuity plan south africa | ~2,500 | 📋 Planned |
| 11 | `post-quantum-cryptography-guide` | Post-Quantum Cryptography: What Executives Need to Know Before 2030 | Quantum Security | post quantum cryptography | ~2,000 | 📋 Planned |
| 12 | `popia-readiness-checklist` | POPIA Readiness Checklist: 20 Questions Every CIO Should Answer | POPIA Compliance | popia compliance checklist | ~1,600 | 📋 Planned |

---

### Month 4+ — Pipeline

| # | Slug | Title | Category | Target Keyword | Est. Words | Status |
|---|------|-------|----------|----------------|-----------|--------|
| 13 | `salesforce-backup-risks` | Salesforce Data Loss: 5 Scenarios Nobody Talks About | SaaS Protection | salesforce backup | ~1,400 | 📋 Planned |
| 14 | `3-2-1-1-0-backup-rule` | The 3-2-1-1-0 Backup Rule Explained | Cloud Backup | 3-2-1 backup rule | ~1,000 | 📋 Planned |
| 15 | `byod-data-risk` | BYOD Data Risk: What Leaves with the Employee | Data Governance | byod data security | ~1,200 | 📋 Planned |
| 16 | `what-is-ransomware` | What Is Ransomware? A Plain-English Guide for Business | Ransomware & Recovery | what is ransomware | ~1,400 | ✅ Published |
| 17 | `what-is-popia` | What Is POPIA and Does It Apply to My Business? | POPIA Compliance | what is popia | ~1,600 | ✅ Published |
| 18 | `how-ransomware-spreads` | How Does Ransomware Spread? 6 Common Entry Points | Ransomware & Recovery | how does ransomware spread | ~1,400 | ✅ Published |
| 19 | `popia-penalties` | POPIA Fines: What Are the Real Penalties? | POPIA Compliance | popia penalties south africa | ~1,500 | ✅ Published |
| 20 | `backup-strategy-failing` | 5 Signs Your Business Backup Strategy Is Failing | Cloud Backup | backup strategy south africa | ~1,300 | ✅ Published |
| 21 | `ransomware-cost-south-africa` | How Much Does a Ransomware Attack Cost SA Businesses? | Ransomware & Recovery | ransomware cost south africa | ~1,400 | ✅ Published |
| 22 | `popia-compliance-guide` | POPIA Compliance: The Complete Guide for South African SMEs | POPIA Compliance | popia compliance south africa | ~2,400 | ✅ Published |
| 23 | `cloud-backup-south-africa` | Cloud Backup for South African Businesses: A Complete Guide | Cloud Backup | cloud backup south africa | ~2,200 | ✅ Published |

---

## How to Write and Publish a New Article

### Step 1 — Write the article content

Open `lib/blog.ts`. Find the article's entry in `ALL_POSTS` (search by `slug`). Fill in the `content` field with the article body in **Markdown**.

```typescript
{
  slug: "popia-information-officer",
  // ... existing metadata ...
  status: "draft",       // ← change to "published" when ready
  content: `
## Introduction

Your article content in markdown...

## Section 2

More content...
  `.trim(),
}
```

**Markdown supported:**
- `## H2`, `### H3` headings
- `**bold**`, `*italic*`
- `- bullet lists`, `1. numbered lists`
- `> blockquotes`
- `` `inline code` ``
- `---` horizontal rules
- Paragraphs separated by blank lines

### Step 2 — Set status to "published"

Change `status: "draft"` to `status: "published"`. The article will appear on `/blog` at the next build/deploy.

### Step 3 — Verify the article

- Run `npm run dev` and navigate to `/blog/[slug]`
- Check the article renders correctly with prose styles
- Verify the sidebar CTA link is correct (`serviceLink` field)
- Confirm related articles appear in the sidebar (same category)

### Step 4 — Internal links

Before publishing, add a link from the relevant service page to the new article. See the Internal Linking Plan below.

---

## SEO Checklist (per article)

Before each article goes to `"published"`:

- [ ] `title` is under 60 characters and includes the primary keyword
- [ ] `excerpt` is 140–160 characters and includes the keyword naturally
- [ ] `tags` includes the primary keyword and 3–5 secondary keywords
- [ ] Content opens with a strong hook in the first 100 words
- [ ] At least one H2 includes the primary keyword or a close variant
- [ ] `serviceLink` points to the most relevant CTA destination
- [ ] Article is at least 1,000 words
- [ ] No placeholder copy ("coming soon", "TBC", "lorem ipsum")

---

## Internal Linking Plan

Every article should link out to at least one service page CTA using the `serviceLink` field, and at least one assessment or resource page inline in the content.

| Article Category | `serviceLink` Pattern | Also link to |
|---|---|---|
| SaaS Protection | `/contact?service=m365-licensing` | `/services`, `/resources` |
| POPIA Compliance | `/contact?service=popia` or `/assessments/popia` | `/services`, `/resources` |
| Ransomware & Recovery | `/contact?service=ransomware` | `/assessments/security`, `/resources` |
| Cloud Backup / Data Governance | `/contact?service=ibm-backup` | `/pos`, `/assessments/security` |
| IBM Guardium | `/contact?service=guardium` | `/services` |
| Quantum Security | `/contact?service=quantum` | `/services` |

Once the blog has 5+ articles, add links from service pages back to relevant articles.

---

## Future Content Ideas (beyond article 15)

Topics to consider once the initial 15 are live:

- **POPIA Conditions series** — One article per condition (8 total), targeting "POPIA Condition 1: Accountability" etc.
- **Case studies** — 3–4 anonymised client success stories with specific RTO/RPO metrics
- **Google Workspace backup** — Counterpart to the M365 article
- **POPIA for Healthcare** — HPCSA records obligations
- **POPIA for Legal Firms** — Document retention obligations
- **Disaster recovery testing** — How to test a DR plan without disrupting production
- **Data classification framework** — How to classify data for retention and access control
- **MaaS360 vs native MDM** — Comparison piece targeting "maas360 vs intune"

---

## Publishing Calendar (Target)

| Week | Article | Publish Date |
|------|---------|-------------|
| 1 | What M365 Doesn't Back Up | 2026-05-06 ✅ |
| 2 | POPIA Information Officer | 2026-05-13 |
| 3 | RTO vs RPO | 2026-05-20 |
| 4 | Ransomware Recovery Time | 2026-05-27 |
| 5 | Immutable Backup | 2026-06-03 |
| 6 | POPIA vs GDPR | 2026-06-10 |
| 7 | POPIA Data Breach Notification | 2026-06-17 |
| 8 | POPIA Financial Services | 2026-06-24 |
| 9 | IBM Guardium | 2026-07-01 |
| 10 | Business Continuity Plan | 2026-07-08 |
| 11 | Post-Quantum Cryptography | 2026-07-15 |
| 12 | POPIA Readiness Checklist | 2026-07-22 |
| 13 | Salesforce Backup Risks | 2026-07-29 |
| 14 | 3-2-1-1-0 Backup Rule | 2026-08-05 |
| 15 | BYOD Data Risk | 2026-08-12 |
