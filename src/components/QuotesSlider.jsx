import React from 'react';

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

const championQuotes = [
  { author: 'Sachin Tendulkar', text: 'Greatness starts with showing up every day.' },
  { author: 'P. V. Sindhu', text: 'Discipline turns practice into progress.' },
  { author: 'M. S. Dhoni', text: 'Stay calm, trust the game, finish strong.' },
  { author: 'Virat Kohli', text: 'Fitness, focus, and fire build champions.' },
  { author: 'Mary Kom', text: 'Courage grows when you refuse to quit.' },
  { author: 'Neeraj Chopra', text: 'One strong throw begins with daily effort.' },
];

const QuotesSlider = () => {
  // Duplicate for seamless infinite loop
  const loopQuotes = [...championQuotes, ...championQuotes];

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0f1c] py-10 md:py-14"
      aria-label="Inspirational quotes slider"
    >
      <div className="relative z-20 px-5 text-center sm:px-8">
        <h2 className="text-2xl font-black uppercase md:text-3xl">Inspired by Champions</h2>
        <p className="mt-2 text-sm font-medium text-gray-400 md:text-base">
          Small words. Big motivation to play today.
        </p>
      </div>

      <div className="absolute bottom-0 left-0 top-24 z-10 w-12 bg-gradient-to-r from-[#0a0f1c] to-transparent pointer-events-none sm:w-24" />
      <div className="absolute bottom-0 right-0 top-24 z-10 w-12 bg-gradient-to-l from-[#0a0f1c] to-transparent pointer-events-none sm:w-24" />

      <div className="quotes-marquee mt-8 flex w-max">
        {loopQuotes.map((q, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 mx-2.5 w-[280px] sm:w-[320px]"
          >
            <div className="h-full min-h-44 bg-[#151b2b] border border-[#39FF14]/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              {/* Quote text */}
              <p className="text-white font-semibold text-base leading-relaxed flex-1">
                &ldquo;{q.text}&rdquo;
              </p>
              {/* Attribution */}
              <p className="text-[#39FF14] text-xs mt-5 font-black uppercase tracking-widest">
                {q.author}
              </p>
              <p className="hidden">
                — {q.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuotesSlider;
