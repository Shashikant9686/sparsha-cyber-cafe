import React from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageSquare, ExternalLink, Navigation } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact & Location in Aland',
  description:
    'Visit Sparsha Online Center (HH78+Q27, Aland) near Lingasayat Bhavan, Sagri Complex, Razvi Road, Aland, Kalaburagi. Call 7090161083 / 7483941814.',
  openGraph: {
    title: 'Contact SPARSHA ONLINE CENTER | Aland, Kalaburagi',
    description:
      'Find Sparsha Online Center in Aland for fast online applications, KCET/NEET option entry, and certificate services.',
  },
};

export default function ContactPage() {
  const phone1 = "+91 7090161083";
  const phone2 = "+91 7483941814";
  const email = "Shashikantkmali83@gmail.com";
  const plusCode = "HH78+Q27, Aland, Karnataka";
  const fullAddress = "Sparsha Online Center, HH78+Q27, Near Lingasayat Bhavan, Sagri Complex, Razvi Road, Aland, Karnataka 585302";

  // Exact Google Maps Direction & Embed URLs using the precise Plus Code
  const googleMapEmbedUrl = "https://maps.google.com/maps?q=Sparsha+Cyber+Cafe,+HH78%2BQ27,+Aland,+Karnataka&t=&z=16&ie=UTF8&iwloc=&output=embed";
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Sparsha+Cyber+Cafe,+HH78%2BQ27,+Aland,+Karnataka";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact & Location Desk</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visit our centre in Aland or verify your documents via WhatsApp before arriving.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Centre Address</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>SPARSHA ONLINE CENTER</strong><br />
                Plus Code: <span className="font-semibold text-blue-600">{plusCode}</span><br />
                Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland, Karnataka 585302
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mt-3"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Turn-by-Turn Route</span>
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Phone & WhatsApp</h2>
              <div className="text-xs text-slate-600 mt-1 space-y-1">
                <p>
                  Primary: <a href="tel:7090161083" className="font-semibold text-slate-800 hover:text-blue-600">{phone1}</a>
                </p>
                <p>
                  Secondary: <a href="tel:7483941814" className="font-semibold text-slate-800 hover:text-blue-600">{phone2}</a>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Email Address</h2>
              <p className="text-xs text-slate-600 mt-1">
                <a href={`mailto:${email}`} className="font-semibold text-slate-800 hover:text-blue-600 break-all">
                  {email}
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Working Hours</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Monday – Sunday:</strong> 8:00 AM – 8:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: WhatsApp + Accurate Route Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">WhatsApp Document Pre-Verification</h2>
              <p className="text-xs text-slate-500">
                Send photos of your marks card, Aadhaar, or caste certificate on WhatsApp before visiting.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-slate-800">Direct Operator Assistance</span>
                <p className="text-xs text-slate-500">Quick answers for document requirements & fees.</p>
              </div>
              <a
                href="https://wa.me/917090161083?text=Hello%20Sparsha%20Online%20Center,%20I%20need%20assistance%20with%20an%20application."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2 whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" /> Chat on WhatsApp (7090161083)
              </a>
            </div>
          </div>

          {/* Interactive Google Map directly focused on Sparsha Sparsha Online Center Plus Code */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Sparsha Online Center (HH78+Q27, Aland)
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>Open in Google Maps Route</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <iframe
                title="Sparsha Online Center Aland Map Route"
                src={googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}