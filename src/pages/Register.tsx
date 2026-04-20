import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EVENTS } from '../constants/events';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ClipboardList, Send, AlertCircle } from 'lucide-react';

export default function Register() {
  const { user, profile, login, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [teamDetails, setTeamDetails] = useState<{[key: string]: string[]}>({});
  const [phone, setPhone] = useState(profile?.phone || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => {
      const exists = prev.includes(id);
      if (exists) {
        const newDetails = { ...teamDetails };
        delete newDetails[id];
        setTeamDetails(newDetails);
        return prev.filter(e => e !== id);
      } else {
        const event = EVENTS.find(e => e.id === id);
        if (event?.isTeam) {
          const size = event.maxTeamSize || 1;
          setTeamDetails({ ...teamDetails, [id]: Array(size).fill('').map((_, i) => i === 0 ? (profile?.name || user?.displayName || '') : '') });
        }
        return [...prev, id];
      }
    });
  };

  const updateTeamMember = (eventId: string, index: number, value: string) => {
    setTeamDetails(prev => ({
      ...prev,
      [eventId]: prev[eventId].map((m, i) => i === index ? value : m)
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedEvents.length === 0) return;
    if (phone.length !== 10) return;

    setSubmitting(true);
    try {
      // Update user profile with phone and college if changed
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        college
      });

      const uniqueMessages = [
        "Welcome to the elemental storm! Your registration is a confirmed catalytic reaction.",
        "Quantum registration achieved! Your presence in Rasayan is now inevitable.",
        "Your participation is the missing element we needed for equilibrium.",
        "The bonds are formed! See you at the epicenter of chemistry.",
        "Reaction started! Your registration flux is now stable."
      ];
      const randomMsg = uniqueMessages[Math.floor(Math.random() * uniqueMessages.length)];

      const registrationData = {
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.name || user.displayName,
        eventIds: selectedEvents,
        teamDetails,
        phone,
        college,
        confirmationMessage: randomMsg,
        registrationTime: new Date().toISOString()
      };

      await addDoc(collection(db, 'registrations'), registrationData);

      navigate('/dashboard', { state: { registered: true } });
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center">
        <div className="glass-card p-12 rounded-[2.5rem]">
          <div className="bg-brand-soft w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="text-brand-primary w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif text-brand-dark mb-4">Authentication Required</h2>
          <p className="text-text-muted mb-8">Please sign in to access the multi-event registration system.</p>
          <button 
            onClick={login} 
            disabled={isAuthenticating}
            className="btn-primary w-full py-4 text-lg disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {isAuthenticating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In with Google'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-bg-paper">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-serif text-brand-dark mb-2">Registration Portal</h1>
            <p className="text-text-muted">Step {step} of 2</p>
          </div>
          <div className="flex gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all ${step === s ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 rounded-[2rem]">
                  <h2 className="text-2xl font-serif text-brand-dark mb-6 flex items-center gap-2">
                    <ClipboardList className="text-brand-primary" />
                    Select Your Events
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {EVENTS.map(event => (
                      <div
                        key={event.id}
                        onClick={() => toggleEvent(event.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          selectedEvents.includes(event.id)
                            ? 'bg-brand-soft border-brand-primary shadow-inner'
                            : 'bg-white border-transparent hover:border-brand-soft shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedEvents.includes(event.id) ? 'bg-brand-primary text-white' : 'bg-gray-100 text-text-muted'}`}>
                            {selectedEvents.includes(event.id) ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-brand-dark text-sm">{event.name}</p>
                            <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest">{event.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={selectedEvents.length === 0}
                    onClick={() => setStep(2)}
                    className="btn-primary group flex items-center gap-2"
                  >
                    Next Step
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity }}>
                      <Send className="w-4 h-4" />
                    </motion.div>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 rounded-[2rem]">
                  <h2 className="text-2xl font-serif text-brand-dark mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-primary uppercase tracking-widest ml-1">Name</label>
                      <input type="text" value={profile?.name} disabled className="input-field bg-gray-50 opacity-70" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-primary uppercase tracking-widest ml-1">Email</label>
                      <input type="email" value={profile?.email} disabled className="input-field bg-gray-50 opacity-70" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-primary uppercase tracking-widest ml-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setPhone(val);
                        }}
                        placeholder="e.g. 9876543210"
                        className={`input-field ${phone.length > 0 && phone.length < 10 ? 'border-red-300 ring-red-100' : ''}`}
                      />
                      {phone.length > 0 && phone.length < 10 && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">Please enter a valid 10-digit number</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-primary uppercase tracking-widest ml-1">College/Organization</label>
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Enter your college name"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {selectedEvents.some(id => EVENTS.find(e => e.id === id)?.isTeam) && (
                    <div className="space-y-8 pt-8 border-t border-gray-100">
                      <h3 className="text-xl font-serif text-brand-dark">Team Members</h3>
                      {selectedEvents.map(id => {
                        const event = EVENTS.find(e => e.id === id);
                        if (!event?.isTeam) return null;
                        return (
                          <div key={id} className="space-y-4">
                            <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">{event.name} Team</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {teamDetails[id]?.map((member, idx) => (
                                <div key={idx} className="space-y-2">
                                  <label className="text-[10px] font-bold text-text-muted uppercase">Member {idx + 1} {idx === 0 && '(Leader)'}</label>
                                  <input
                                    type="text"
                                    required
                                    value={member}
                                    onChange={(e) => updateTeamMember(id, idx, e.target.value)}
                                    placeholder={`Name of member ${idx + 1}`}
                                    className="input-field"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="glass-card p-8 rounded-[2rem] bg-emerald-900 text-white">
                  <h3 className="text-xl font-serif mb-4">Registration Summary</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedEvents.map(id => (
                      <span key={id} className="bg-white/10 text-xs px-3 py-1 rounded-full">{EVENTS.find(e => e.id === id)?.name}</span>
                    ))}
                  </div>
                  <p className="text-sm opacity-70 italic mb-4">* Please ensure all rules are understood before final submission.</p>
                </div>

                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back to Selection
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? 'Processing...' : 'Complete Registration'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
