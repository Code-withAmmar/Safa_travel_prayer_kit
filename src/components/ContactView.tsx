import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle } from 'lucide-react';

interface ContactViewProps {
  onSubmitInquiry: (payload: {
    fullName: string;
    contact: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<void>;
}

export function ContactView({ onSubmitInquiry }: ContactViewProps) {
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Package Recommendation');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);
    setSubmitting(true);
    try {
      await onSubmitInquiry({ fullName, contact, email, subject, message });
      setSent(true);
      setFullName('');
      setContact('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-2xl mb-10 space-y-2.5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
          Customer Care · Pakistan
        </p>
        <h1 className="font-display text-[36px] sm:text-[46px] font-semibold text-[#173F35]">
          Contact SAFA
        </h1>
        <p className="text-[15px] text-[#5A5D5A] leading-relaxed">
          Questions about package tiers, corporate or wedding gifting, or an active order? Reach
          our team directly on WhatsApp or send an inquiry below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Channels */}
        <div className="lg:col-span-5 space-y-5">
          <div className="safa-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              Direct Channels
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#173F35] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#173F35]">WhatsApp Support</p>
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5A5D5A] hover:underline"
                  >
                    +92 300 1234567 (Mon–Sat, 10 AM – 8 PM PKT)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#173F35] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#173F35]">Business Email</p>
                  <a
                    href="mailto:care@safaprayerkits.pk"
                    className="text-[#5A5D5A] hover:underline"
                  >
                    care@safaprayerkits.pk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#173F35] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#173F35]">Delivery Coverage</p>
                  <p className="text-[#5A5D5A]">
                    Nationwide courier delivery across Lahore, Karachi, Islamabad, Rawalpindi,
                    Faisalabad, Multan, Peshawar, and all major cities in Pakistan.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center gap-4 text-sm" style={{ borderColor: 'var(--safa-border)' }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#173F35] underline underline-offset-4"
              >
                Instagram (@safaprayerkits)
              </a>
              <span aria-hidden="true" className="text-[#5A5D5A]">
                ·
              </span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#173F35] underline underline-offset-4"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Customer Inquiry Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="safa-card rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              Send an Inquiry
            </h2>

            {sent && (
              <div
                role="status"
                className="rounded-xl p-4 bg-[#173F35]/10 border border-[#173F35]/20 text-sm text-[#173F35] flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Your inquiry has been received. Our team will respond shortly.</span>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl p-3.5 bg-red-50 border border-red-200 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inq-name" className="block text-xs font-semibold mb-1.5">
                  Full Name *
                </label>
                <input
                  id="inq-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
              <div>
                <label htmlFor="inq-contact" className="block text-xs font-semibold mb-1.5">
                  Phone / WhatsApp Number *
                </label>
                <input
                  id="inq-contact"
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inq-email" className="block text-xs font-semibold mb-1.5">
                  Email Address
                </label>
                <input
                  id="inq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
              <div>
                <label htmlFor="inq-subject" className="block text-xs font-semibold mb-1.5">
                  Topic
                </label>
                <select
                  id="inq-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                >
                  <option value="Package Recommendation">Package Recommendation</option>
                  <option value="Order Status / Tracking">Order Status / Tracking</option>
                  <option value="Bulk / Corporate / Wedding Gifting">
                    Bulk / Corporate / Wedding Gifting
                  </option>
                  <option value="Return or Exchange Support">Return or Exchange Support</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="inq-message" className="block text-xs font-semibold mb-1.5">
                Message *
              </label>
              <textarea
                id="inq-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you choose or track your SAFA travel prayer kit?"
                className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white"
                style={{ borderColor: 'var(--safa-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="safa-btn-primary px-6 py-3 text-sm cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              {submitting ? 'Sending Inquiry...' : 'Send Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
