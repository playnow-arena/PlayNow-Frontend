import React from 'react';
import { motion } from 'framer-motion';

const quotes = [
  {
    text: "Play with passion, win with discipline.",
    sport: "Cricket",
    author: "Inspired by Sachin Tendulkar",
  },
  {
    text: "Every match is a new opportunity to prove yourself.",
    sport: "Badminton",
    author: "Inspired by P. V. Sindhu",
  },
  {
    text: "Train hard, play harder. The ground never lies.",
    sport: "Football",
    author: "Inspired by Sunil Chhetri",
  },
  {
    text: "Finishing is an art — calm mind, clear eyes, sharp instinct.",
    sport: "Cricket",
    author: "Inspired by M. S. Dhoni",
  },
  {
    text: "The harder you work, the luckier you get.",
    sport: "Badminton",
    author: "Inspired by Saina Nehwal",
  },
  {
    text: "Winning isn't everything, but wanting to win is.",
    sport: "Football",
    author: "Inspired by Bhaichung Bhutia",
  },
  {
    text: "Don't play for the crowd. Play for the love of the game.",
    sport: "Football",
    author: "Inspired by Ronaldo",
  },
  {
    text: "The more difficult the victory, the greater the happiness in winning.",
    sport: "Football",
    author: "Inspired by Pelé",
  },
  {
    text: "You have to fight to reach your dream. You have to sacrifice.",
    sport: "Football",
    author: "Inspired by Lionel Messi",
  },
  {
    text: "Pressure is a privilege — it comes to those who earn it.",
    sport: "Tennis",
    author: "Inspired by Billie Jean King",
  },
  {
    text: "It's not about how hard you hit. It's about how hard you can get hit and keep moving.",
    sport: "Boxing",
    author: "Inspired by Muhammad Ali",
  },
  {
    text: "Stay calm, trust your training, and back yourself.",
    sport: "Cricket",
    author: "Inspired by Virat Kohli",
  },
  {
    text: "Speed isn't just in the legs — it's in the mind.",
    sport: "Athletics",
    author: "Inspired by Usain Bolt",
  },
  {
    text: "Great players are made in practice. Legends are made under pressure.",
    sport: "Badminton",
    author: "Inspired by Kidambi Srikanth",
  },
  {
    text: "Every setback is a setup for a comeback. Keep going.",
    sport: "Cricket",
    author: "Inspired by Rohit Sharma",
  },
  {
    text: "The body achieves what the mind believes.",
    sport: "Football",
    author: "Inspired by Zlatan Ibrahimović",
  },
  {
    text: "Be fearless. Fail forward. Play with joy.",
    sport: "Athletics",
    author: "Inspired by P. T. Usha",
  },
  {
    text: "One good session can change your mindset for the whole week.",
    sport: "Badminton",
    author: "Inspired by Gopichand",
  },
];

const QuotesSlider = () => {
  // Duplicate for seamless infinite loop
  const loopQuotes = [...quotes, ...quotes];

  return (
    <section
      className="relative overflow-hidden py-14 bg-[#0a0f1c] border-y border-white/5"
      aria-label="Inspirational quotes slider"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#0a0f1c] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#0a0f1c] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 150, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {loopQuotes.map((q, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 mx-4"
            style={{ width: '320px' }}
          >
            <div className="h-full bg-[#151b2b] border border-[#39FF14]/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              {/* Sport tag */}
              <span className="text-xs font-bold uppercase tracking-widest text-[#39FF14] mb-3 block">
                {q.sport}
              </span>
              {/* Quote text */}
              <p className="text-white font-semibold text-base leading-relaxed flex-1">
                &ldquo;{q.text}&rdquo;
              </p>
              {/* Attribution */}
              <p className="text-gray-500 text-xs mt-4 italic">
                — {q.author}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default QuotesSlider;
