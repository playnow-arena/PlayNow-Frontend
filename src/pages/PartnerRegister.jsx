import React, { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, Plus, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { normalizeSportTypes } from '../utils/sports';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

const sportOptions = ['Badminton', 'Pickleball', 'Cricket', 'Football', 'Tennis', 'Basketball', 'Table Tennis'];
const courtTypeOptions = ['Badminton', 'Football Turf', 'Cricket Nets', 'Box Cricket', 'Tennis', 'Pickleball', 'Basketball', 'Volleyball', 'Table Tennis', 'Other'];
const indianMobileRegex = /^(?:\+91)?[6-9]\d{9}$/;

const emptyCourtGroup = {
  name: '',
  sports: [],
  courtCount: '1',
  pricePerHour: '',
  courtType: 'Badminton',
  customCourtType: '',
  isActive: true,
};

const initialFormData = {
  ownerName: '',
  phone: '',
  email: '',
  venueName: '',
  address: '',
  city: '',
  area: '',
  landmark: '',
  managerName: '',
  managerPhone: '',
  managerWhatsapp: '',
  inchargeName: '',
  inchargePhone: '',
  inchargeWhatsapp: '',
  courtGroups: [{ ...emptyCourtGroup }],
};

const normalizeIndianMobile = (value) => {
  const trimmedValue = String(value || '').trim().replace(/\s+/g, '');
  if (!trimmedValue) return '';
  const digits = trimmedValue.replace(/\D/g, '');
  const mobileDigits = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return mobileDigits.length === 10 ? `+91${mobileDigits}` : trimmedValue;
};

const isValidIndianMobile = (value) => {
  const trimmedValue = String(value || '').trim().replace(/\s+/g, '');
  return indianMobileRegex.test(trimmedValue);
};

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    {children}
  </div>
);

const inputClass = 'w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-[#39FF14] transition-all placeholder:text-gray-700';

