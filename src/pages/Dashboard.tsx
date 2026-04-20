import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { EVENTS } from '../constants/events';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, Award, Gamepad2, Settings, User as UserIcon, Check } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', college: '', phone: '' });
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const fetchRegs = async () => {
        const q = query(collection(db, 'registrations'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      };
      fetchRegs();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm(prev => {
        if (prev.name === profile.name && prev.college === profile.college && prev.phone === profile.phone) {
          return prev;
        }
        return { 
          name: profile.name || '', 
          college: profile.college || '', 
          phone: profile.phone || '' 
        };
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), editForm);
    setEditing(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {location.state?.registered && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-emerald-600 text-white rounded-[2rem] flex items-center gap-4 shadow-xl shadow-emerald-600/20"
          >
            <Sparkles className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">Success! Registration Complete.</p>
              <p className="opacity-80">Welcome to the elemental reaction. Your dashboard is now active.</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-[2.5rem] sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-soft p-4 rounded-3xl">
                  <UserIcon className="text-brand-primary w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">{profile?.name}</h2>
                  <p className="text-text-muted text-sm">{profile?.email}</p>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <input
                    className="input-field"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                  />
                  <input
                    className="input-field"
                    value={editForm.college}
                    onChange={e => setEditForm(prev => ({ ...prev, college: e.target.value }))}
                    placeholder="College"
                  />
                  <input
                    className="input-field"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary py-2 px-4 flex-1">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary py-2 px-4">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary mb-1">Affiliation</p>
                    <p className="text-brand-dark font-medium">{profile?.college || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary mb-1">Contact</p>
                    <p className="text-brand-dark font-medium">{profile?.phone || 'Not specified'}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-dark transition-colors">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}

              {registrations.length > 0 && (
                <Link
                  to="/quiz"
                  className="mt-10 btn-primary w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Play Chemistry Quiz
                </Link>
              )}
            </div>
          </div>

          {/* Registrations List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-serif text-brand-dark mb-8">My Event Arena</h2>
            
            {registrations.length === 0 ? (
              <div className="glass-card p-12 rounded-[3rem] text-center">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-brand-dark mb-2">No Registrations Yet</h3>
                <p className="text-text-muted mb-8">You haven't registered for any events yet. Science awaits you!</p>
                <Link to="/register" className="btn-primary">Register Now</Link>
              </div>
            ) : (
              registrations.map((reg) => (
                <div key={reg.id} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Award className="w-32 h-32 text-brand-dark" />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800 mb-4 font-serif">Registration Details</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {reg.eventIds.map((eid: string) => {
                          const evt = EVENTS.find(e => e.id === eid);
                          return (
                            <span key={eid} className="bg-brand-soft text-brand-primary border border-brand-primary/10 text-xs px-4 py-1.5 rounded-full font-bold">
                              {evt?.name}
                            </span>
                          );
                        })}
                      </div>
                      <div className="p-4 bg-white/50 rounded-2xl border border-white italic text-brand-primary text-sm shadow-inner">
                        "{reg.confirmationMessage}"
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Registered On</p>
                      <p className="text-lg font-bold text-brand-dark">{new Date(reg.registrationTime).toLocaleDateString()}</p>
                      <div className="mt-4 p-2 bg-emerald-100 rounded-xl inline-flex items-center gap-2 self-end">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 uppercase">Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
