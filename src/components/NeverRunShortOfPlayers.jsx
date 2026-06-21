import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const NeverRunShortOfPlayers = () => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className="relative overflow-hidden rounded-3xl border border-[#39FF14]/25 bg-gradient-to-br from-[#172238] via-[#111827] to-[#0d1422] px-5 py-10 sm:px-10 md:px-16 md:py-14 text-center shadow-2xl"
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#39FF14] to-transparent opacity-80" />

    <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#39FF14]/30 bg-[#39FF14]/10 text-[#39FF14] shadow-[0_0_24px_rgba(57,255,20,0.12)]">
          <Users size={28} />
        </div>
        <div className="-ml-2 mt-8 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#151b2b] text-white shadow-lg">
          <UserPlus size={17} />
        </div>
      </div>

      <h2 className="text-2xl font-black uppercase leading-tight sm:text-3xl md:text-4xl">
        Never Run Short of Players
      </h2>
      <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-gray-300 sm:text-base md:text-lg">
        Post your game on PlayNow and get players from across your neighbourhood to join and make your game happen.
      </p>

      <Link
        to="/host-match"
        className="btn-touch mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#39FF14] px-8 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[0_0_24px_rgba(57,255,20,0.3)] transition-all hover:scale-105 hover:bg-[#32E612] sm:w-auto"
      >
        Host a Match
        <ArrowRight size={17} />
      </Link>
    </div>
  </motion.section>
);

export default NeverRunShortOfPlayers;