const PartnerRegister = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedVenueName, setSubmittedVenueName] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updateCourtGroup = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      courtGroups: current.courtGroups.map((group, groupIndex) => (
        groupIndex === index ? { ...group, [field]: value } : group
      )),
    }));
  };

  const toggleSport = (index, sport) => {
    setFormData((current) => ({
      ...current,
      courtGroups: current.courtGroups.map((group, groupIndex) => {
        if (groupIndex !== index) return group;
        const sports = group.sports.includes(sport)
          ? group.sports.filter((item) => item !== sport)
          : [...group.sports, sport];
        return { ...group, sports };
      }),
    }));
  };

  const addCourtGroup = () => {
    setFormData((current) => ({
      ...current,
      courtGroups: [...current.courtGroups, { ...emptyCourtGroup }],
    }));
  };

  const removeCourtGroup = (index) => {
    setFormData((current) => ({
      ...current,
      courtGroups: current.courtGroups.length === 1
        ? current.courtGroups
        : current.courtGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
  };

  const buildPayload = () => {
    const courtGroups = formData.courtGroups
      .map((group) => ({
        name: group.name.trim(),
        sports: normalizeSportTypes(group.sports),
        courtCount: Number(group.courtCount) || 1,
        pricePerHour: Number(group.pricePerHour) || 0,
        courtType: (group.courtType === 'Other' ? group.customCourtType : group.courtType).trim() || 'Standard',
        isActive: true,
      }))
      .filter((group) => group.name && group.sports.length && group.pricePerHour > 0);

    return {
      ownerName: formData.ownerName,
      phone: normalizeIndianMobile(formData.phone),
      email: formData.email,
      venueName: formData.venueName,
      address: formData.address,
      city: formData.city,
      area: formData.area,
      landmark: formData.landmark,
      sportTypes: [...new Set(courtGroups.flatMap((group) => group.sports))],
      pricePerHour: courtGroups.length ? Math.min(...courtGroups.map((group) => group.pricePerHour)) : undefined,
      contacts: {
        owner: {
          name: formData.ownerName,
          phone: normalizeIndianMobile(formData.phone),
          email: formData.email,
        },
        manager: {
          name: formData.managerName,
          phone: normalizeIndianMobile(formData.managerPhone),
          whatsapp: normalizeIndianMobile(formData.managerWhatsapp),
        },
        incharge: {
          name: formData.inchargeName,
          phone: normalizeIndianMobile(formData.inchargePhone),
          whatsapp: normalizeIndianMobile(formData.inchargeWhatsapp),
        },
      },
      courtGroups,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const phoneFields = [
      formData.phone,
      formData.managerPhone,
      formData.managerWhatsapp,
      formData.inchargePhone,
      formData.inchargeWhatsapp,
    ].filter(Boolean);

    if (!isValidIndianMobile(formData.phone) || phoneFields.some((phone) => !isValidIndianMobile(phone))) {
      setSubmitError('Enter valid Indian mobile number');
      return;
    }

    const missingCustomCourtType = formData.courtGroups.some((group) => (
      group.courtType === 'Other' && !group.customCourtType.trim()
    ));
    if (missingCustomCourtType) {
      setSubmitError('Please enter custom court type for Other.');
      return;
    }

    const payload = buildPayload();
    if (!payload.courtGroups.length) {
      setSubmitError('Please add at least one court group with sport and price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/owner-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Unable to submit request. Please try again.');
        return;
      }

      setSubmittedVenueName(formData.venueName);
      setFormData(initialFormData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Owner request submit failed:', error);
      setSubmitError('Unable to submit request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-[#0a0f1c]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#151b2b] border border-gray-800 rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-[#39FF14]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-[#39FF14]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4">Request Submitted!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Thank you for registering <span className="text-white font-bold">{submittedVenueName}</span>. Our admin team will review your venue details.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#151b2b] border border-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0a0f1c]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase"
          >
            Partner with <span className="text-[#39FF14]">PlayNow</span>
          </motion.h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium uppercase tracking-widest">Share your real venue and court details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <User size={120} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Owner / Applicant Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Applicant name">
                <input required value={formData.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} placeholder="Owner or applicant name" className={inputClass} />
              </Field>
              <Field label="Applicant phone">
                <input required value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="98765 43210" className={inputClass} />
              </Field>
              <Field label="Applicant email">
                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="owner@example.com" className={inputClass} />
              </Field>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <Building2 size={120} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Venue Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Venue name">
                <input required value={formData.venueName} onChange={(e) => updateField('venueName', e.target.value)} placeholder="Aruna Sports Arena" className={inputClass} />
              </Field>
              <Field label="City">
                <input required value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Trichy" className={inputClass} />
              </Field>
              <Field label="Area">
                <input required value={formData.area} onChange={(e) => updateField('area', e.target.value)} placeholder="Thillai Nagar" className={inputClass} />
              </Field>
              <Field label="Landmark">
                <input value={formData.landmark} onChange={(e) => updateField('landmark', e.target.value)} placeholder="Near main bus stand" className={inputClass} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Full address">
                  <textarea required value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Full venue address" className={`${inputClass} h-28 resize-none`} />
                </Field>
              </div>
            </div>
          </motion.section>

          <section className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl">
            <h3 className="text-lg md:text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Operational Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <Field label="Manager name">
                <input value={formData.managerName} onChange={(e) => updateField('managerName', e.target.value)} placeholder="Manager name" className={inputClass} />
              </Field>
              <Field label="Manager phone">
                <input value={formData.managerPhone} onChange={(e) => updateField('managerPhone', e.target.value)} placeholder="Manager phone" className={inputClass} />
              </Field>
              <Field label="Manager WhatsApp">
                <input value={formData.managerWhatsapp} onChange={(e) => updateField('managerWhatsapp', e.target.value)} placeholder="WhatsApp number" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Incharge name">
                <input value={formData.inchargeName} onChange={(e) => updateField('inchargeName', e.target.value)} placeholder="Incharge name" className={inputClass} />
              </Field>
              <Field label="Incharge phone">
                <input value={formData.inchargePhone} onChange={(e) => updateField('inchargePhone', e.target.value)} placeholder="Incharge phone" className={inputClass} />
              </Field>
              <Field label="Incharge WhatsApp">
                <input value={formData.inchargeWhatsapp} onChange={(e) => updateField('inchargeWhatsapp', e.target.value)} placeholder="WhatsApp number" className={inputClass} />
              </Field>
            </div>
          </section>

          <section className="bg-[#151b2b] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full" /> Court Groups
              </h3>
              <button type="button" onClick={addCourtGroup} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-4 py-3 text-sm font-black text-black">
                <Plus size={16} /> Add Group
              </button>
            </div>

            <div className="space-y-5">
              {formData.courtGroups.map((group, index) => (
                <div key={`court-group-${index}`} className="rounded-2xl border border-gray-800 bg-[#0a0f1c] p-5">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <p className="font-black text-white">Court Group {index + 1}</p>
                    <button type="button" onClick={() => removeCourtGroup(index)} disabled={formData.courtGroups.length === 1} className="rounded-xl border border-red-500/30 px-3 py-2 text-red-400 disabled:opacity-40">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Group name">
                      <input required value={group.name} onChange={(e) => updateCourtGroup(index, 'name', e.target.value)} placeholder="Badminton Block" className={inputClass} />
                    </Field>
                    <Field label="Court type">
                      <select
                        value={group.courtType}
                        onChange={(e) => updateCourtGroup(index, 'courtType', e.target.value)}
                        className={inputClass}
                      >
                        {courtTypeOptions.map((courtType) => (
                          <option key={courtType} value={courtType}>{courtType}</option>
                        ))}
                      </select>
                    </Field>
                    {group.courtType === 'Other' && (
                      <Field label="Custom court type">
                        <input required value={group.customCourtType} onChange={(e) => updateCourtGroup(index, 'customCourtType', e.target.value)} placeholder="Enter court type" className={inputClass} />
                      </Field>
                    )}
                    <Field label="Court count">
                      <input required type="number" min="1" value={group.courtCount} onChange={(e) => updateCourtGroup(index, 'courtCount', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Price per hour">
                      <input required type="number" min="0" value={group.pricePerHour} onChange={(e) => updateCourtGroup(index, 'pricePerHour', e.target.value)} placeholder="400" className={inputClass} />
                    </Field>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Supported sports</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sportOptions.map((sport) => (
                          <button
                            key={sport}
                            type="button"
                            onClick={() => toggleSport(index, sport)}
                            className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${group.sports.includes(sport) ? 'border-[#39FF14] bg-[#39FF14] text-black' : 'border-gray-800 bg-black/30 text-gray-400'}`}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-2xl px-5 py-4 text-sm font-bold">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#39FF14] text-black font-black py-5 md:py-6 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-[#32E612] transition-all shadow-xl uppercase tracking-[0.3em] text-sm btn-touch disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'} {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="mt-10 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">
          Already a partner? <Link to="/partner/login" className="text-[#39FF14] hover:underline">Login to Portal</Link>
        </p>
      </div>
    </div>
  );
};

export default PartnerRegister;
