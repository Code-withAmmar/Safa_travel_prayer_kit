import { X } from 'lucide-react';
import type { PolicyKey } from './Footer';

interface PolicyModalProps {
  policy: PolicyKey | null;
  onClose: () => void;
}

const POLICY_CONTENT: Record<
  PolicyKey,
  { title: string; sections: Array<{ heading: string; body: string }> }
> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'When you place an order or submit an inquiry with SAFA, we collect your name, contact number, delivery address, city, and optional email address solely to fulfil your order and communicate delivery updates.',
      },
      {
        heading: 'How We Protect Your Data',
        body: 'Customer order information is used exclusively for dispatch, courier coordination, and customer care across Pakistan. SAFA never sells or rents customer contact details to third parties.',
      },
      {
        heading: 'Contact for Privacy Requests',
        body: 'You may request correction or deletion of your customer inquiry or order contact details at any time by emailing care@safaprayerkits.pk.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Product Authenticity & Package Contents',
        body: 'Every SAFA Travel Prayer Kit includes the exact accessories listed for its selected collection (Men’s Beige or Women’s Mauve) and package tier (Elite, Premium, Digital Plus, Digital, or Classic).',
      },
      {
        heading: 'Pricing & Delivery Across Pakistan',
        body: 'All prices are displayed in Pakistani Rupees (PKR). Orders of Rs. 5,000 or more qualify for complimentary nationwide delivery; orders below Rs. 5,000 carry a flat Rs. 250 standard delivery charge.',
      },
      {
        heading: 'Order Confirmation',
        body: 'Cash on Delivery (COD) and Bank Transfer orders are verified via phone or WhatsApp prior to courier handover.',
      },
    ],
  },
  returns: {
    title: 'Return & Exchange Policy',
    sections: [
      {
        heading: '7-Day Inspection & Exchange Window',
        body: 'If your travel prayer kit arrives damaged, incomplete, or with an electronic tasbih defect, contact SAFA within 7 days of delivery with your order reference number for a prompt replacement.',
      },
      {
        heading: 'Eligibility Conditions',
        body: 'Items returned for an exchange must be unused, in their original clear cylindrical canister, with all included accessories (prayer mat, tasbih/counter, 30 ml hand wash, and prayer cap) intact.',
      },
      {
        heading: 'How to Request Support',
        body: 'Message our WhatsApp care team at +92 300 1234567 or email care@safaprayerkits.pk with your SAFA order reference number.',
      },
    ],
  },
};

export function PolicyModal({ policy, onClose }: PolicyModalProps) {
  if (!policy) return null;
  const content = POLICY_CONTENT[policy];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--safa-surface)',
          color: 'var(--safa-ink)',
          border: '1px solid var(--safa-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--safa-border)' }}>
          <h2 id="policy-modal-title" className="font-display text-2xl font-semibold">
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close policy dialog"
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-[var(--safa-surface-alt)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm leading-relaxed text-[var(--safa-ink-muted)]">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="font-sans font-semibold text-[15px] text-[var(--safa-ink)] mb-1">
                {section.heading}
              </h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--safa-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="safa-btn-primary px-5 py-2.5 text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
