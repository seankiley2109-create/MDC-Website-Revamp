import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Facebook, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-montana-bg/80 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <Image
                src="/logos/montana-logo.svg"
                alt="Montana Data Company"
                width={220}
                height={80}
                className="h-32 md:h-36 w-auto object-contain mb-4"
              />
            </Link>
            <p className="text-sm text-montana-muted max-w-sm">
              Enterprise-grade data protection, secure transfer, cyber resilience, and compliance support for businesses and channel partners.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-white font-display font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/services" className="text-montana-muted hover:text-white hover-interactive">Services</Link></li>
              <li><Link href="/resources" className="text-montana-muted hover:text-white hover-interactive">Resources</Link></li>
              <li><Link href="/assessments" className="text-montana-muted hover:text-white hover-interactive">Assessments</Link></li>
              <li><Link href="/partners" className="text-montana-muted hover:text-white hover-interactive">Partners</Link></li>
              <li><Link href="/about" className="text-montana-muted hover:text-white hover-interactive">About</Link></li>
              <li><Link href="/contact" className="text-montana-muted hover:text-white hover-interactive">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-display font-bold mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm mb-6">
              <li>
                <a href="tel:+27871883843" className="flex items-center gap-3 text-montana-muted hover:text-white hover-interactive">
                  <Phone className="h-4 w-4 text-montana-pink" />
                  +27 (0)87 188 3843
                </a>
              </li>
              <li>
                <a href="mailto:support@montanadc.com" className="flex items-center gap-3 text-montana-muted hover:text-white hover-interactive">
                  <Mail className="h-4 w-4 text-montana-pink" />
                  support@montanadc.com
                </a>
              </li>
            </ul>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/MontanaDataCompany/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-montana-muted hover:text-white hover-interactive"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/montana-data-company/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="text-montana-muted hover:text-white hover-interactive"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-montana-muted/50 order-2 md:order-1">
            © {new Date().getFullYear()} Montana Data Company. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-montana-muted order-1 md:order-2">
            <Link href="/privacy" className="hover:text-montana-pink hover-interactive">Privacy Policy</Link>
            <Link href="/paia" className="hover:text-montana-pink hover-interactive">PAIA</Link>
            <Link href="/contact" className="hover:text-montana-pink hover-interactive">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
