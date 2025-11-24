import Link from 'next/link'
import { MessageCircle, Phone, Mail, ShieldCheck, Clock, LifeBuoy, ArrowRight, FileText, BookOpen, Zap, CheckCircle2, Bell, Download } from 'lucide-react'

const categories = [
  { title: 'Bookings & dates', desc: 'Changes, cancellations, extensions', icon: Clock },
  { title: 'Payments & refunds', desc: 'Charges, invoices, credits', icon: ShieldCheck },
  { title: 'Property issues', desc: 'Access, cleanliness, amenities', icon: LifeBuoy },
  { title: 'Profile & security', desc: 'Account, verification, notifications', icon: Bell },
]

const guides = [
  { title: 'Change or cancel a booking', href: '/help-center' },
  { title: 'Request an invoice or receipt', href: '/help-center' },
  { title: 'What to do if you can’t check in', href: '/help-center' },
  { title: 'Payment methods we support', href: '/help-center' },
]

const quickLinks = [
  { label: 'View my trips', href: '/client-dashboard?tab=my-trips' },
  { label: 'Payments & invoices', href: '/client-dashboard?tab=payments' },
  { label: 'Profile & KYC', href: '/client-dashboard?tab=profile' },
  { label: 'Open dashboard', href: '/client-dashboard' },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0">
          <div className="absolute -left-10 top-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute right-0 -bottom-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/10 px-3 py-1 rounded-full">
              <ShieldCheck size={14} className="text-yellow-300" /> Houseiana Support
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Get help fast—changes, refunds, and check-in support.
            </h1>
            <p className="text-white/80 text-lg">
              Message us, call us, or browse guides. We adjust dates, update guests, and resolve property issues quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/client-dashboard?tab=support"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-orange-50 transition-colors"
              >
                <MessageCircle size={18} /> Open support in dashboard
              </Link>
              <Link
                href="mailto:help@houseiana.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <Mail size={18} /> Email us
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2"><Clock size={16} /> 24/7 concierge</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} /> Houseiana Shield protection</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start a conversation</p>
                <h2 className="text-2xl font-bold text-gray-900">Message support</h2>
                <p className="text-sm text-gray-600">We can adjust dates, update guests, or send invoices.</p>
              </div>
              <Link href="/client-dashboard?tab=support" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Go to support <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <MessageCircle size={16} className="text-orange-600" /> Live chat
                </div>
                <p className="text-sm text-gray-600">Response in a few minutes</p>
                <Link href="/client-dashboard?tab=support" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Start chat</Link>
              </div>
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Phone size={16} className="text-green-600" /> Call concierge
                </div>
                <p className="text-sm text-gray-600">+974 0000 0000 · 24/7</p>
                <Link href="tel:+97400000000" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Call now</Link>
              </div>
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Mail size={16} className="text-blue-600" /> Email & tickets
                </div>
                <p className="text-sm text-gray-600">help@houseiana.com</p>
                <Link href="mailto:help@houseiana.com" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Send email</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={18} />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Houseiana Shield</p>
                <p className="font-bold text-gray-900">You’re protected</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16} /> 24/7 concierge for every booking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16} /> Dedicated team for date changes and guest updates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16} /> Fast resolutions for access or cleanliness issues</li>
            </ul>
            <Link href="/client-dashboard?tab=support" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
              View support status <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Browse by topic</p>
                <h3 className="text-xl font-bold text-gray-900">Popular help categories</h3>
              </div>
              <Link href="/help-center" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.title} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-gray-100 text-orange-600">
                    <cat.icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cat.title}</p>
                    <p className="text-sm text-gray-600">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</p>
                <p className="font-bold text-gray-900">Invoices & receipts</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Download receipts or request a stamped invoice for your trips.</p>
            <div className="flex flex-col gap-2">
              <Link href="/client-dashboard?tab=payments" className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
                <Download size={16} /> Go to payments
              </Link>
              <Link href="/help-center" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
                Invoice FAQs
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guides</p>
              <h3 className="text-xl font-bold text-gray-900">Top guides right now</h3>
            </div>
            <Link href="/help-center" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View all guides <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {guides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors flex items-center justify-between text-sm font-semibold text-gray-800"
              >
                <span>{guide.title}</span>
                <ArrowRight size={14} className="text-orange-600" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-3xl border border-gray-100 bg-gray-900 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-yellow-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Need help fast?</p>
                <h4 className="text-xl font-bold">Start live chat</h4>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">Concierge responds in minutes for booking changes or access issues.</p>
            <Link
              href="/client-dashboard?tab=support"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-orange-50 transition-colors"
            >
              Start chat
            </Link>
          </div>

          <div className="p-5 rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-indigo-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Self-serve</p>
                <h4 className="text-xl font-bold text-gray-900">Quick links</h4>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 text-sm font-semibold text-gray-800 transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={14} className="text-orange-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
