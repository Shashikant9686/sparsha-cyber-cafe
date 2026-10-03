import React from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import OpenStatusBadge from '@/components/OpenStatusBadge';
import SparshaLogo from '@/components/ui/SparshaLogo';

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory border-t border-ivory/10 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <SparshaLogo size="sm" showText={false} />
              <span className="font-display font-semibold text-sm tracking-tight text-ivory">
                {BUSINESS_INFO.name}
              </span>
            </Link>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Authorized digital facilitation center in Aland for 371(J) quota certificates, Bhoomi RTC Pahani extracts, KCET/NEET option entry, and government applications.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-saffron/70 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-ivory/60 font-medium">
              <li>
                <Link href="/" className="hover:text-saffron transition">Home Portal</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-saffron transition">Services Directory</Link>
              </li>
              <li>
                <Link href="/counselling" className="hover:text-saffron transition">Admission Desk (KCET / NEET)</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-saffron transition">Contact & Timings</Link>
              </li>
            </ul>
          </div>

          {/* Center Details */}
          <div className="space-y-3 text-xs text-ivory/60">
            <h4 className="text-[10px] font-bold text-saffron/70 uppercase tracking-wider">Center Details</h4>
            <div className="flex items-start gap-2 flex-wrap">
              <Clock className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
              <span>Monday – Sunday: 8:00 AM – 8:00 PM</span>
              <OpenStatusBadge />
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
              <span>Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland, Karnataka 585302</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-whatsapp shrink-0 mt-0.5" />
              <span>
                <a
                  href="tel:+917090161083"
                  className="hover:text-saffron transition focus-visible:outline-saffron focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
                >
                  +91 7090161083
                </a>
                {' / '}
                <a
                  href="tel:+917483941814"
                  className="hover:text-saffron transition focus-visible:outline-saffron focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
                >
                  +91 7483941814
                </a>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
              <a
                href="mailto:Shashikantkmali83@gmail.com"
                className="hover:text-saffron transition focus-visible:outline-saffron focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
              >
                Shashikantkmali83@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-saffron/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ivory/50">
          <p>© 2026 {BUSINESS_INFO.name}. All rights reserved.</p>
          <Link href="/login" className="hover:text-ivory transition">
            Operator / Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}