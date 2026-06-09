import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 bg-[#151b2b] p-8 md:p-12 rounded-3xl border border-white/5 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
          Privacy <span className="text-[#39FF14]">Policy</span>
        </h1>
        
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>
              Welcome to PlayNow. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Data Collection</h2>
            <p>
              We collect information that helps us deliver and improve our venue booking and matchmaking platform:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li><strong>Identity Info:</strong> First name, last name, username, or similar identifier.</li>
              <li><strong>Contact Info:</strong> Email address, phone number, and account credentials.</li>
              <li><strong>Technical Data:</strong> IP address, login sessions, browser details, and device characteristics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Privacy Statement</h2>
            <p>
              Your data is stored securely and is only used to facilitate match hosting, coordinate bookings with venue owners, and communicate updates about your profile. We do not sell or lease your personal data to third-party advertisers or marketers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Contact Information</h2>
            <p>
              If you have any questions or feedback regarding our privacy guidelines, please reach out to us at <span className="text-[#39FF14]">support@playnow.in</span>.
            </p>
          </section>

          <p className="pt-8 text-sm italic text-gray-500">
            Note: This is a placeholder privacy policy for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
