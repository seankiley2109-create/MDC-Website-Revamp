'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Shield, Lock, Database, ArrowRight, Download, BookOpen, CheckSquare, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ResourceDownloadModal, type DownloadResource } from '@/components/resources/ResourceDownloadModal';
import { ResourcePreviewModal, type PreviewResource } from '@/components/resources/ResourcePreviewModal';
import { createBrowserClient } from '@/lib/supabase/browser';

const resources = [
  {
    category: 'Compliance',
    icon: FileText,
    color: 'text-montana-magenta',
    bg: 'bg-montana-magenta/10',
    border: 'border-montana-magenta/20',
    items: [
      {
        title:       'POPIA Compliance Checklist for SMEs',
        description: 'A practical, step-by-step checklist covering the eight conditions for lawful processing under POPIA. Tailored for organisations with 50–500 employees.',
        type:        'Checklist',
        readTime:    '10 min read',
        file:        '/resources/popia-compliance-checklist.pdf',
        filename:    'POPIA-Compliance-Checklist-for-SMEs.pdf',
        cta:         'Download Free',
        excerpt: `South Africa's Protection of Personal Information Act came into full effect on 1 July 2021 — and the Information Regulator has made clear that the grace period is over. For organisations with 50–500 employees, achieving compliance is not a once-off project; it is an ongoing operational discipline that touches every department that processes personal data.

This checklist is structured around the eight conditions for lawful processing set out in POPIA, each broken into actionable items your team can verify and sign off. Before you begin, note that Condition 1 — Accountability — is foundational: if your organisation has not yet formally appointed an Information Officer and registered them with the Information Regulator, every item that follows carries elevated risk.

Condition 1: Accountability

1.1 — Has an Information Officer been designated in writing by the head of the organisation? Under section 55 of POPIA, this person bears personal liability for...`,
      },
      {
        title:       "The Information Officer's Handbook",
        description: 'A comprehensive guide to the duties, responsibilities, and liabilities of the Information Officer role under South African privacy law.',
        type:        'Guide',
        readTime:    '25 min read',
        file:        '/resources/information-officers-handbook.pdf',
        filename:    'Information-Officers-Handbook.pdf',
        cta:         'Get the Guide',
        excerpt: `The role of Information Officer is one of the most consequential — and most misunderstood — positions in South African corporate governance. Created by POPIA, the role carries personal liability for compliance failures, yet most organisations appoint someone without fully communicating what they are signing up for.

This handbook exists to close that gap. It is written for newly appointed Information Officers, deputies, and the legal or HR teams responsible for onboarding them.

Part One: The Legal Framework

Your authority as Information Officer flows directly from section 55 of POPIA, which requires the head of a private body to designate an Information Officer. That officer is then responsible for encouraging compliance within the organisation, dealing with requests made pursuant to the Act, working with the Information Regulator, and ensuring that the organisation's processing of personal information complies with...`,
      },
    ],
  },
  {
    category: 'Ransomware & Cyber Resilience',
    icon: Shield,
    color: 'text-montana-pink',
    bg: 'bg-montana-pink/10',
    border: 'border-montana-pink/20',
    items: [
      {
        title:       'Ransomware Response Playbook',
        description: 'What to do in the first 72 hours after a ransomware attack. A comprehensive decision-tree framework for IT teams and business continuity managers.',
        type:        'Playbook',
        readTime:    '15 min read',
        file:        '/resources/ransomware-playbook-full.pdf',
        filename:    'Ransomware-Response-Playbook.pdf',
        cta:         'Download Playbook',
        excerpt: `The first 72 hours of a ransomware incident will determine whether your organisation recovers cleanly or spends the next six months in crisis mode. Most organisations discover an attack too late — often only when encrypted files start appearing or systems stop responding. By that point, the attacker has typically been inside your network for 14 to 21 days.

This playbook is built around a single principle: containment before investigation. The instinct to understand what happened before isolating systems costs organisations millions of rands in additional damage every year.

Hour 0–4: Immediate Containment

The moment an incident is suspected, the following actions must occur in sequence — do not skip steps and do not wait for confirmation before beginning.

Step 1 — Activate your incident response team. Your IRT should include at minimum: your CISO or IT lead, a business continuity owner, a legal representative, and your cyber insurance broker contact. If you do not have an IRT defined, appoint a decision-maker now. Every minute of...`,
      },
      {
        title:       'Ransomware Response Playbook — Quick Reference',
        description: 'A condensed one-page version of the full playbook. Pin it to your incident-response war room wall for fast decision-making under pressure.',
        type:        'Quick Ref',
        readTime:    '2 min read',
        file:        '/resources/ransomware-playbook-short.pdf',
        filename:    'Ransomware-Response-Quick-Reference.pdf',
        cta:         'Download Quick Ref',
        excerpt: `RANSOMWARE INCIDENT — QUICK RESPONSE CARD
Cut off affected systems first. Ask questions second.

─────────────────────────────────────
HOUR 0–4: CONTAIN
─────────────────────────────────────
☐  Isolate affected machines from the network (unplug — don't just disable Wi-Fi)
☐  Do NOT power off — forensic memory may be required by insurers
☐  Alert your IRT lead immediately and open a secure out-of-band comms channel
☐  Preserve all logs — copy to an unaffected system or flag to your SIEM

─────────────────────────────────────
HOUR 4–12: ASSESS
─────────────────────────────────────
☐  Identify the ransomware variant (check ransom note filename and file extension)
☐  Establish blast radius — which systems are confirmed clean?
☐  Notify your cyber insurance provider within the policy window (typically 24–72 hrs)
☐  Do NOT pay the ransom before consulting your insurer and notifying law enforcement

─────────────────────────────────────
HOUR 12–24: RECOVER
─────────────────────────────────────
☐  Validate integrity of your most recent clean backup before...`,
      },
      {
        title:       'Immutable Backups: Why Your Current Backup Is Not Enough',
        description: 'An in-depth analysis of how modern ransomware targets backup infrastructure, and how immutable storage changes the equation.',
        type:        'Whitepaper',
        readTime:    '20 min read',
        file:        '/resources/immutable-backups.pdf',
        filename:    'Immutable-Backups-Whitepaper.pdf',
        cta:         'Read Whitepaper',
        excerpt: `In 2023, Veeam's Global Ransomware Trends Report found that in 93% of ransomware attacks, threat actors specifically targeted backup repositories. In almost every attack, the backup infrastructure was a primary target — not an afterthought.

This changes everything about how we should think about backup strategy. For decades, the 3-2-1 rule was the gold standard: three copies of data, on two different media types, with one copy offsite. It remains sound advice. But it was designed for a threat environment where attackers were trying to corrupt or steal data — not one where sophisticated adversaries spend weeks inside your network, methodically identifying and poisoning every recovery option before they detonate.

How Modern Ransomware Attacks Backup Infrastructure

The attack playbook is well-documented. After gaining initial access — typically through a phishing email or unpatched VPN appliance — the attacker establishes persistence and begins reconnaissance. Their first priority is not your production data. It is your backup catalogue.

By compromising your backup server credentials and silently deleting or corrupting recovery points over several weeks, attackers ensure that when they finally encrypt your production environment, you have no clean restore point to fall back on. The ransom note arrives and your only option is...`,
      },
    ],
  },
  {
    category: 'Data Protection Strategy',
    icon: Database,
    color: 'text-montana-orange',
    bg: 'bg-montana-orange/10',
    border: 'border-montana-orange/20',
    items: [
      {
        title:       'Calculating Your True RTO & RPO',
        description: 'A business-led framework for defining recovery time and point objectives. Stop setting technical targets and start setting business outcomes.',
        type:        'Framework',
        readTime:    '12 min read',
        file:        '/resources/calculating-rto-rpo.pdf',
        filename:    'Calculating-True-RTO-RPO.pdf',
        cta:         'Get Framework',
        excerpt: `Most organisations have recovery time and recovery point objectives. Very few have the right ones.

RTO and RPO are typically set by IT teams working backwards from what their current infrastructure can deliver, rather than forwards from what the business actually needs. The result is a set of numbers that live in a BCP document, satisfy an auditor, and bear no meaningful relationship to the financial and operational reality of a real outage.

This framework is designed to fix that. It starts not with your backup software, but with your revenue model.

Step 1: Map Your Revenue-Critical Processes

Before you can set a meaningful RTO, you need to answer a deceptively simple question: which systems, if unavailable for one hour, would cause your business to stop generating revenue or incur regulatory penalties?

List every business process and assign it to one of four tiers:

Tier 1 — Revenue-critical: outage directly stops billing, sales, or service delivery within minutes
Tier 2 — Operationally critical: outage causes significant productivity loss but revenue continues for a short window
Tier 3 — Important but deferrable: functions can be performed manually for 24–48 hours
Tier 4 — Non-critical: outage has negligible short-term impact

Once your process map is complete, the next step is to attach a financial cost to each tier — and this is where most...`,
      },
      {
        title:       'SaaS Data Protection: The Microsoft 365 Blind Spot',
        description: "Microsoft's shared responsibility model means your M365 data is at risk. This guide explains what is and isn't covered — and how to close the gap.",
        type:        'Guide',
        readTime:    '18 min read',
        file:        '/resources/saas-data-protection-m365.pdf',
        filename:    'SaaS-Data-Protection-M365.pdf',
        cta:         'Read Guide',
        excerpt: `There is a sentence buried in Microsoft's Service Agreement that most M365 administrators have never read:

"We recommend that you regularly backup Your Content and Data that you store on the Services or store using Third-Party Apps and Services."

Microsoft recommends that you back up your own data. This is not a loophole or a fine-print technicality — it is a precise statement of how the shared responsibility model works. Microsoft is responsible for the availability and integrity of the M365 platform. You are responsible for the data that lives on it.

What Microsoft Does — and Doesn't — Protect

Microsoft maintains geo-redundant copies of your data and will restore service availability after a platform outage. What they will not do is recover a specific user's mailbox after an accidental deletion 100 days ago, restore a SharePoint site that an administrator mistakenly wiped, or recover Teams conversations deleted by a departed employee.

Their retention policies are designed for platform resilience, not granular data recovery. The default deleted-item retention window for Exchange Online is 30 days. For SharePoint and OneDrive, version history is limited and recycle bin retention is 93 days — after which data is...`,
      },
    ],
  },
  {
    category: 'Future-Proofing',
    icon: Lock,
    color: 'text-white/70',
    bg: 'bg-white/5',
    border: 'border-white/10',
    items: [
      {
        title:       "Post-Quantum Cryptography: A Decision-Maker's Primer",
        description: "A non-technical introduction to the quantum threat, NIST's PQC standards, and what your organisation should be doing today to prepare.",
        type:        'Primer',
        readTime:    '10 min read',
        file:        '/resources/post-quantum-cryptography.pdf',
        filename:    'Post-Quantum-Cryptography-Primer.pdf',
        cta:         'Read Primer',
        excerpt: `Quantum computing will not break the internet next Tuesday. It may not happen in 2025, or even 2027. But the cryptographic infrastructure that protects your organisation's data, communications, and backups is almost certainly already being attacked — just not in the way you might expect.

The threat is called "harvest now, decrypt later." Nation-state actors and sophisticated criminal organisations are actively intercepting and storing encrypted network traffic today, waiting for a sufficiently powerful quantum computer to make decryption feasible. If your organisation handles data that will still be sensitive in 10 to 15 years — financial records, intellectual property, medical data, legal communications — that data may already be at risk.

Why Classical Encryption Fails Against Quantum Computers

The security of RSA-2048 and elliptic curve cryptography — the algorithms protecting the vast majority of internet traffic today — rests on a mathematical assumption: that factoring very large numbers is computationally infeasible. Classical computers agree. A quantum computer running Shor's algorithm does not.

NIST published its first finalised post-quantum cryptography standards in August 2024, selecting four algorithms designed to resist quantum attacks. The question is no longer whether organisations need to migrate — it is how quickly, and in what order. The answer depends on your data classification, your regulatory obligations, and...`,
      },
    ],
  },
];

