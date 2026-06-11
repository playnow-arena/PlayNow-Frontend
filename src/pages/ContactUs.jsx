import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'playnowsupport@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+91 93637 56533',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Trichy, Tamil Nadu',
  },
];

const ContactUs = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Contact PlayNow
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            For venue partnership, booking support, or payment issues, contact PlayNow.
          </p>
        </div>

        <div className="bg-[#151b2b] border border-white/5 rounded-3xl p-6 md:p-10">
          <h2 className="text-2xl font-black text-white mb-6">PlayNow Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactItems.map((item) => (
              <div key={item.label} className="bg-[#0a0f1c] border border-gray-800 rounded-2xl p-5">
                <item.icon className="text-[#39FF14] mb-4" size={24} />
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
                <p className="text-white font-bold mt-2 break-words">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-5 text-gray-200">
            We usually help with booking proof, venue directions, balance payment questions, cancellations, and venue onboarding.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
