import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 bg-[#151b2b] p-8 md:p-12 rounded-3xl border border-white/5 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">
          Terms & <span className="text-[#39FF14]">Conditions</span>
        </h1>
        
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using PlayNow, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the materials (information or software) on PlayNow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Bookings and Payments</h2>
            <p>
              All venue bookings made through the platform are subject to availability. Payments must be completed successfully before a booking is confirmed. Cancellations and refunds are subject to the specific venue's policy.
            </p>
          </section>

          <p className="pt-8 text-sm italic text-gray-500">
            Note: This is a placeholder Terms and Conditions document for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