const typeIcons: Record<string, React.ElementType> = {
  Checklist:  CheckSquare,
  Guide:      BookOpen,
  Playbook:   Shield,
  Whitepaper: FileText,
  Framework:  FileText,
  Primer:     BookOpen,
  'Quick Ref': FileText,
};

export default function ResourcesPage() {
  const [activeDownload, setActiveDownload]   = useState<DownloadResource | null>(null);
  const [activePreview, setActivePreview]     = useState<PreviewResource | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const directDownloadRef = useRef<HTMLAnchorElement>(null);
  const viewAnchorRef     = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  function handleDownloadClick(resource: DownloadResource) {
    if (isAuthenticated && directDownloadRef.current) {
      directDownloadRef.current.href     = resource.file;
      directDownloadRef.current.download = resource.filename;
      directDownloadRef.current.click();
    } else {
      setActiveDownload(resource);
    }
  }

  function handlePreviewClick(item: typeof resources[0]['items'][0], color: string) {
    if (isAuthenticated && viewAnchorRef.current) {
      viewAnchorRef.current.href = item.file;
      viewAnchorRef.current.click();
    } else {
      setActivePreview({
        title:    item.title,
        type:     item.type,
        excerpt:  item.excerpt,
        file:     item.file,
        filename: item.filename,
        color,
      });
    }
  }

  function handlePreviewDownload() {
    if (!activePreview) return;
    setActivePreview(null);
    setActiveDownload({ title: activePreview.title, file: activePreview.file, filename: activePreview.filename });
  }

  return (
    <>
      {/* Hidden anchors for authenticated actions */}
      <a ref={directDownloadRef} href="#" className="hidden" aria-hidden="true" />
      <a ref={viewAnchorRef} href="#" target="_blank" rel="noopener noreferrer" className="hidden" aria-hidden="true" />

      <div className="pt-24 pb-24 min-h-screen">
        <div className="mx-auto max-w-7xl px-6">

          {/* Hero */}
          <div className="py-16 md:py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
                  <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
                  Resources & Insights
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                  Knowledge that builds <span className="text-montana-gradient">resilience.</span>
                </h1>
                <p className="text-lg text-montana-muted leading-relaxed max-w-2xl">
                  Practical guides, compliance frameworks, and technical whitepapers. Everything your team needs to make informed decisions about data protection, governance, and cyber resilience.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src="/illustrations/resource.svg"
                  alt=""
                  aria-hidden="true"
                  className="w-full max-w-xs opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Resources by Category */}
          <div className="space-y-20">
            {resources.map((category) => {
              const CatIcon = category.icon;
              return (
                <div key={category.category}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-sm ${category.bg} border ${category.border}`}>
                      <CatIcon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">{category.category}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.items.map((item) => {
                      const TypeIcon = typeIcons[item.type] || FileText;
                      return (
                        <SpotlightCard customSize key={item.file} className="flex flex-col h-full group hover:border-montana-pink/40 transition-all">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm">
                              <TypeIcon className={`h-3 w-3 ${category.color}`} />
                              <span className="text-xs text-montana-muted font-medium">{item.type}</span>
                            </div>
                            <span className="text-xs text-montana-muted/60">{item.readTime}</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug">{item.title}</h3>
                          <p className="text-sm text-montana-muted leading-relaxed flex-1 mb-6">{item.description}</p>
                          <div className="flex gap-3">
                            <AnimatedButton
                              variant="primary"
                              className="flex-1 text-xs py-3"
                              onClick={() => handlePreviewClick(item, category.color)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              Preview
                            </AnimatedButton>
                            <AnimatedButton
                              variant="outline"
                              className="flex-1 text-xs py-3"
                              onClick={() => handleDownloadClick({ title: item.title, file: item.file, filename: item.filename })}
                            >
                              <Download className="h-3.5 w-3.5 mr-2" />
                              {item.cta}
                            </AnimatedButton>
                          </div>
                        </SpotlightCard>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="mt-24 border border-white/10 bg-montana-surface/30 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Ready to move from knowledge to action?
              </h2>
              <p className="text-montana-muted max-w-xl mx-auto mb-8">
                Our advisory team can translate these frameworks into a tailored resilience strategy for your organisation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pos">
                  <AnimatedButton variant="primary" className="px-8">
                    Build Your Solution
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </Link>
                <Link href="/contact">
                  <AnimatedButton variant="outline" className="px-8">
                    Speak to an Advisor
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ResourceDownloadModal
        resource={activeDownload}
        onClose={() => setActiveDownload(null)}
      />

      <ResourcePreviewModal
        resource={activePreview}
        onClose={() => setActivePreview(null)}
        onDownload={handlePreviewDownload}
      />
    </>
  );
}
