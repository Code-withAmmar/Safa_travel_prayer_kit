import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923001234567?text=Assalam-o-Alaikum%20SAFA%2C%20I%20need%20help%20choosing%20a%20Travel%20Prayer%20Kit."
      target="_blank"
      rel="noreferrer"
      title="Chat with SAFA Support on WhatsApp"
      aria-label="Chat with SAFA support on WhatsApp"
      className="fixed bottom-4 right-4 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: '#1E6B52' }}
    >
      <MessageCircle className="w-5 h-5" aria-hidden="true" />
    </a>
  );
}
