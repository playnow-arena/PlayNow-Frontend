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
            <h2 className="text-xl font-bold text-white">1. User Responsibilities</h2>
            <p>
              Users are responsible for providing accurate and updated account information. You agree to behave respectfully to other sports players and venue staff while participating in hosted matches and bookings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Booking Rules</h2>
            <p>
              All bookings are subject to venue availability and scheduling rules. Confirmations are only final once payments are successfully verified. Cancellations are subject to the specific venue's cancellation and refund guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Platform Usage</h2>
            <p>
              PlayNow grants you a personal, non-exclusive, non-transferable license to access our platform for sports match organizing and venue discovery. Any unauthorized scripting, scraping, or misuse is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Disclaimer</h2>
            <p>
              PlayNow is not responsible for injuries, cancellations, scheduling conflicts, or disputes arising between players and venue owners during offline games. All sports activities are participated in at the user's own risk.
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
