import React from 'react';

const sections = [
  {
    title: 'Booking Confirmation',
    text: 'Your booking is confirmed after PlayNow creates a booking ID and shows the confirmation screen. Show the booking proof at the venue before play.',
  },
  {
    title: 'Advance Payment Policy',
    text: 'Some bookings may require an advance payment online. The advance confirms your slot and is adjusted against the total booking amount.',
  },
  {
    title: 'Balance Payment at Venue',
    text: 'If any balance amount is pending, pay it directly at the venue before play. Venue staff may verify your booking ID and payment status.',
  },
  {
    title: 'Cancellation Policy',
    text: 'Cancellation is allowed up to 4 hours before the slot start time. After that, cancellation may not be available because the venue has reserved the slot for you.',
  },
  {
    title: 'Refunds and Adjustments',
    text: 'Refunds or payment adjustments are subject to PlayNow and venue verification until online refunds are automated.',
  },
  {
    title: 'No-show Policy',
    text: 'If you do not arrive for your booked slot and do not cancel in time, the booking may be treated as used and payments may not be refundable.',
  },
  {
    title: 'Venue Rules',
    text: 'Players must follow venue rules, timing instructions, footwear requirements, and staff guidance. Play safely and respect other players.',
  },
  {
    title: 'Contact Support',
    text: 'For booking support, venue partnership, or payment issues, contact PlayNow at playnowarena@gmail.com or +91 78712 56533.',
  },
];

const TermsAndConditions = () => {
  return (
    <div className="pt-24 pb-20 px-4 md:pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Terms & Cancellation Policy
          </h1>
          <p className="text-gray-400 mt-3">
            Simple rules for PlayNow bookings, payments, cancellations, and venue play.
          </p>
        </div>

        <div className="bg-[#151b2b] border border-white/5 rounded-3xl p-6 md:p-10 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-white/5 last:border-b-0 pb-5 last:pb-0">
              <h2 className="text-lg md:text-xl font-black text-white mb-2">{section.title}</h2>
              <p className="text-gray-400 leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
