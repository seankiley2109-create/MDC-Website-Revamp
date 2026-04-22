import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Mail, MapPin, ExternalLink, Download } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { PrintButton } from './print-button';

export const metadata: Metadata = {
  title: 'Privacy Statement',
  description: 'Montana Data Company privacy statement — how we collect, use, and protect your personal information in accordance with POPIA.',
  robots: { index: false, follow: false },
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-lg font-bold text-white mb-4 flex items-baseline gap-3">
        <span className="text-montana-pink font-mono text-sm">{number}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm text-montana-muted leading-relaxed pl-6">
        {children}
      </div>
    </section>
  );
}

function Sub({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="text-white/50 font-mono text-xs mr-2">{label}</span>
      {children}
    </p>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-montana-pink/70" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6">

        {/* Header */}
        <div className="py-16 md:py-20">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Legal
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Privacy Statement
          </h1>
          <p className="text-montana-muted mb-6">
            Montana Data Company (Pty) Ltd &mdash; effective as published on this website.
          </p>
          <PrintButton />
        </div>

        <SpotlightCard customSize className="p-8 md:p-12 mb-8">

          <Section number="1" title="Introduction">
            <Sub label="1.1">
              Montana Data Company (Pty) Ltd (hereafter &ldquo;Montana&rdquo; or &ldquo;we&rdquo; or &ldquo;us&rdquo; or &ldquo;our&rdquo;) respects your privacy and the protection of your personal information as shared by you, is important to us. We are committed to ensuring the security and protection of the personal information that we process, and to provide a compliant and consistent approach to data protection.
            </Sub>
            <p className="text-white/40 text-xs italic">
              References to &ldquo;POPIA&rdquo; mean the Protection of Personal Information Act 4 of 2013. References to &ldquo;PAIA&rdquo; mean the Promotion of Access to Information Act 2 of 2000 as amended in 2021.
            </p>
            <Sub label="1.2">
              This privacy statement, together with the Montana PAIA manual, aims to inform you on the manner in which your personal information may be processed and how you can access such personal information as held by Montana.
            </Sub>
            <Sub label="1.3">
              By visiting our website, communicating electronically with us and/or using our products and services, you consent to the processing and transfer of your personal information as set out in this privacy statement. Montana will take all reasonable measures to protect your personal information and to keep it confidential.
            </Sub>
            <Sub label="1.4">
              For purposes of this privacy statement, &ldquo;personal information&rdquo;, &ldquo;data subject&rdquo; and &ldquo;processing&rdquo; will have the meanings given to them under POPIA.
            </Sub>
            <Sub label="1.5">
              We may collect website usage information using &ldquo;cookies&rdquo; which allows us to collect standard internet visitor usage information. Details of all other documents pertaining to terms and conditions of personal information are available on request.
            </Sub>
            <Sub label="1.6">
              We reserve the right to amend this privacy statement at any time, without prior notice, by posting the amended statement on our website.
            </Sub>
          </Section>

          <Section number="2" title="Application of the Privacy Statement">
            <Sub label="2.1">
              Our privacy practices apply to the processing of your personal information collected by us or on our behalf — including data subjects who use our website and/or our products and services, and/or who provide us with products and services, customers and any other data subjects who engage with us.
            </Sub>
            <Sub label="2.2">
              This privacy statement does not apply to third party websites linked to our website, or websites that link to or advertise on our website.
            </Sub>
          </Section>

          <Section number="3" title="Collection of Personal Information">
            <Sub label="3.1">
              Personal information may be provided to us by you and/or collected by us when you engage with us and/or on your use of our products and services, and/or when you access our website, or from third parties (such as regulators).
            </Sub>
            <Sub label="3.2">
              The type of personal information we collect depends on the purpose for which it is collected and used. This includes but is not limited to when:
            </Sub>
            <ul className="space-y-2 mt-2">
              <ListItem>You purchase and/or use our products and services.</ListItem>
              <ListItem>You submit queries or contact us — you may be required to provide your name, identity or passport number, account number, address, contact numbers or email address.</ListItem>
              <ListItem>You use our website or interact with us on social media — we may collect browsing habits, click patterns, email address, IP address, or telephone data.</ListItem>
              <ListItem>You apply for employment at Montana — you may be required to provide identity details, employment history, and criminal behaviour information.</ListItem>
              <ListItem>You visit our premises where CCTV cameras are installed.</ListItem>
              <ListItem>Where possible, we will inform you what information is voluntary or mandatory and the consequences of failing to provide it.</ListItem>
              <ListItem>We will only retain your personal information as long as necessary for the identified purposes, as required by law, or as agreed with you.</ListItem>
            </ul>
          </Section>

          <Section number="4" title="How We Use Your Information">
            <Sub label="4.1">
              Your personal information will only be processed for the purposes for which it was collected and/or to comply with legal and regulatory obligations and/or as authorised by law and/or with your consent.
            </Sub>
            <Sub label="4.2">The purposes for which we process personal information include, but are not limited to:</Sub>
            <ul className="space-y-2 mt-2">
              <ListItem>To respond to your enquiry.</ListItem>
              <ListItem>To provide services or products to you.</ListItem>
              <ListItem>To provide access to restricted pages on our website.</ListItem>
              <ListItem>To comply with legal requirements or industry codes.</ListItem>
              <ListItem>To market or promote our services and products.</ListItem>
              <ListItem>For safety and security reasons.</ListItem>
              <ListItem>To compile non-personal statistical information about browsing habits and access to the Montana website or its Social Media pages.</ListItem>
            </ul>
          </Section>

          <Section number="5" title="Disclosure of Information">
            <Sub label="5.1">Montana may disclose your personal information to third parties in certain circumstances, including:</Sub>
            <ul className="space-y-2 mt-2">
              <ListItem>Where we have your consent.</ListItem>
              <ListItem>Where we are required to do so by law.</ListItem>
              <ListItem>To our service providers who are involved in the delivery of products or services to you, where we have agreements in place to ensure compliance with these privacy terms.</ListItem>
            </ul>
            <Sub label="5.2">Third parties to whom we may disclose personal information include:</Sub>
            <ul className="space-y-2 mt-2">
              <ListItem>Service providers to Montana.</ListItem>
              <ListItem>Accredited debt collection agencies.</ListItem>
              <ListItem>Regulators, courts, tribunals and law enforcement agencies.</ListItem>
            </ul>
            <Sub label="5.3">
              We may compile, use and share any information that does not relate to any specific individual and retain all rights to non-personal statistical information collected and compiled by us.
            </Sub>
          </Section>

          <Section number="6" title="Transfer of Information">
            <Sub label="6.1">
              We may need to transfer your personal information to another country for processing or storage. We will ensure that anyone to whom we pass your personal information agrees to treat your information with similar protection as provided for in POPIA.
            </Sub>
            <Sub label="6.2">
              We may transfer your information to other countries which do not have similar protection as provided for in POPIA, with your consent.
            </Sub>
          </Section>

          <Section number="7" title="Information Security">
            <Sub label="7.1">
              We take appropriate and reasonable technical and organisational measures to prevent any unauthorised or unlawful access, loss, damage to or unauthorised destruction of personal information.
            </Sub>
            <Sub label="7.2">We have implemented various policies, procedures and standards to safeguard personal information.</Sub>
            <Sub label="7.3">
              We regularly verify that the safeguards are effectively implemented and ensure that they are continually updated in line with best practices.
            </Sub>
            <Sub label="7.4">
              Montana has implemented procedures to address actual and suspected data breaches, and undertakes to notify you and the relevant regulatory authorities of breaches where legally required and within the necessary period.
            </Sub>
            <Sub label="7.5">
              Notwithstanding paragraphs 7.1 to 7.3 above, to the extent permissible by law, we shall not be liable for any loss, claim and/or damage arising from any unauthorised access, disclosure, misuse, loss, alteration or destruction of your personal information.
            </Sub>
          </Section>

          <Section number="8" title="Third-Party Data Processors">
            <Sub label="8.1">
              Montana engages the following third-party data processors to deliver its website, platform, and services. Each processor operates under a data processing agreement and is bound by applicable data protection legislation. By using our website and services, you consent to the transfer of your personal information to these processors as described below, in accordance with POPIA Chapter 9.
            </Sub>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-montana-muted border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/50 font-bold uppercase tracking-wider">Processor</th>
                    <th className="text-left py-2 pr-4 text-white/50 font-bold uppercase tracking-wider">Purpose</th>
                    <th className="text-left py-2 pr-4 text-white/50 font-bold uppercase tracking-wider">Data Stored</th>
                    <th className="text-left py-2 text-white/50 font-bold uppercase tracking-wider">Region / Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4 text-white font-medium">Supabase</td>
                    <td className="py-2 pr-4">Database & authentication</td>
                    <td className="py-2 pr-4">Profile data, assessment results, purchase history</td>
                    <td className="py-2">EU (Frankfurt) · ISO 27001 · SOC 2</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white font-medium">Paystack</td>
                    <td className="py-2 pr-4">Payment processing</td>
                    <td className="py-2 pr-4">Transaction records, billing details (no card data stored by Montana)</td>
                    <td className="py-2">PCI DSS Level 1 compliant</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white font-medium">Resend</td>
                    <td className="py-2 pr-4">Transactional email delivery</td>
                    <td className="py-2 pr-4">Name, email address, enquiry content</td>
                    <td className="py-2">EU · SOC 2 Type II</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white font-medium">Monday.com</td>
                    <td className="py-2 pr-4">CRM & lead management</td>
                    <td className="py-2 pr-4">Contact details, enquiry type, assessment outcomes</td>
                    <td className="py-2">EU · ISO 27001 · SOC 2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Sub label="8.2">
              Montana does not sell your personal information to any third party. Data shared with processors is limited to what is strictly necessary to deliver the relevant service.
            </Sub>
            <Sub label="8.3">
              You may request details of any processing agreement or request that your personal information be deleted by contacting us at <a href="mailto:info@montanadc.com" className="text-montana-pink hover:underline">info@montanadc.com</a>.
            </Sub>
          </Section>

          <Section number="10" title="Supporting Terms and Conditions">
            <p>
              This privacy statement can be read in conjunction with privacy matters and conditions for lawful processing of personal information contained in various supporting documents on Montana&apos;s corporate website:{' '}
              <a href="https://www.montanadc.com" className="text-montana-pink hover:underline">www.montanadc.com</a>.
            </p>
          </Section>

          <Section number="11" title="Use of Cookies">
            <Sub label="9.1">
              Montana may use &ldquo;cookies&rdquo; to enhance your experience as a customer. Your web browser places cookies on your hard drive for record-keeping purposes and sometimes to track information about you. You may choose to set your web browser to refuse cookies or to be notified when cookies are being sent. Note that some parts of the website may not function properly if you do so.
            </Sub>
            <Sub label="9.2">Montana collects, stores and uses cookie information for the following purposes:</Sub>
            <ul className="space-y-2 mt-2">
              <ListItem>To communicate requested information to you.</ListItem>
              <ListItem>To provide services to you as requested.</ListItem>
              <ListItem>To authenticate you and provide access to restricted pages.</ListItem>
              <ListItem>To compile non-personal statistical information about browsing habits, click-patterns, and access to the Montana website.</ListItem>
            </ul>
            <Sub label="9.3">
              Information is collected either electronically by using cookies or is provided voluntarily by you. Users may determine cookie use independently through their browser settings.
            </Sub>
            <Sub label="9.4">
              Montana utilises &ldquo;first party cookies&rdquo; (originating from us) to track visits between sessions and deliver a more personalised experience. We also utilise &ldquo;third party cookies&rdquo; to provide traffic analysis and tracking.
            </Sub>
            <Sub label="9.5">
              Cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites. They do not store personal information directly but are based on uniquely identifying your browser and internet device.
            </Sub>
          </Section>

          <Section number="12" title="Google Analytics Use of Cookies">
            <Sub label="10.1">
              On our website we use &ldquo;Google Analytics&rdquo;, a web analytics service of Google Inc. Google Analytics uses cookies on your device which assists in evaluating the use of our website.
            </Sub>
            <Sub label="10.2">
              We use the code <code className="text-montana-pink text-xs">ga._anonymizeIP</code> which results in Google shortening your IP address and allowing an anonymised evaluation within the EU or European Economic Area.
            </Sub>
            <Sub label="10.3">
              Compliance with data protection standards is ensured by a certification under the EU-US privacy shield. See the{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-montana-pink hover:underline inline-flex items-center gap-1">Google Privacy Statement <ExternalLink className="h-3 w-3" /></a>{' '}
              for more information.
            </Sub>
            <Sub label="10.4">
              Google uses data collected through Google Analytics to evaluate the use of our website, compile reports on website activities, and provide further information related to website use.
            </Sub>
            <Sub label="10.5">Data is processed based on your consent provided via our cookie banner.</Sub>
            <Sub label="10.6">
              Data is stored for a period of 14 months. You can prevent storage of Google Analytics cookies via your browser settings or by using the opt-out option on our cookie banner.
            </Sub>
          </Section>

          <Section number="13" title="Links to Montana Social Media Pages">
            <Sub label="11.1">
              Montana has links to their Social Media pages (LinkedIn and Facebook). If you visit these websites the Privacy Policy and Terms and Conditions of the specific platform apply.
            </Sub>
            <Sub label="11.2">
              When you contact us via a contact form, via email or phone we process the personal data you communicate to us, including your name, email address and your request. The data will be stored in a Montana repository.
            </Sub>
          </Section>

          <Section number="14" title="Data Subject Rights">
            <p>Subject to POPIA provisions, you have the right to:</p>
            <ul className="space-y-2 mt-2">
              <ListItem>Request access to your personal information.</ListItem>
              <ListItem>Request, where necessary, the correction, destruction or deletion of your personal information.</ListItem>
              <ListItem>Request Montana to amend incorrect data, or delete your personal data provided the request does not conflict with a statutory or contractual obligation to retain data.</ListItem>
              <ListItem>Object to the processing of your personal information for any reason, including direct marketing.</ListItem>
              <ListItem>Submit a complaint to the Information Regulator regarding alleged interference with the protection of your personal information.</ListItem>
              <ListItem>Institute civil proceedings regarding alleged interference with the protection of your personal information.</ListItem>
            </ul>
          </Section>

          {/* Consent box */}
          <div className="border border-montana-pink/20 bg-montana-pink/5 p-6 mb-10">
            <h3 className="font-display font-bold text-white mb-3 text-sm uppercase tracking-wider">Consent to Receive Direct Marketing</h3>
            <p className="text-sm text-montana-muted leading-relaxed">
              By submitting my details, I hereby give consent to Montana Data Company (Pty) Ltd (&ldquo;Montana&rdquo;), the Original Equipment Manufacturers that are marketed by Montana (Technology Partners) and their duly appointed agents to process my personal information as provided, for the purposes of direct marketing by means of electronic communication in respect of information and communications technology related goods and services.
            </p>
            <p className="text-sm text-montana-muted leading-relaxed mt-3">
              I understand that my data will be used solely for the purposes for which it was provided, and that I can at any time unsubscribe by contacting Montana.
            </p>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-montana-pink" />
                <h3 className="font-display font-bold text-white text-sm">Privacy Enquiries</h3>
              </div>
              <div className="space-y-2 text-sm text-montana-muted">
                <a href="mailto:info@montanadc.com" className="flex items-center gap-2 hover:text-montana-pink transition-colors">
                  <Mail className="h-3.5 w-3.5" /> info@montanadc.com
                </a>
                <div className="flex items-start gap-2 mt-3">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <address className="not-italic leading-relaxed">
                    The Information Officer<br />
                    Suite 158, First Floor<br />
                    Willowbridge Centre<br />
                    Carl Cronje Drive, Tyger Valley<br />
                    7530
                  </address>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-4 w-4 text-montana-pink" />
                <h3 className="font-display font-bold text-white text-sm">Information Regulator</h3>
              </div>
              <div className="space-y-2 text-sm text-montana-muted leading-relaxed">
                <p>You have the right to lodge a complaint with the Information Regulator.</p>
                <div className="space-y-1 mt-2">
                  <p><span className="text-white/40">Complaints:</span> <a href="mailto:complaints.IR@justice.gov.za" className="hover:text-montana-pink transition-colors">complaints.IR@justice.gov.za</a></p>
                  <p><span className="text-white/40">Enquiries:</span> <a href="mailto:inforeg@justice.gov.za" className="hover:text-montana-pink transition-colors">inforeg@justice.gov.za</a></p>
                  <p><span className="text-white/40">Address:</span> 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-8">
            <Link href="/paia" className="text-sm text-montana-pink hover:underline flex items-center gap-1">
              View PAIA Manual & Forms <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href="/contact" className="text-sm text-montana-muted hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>

        </SpotlightCard>
      </div>
    </div>
  );
}
