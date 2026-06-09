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
            <h2 className="text-xl font-bold text-white">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. booking a venue).</li>
              <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>
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
