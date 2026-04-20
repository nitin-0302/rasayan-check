import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { EVENTS } from '../constants/events';
import { Shield, Users, Calendar, Filter, Download, Search } from 'lucide-react';

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [serverHealth, setServerHealth] = useState<{ status: string } | null>(null);

  useEffect(() => {
    // Check server health
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerHealth(data);
        } else {
          setServerHealth({ status: 'offline' });
        }
      } catch {
        setServerHealth({ status: 'offline' });
      }
    };
    checkHealth();

    if (isAdmin) {
      const fetchAll = async () => {
        const q = query(collection(db, 'registrations'), orderBy('registrationTime', 'desc'));
        const snap = await getDocs(q);
        setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      };
      fetchAll();
    }
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 text-center text-red-500 font-bold">
        Access Denied. Admins Only.
      </div>
    );
  }

  const filtered = registrations.filter(r => {
    const matchesEvent = !filter || r.eventIds.includes(filter);
    const matchesSearch = !searchTerm || 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.college.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name", "Email", "Phone", "College", "Events", "Time"].join(",") + "\n"
      + filtered.map(r => [
          r.userName, 
          r.userEmail, 
          r.phone, 
          r.college, 
          r.eventIds.join(" | "), 
          r.registrationTime
        ].join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rasayan_registrations.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="pt-24 pb-20 bg-bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif text-brand-dark flex items-center gap-3">
              <Shield className="text-amber-600" />
              Admin Command Center
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="text-text-muted">Managing {registrations.length} registrations.</p>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                serverHealth?.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  serverHealth?.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                Server: {serverHealth?.status || 'checking...'}
              </div>
            </div>
          </div>
          <button onClick={exportData} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-brand-soft p-3 rounded-2xl"><Users className="text-brand-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">{registrations.length}</p>
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Participants</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl"><Calendar className="text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">{EVENTS.length}</p>
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Events</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl"><Shield className="text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-brand-dark">Admin</p>
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Logged in</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 md:p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="input-field pl-12"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-primary shrink-0" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="flex-1 md:w-auto px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-primary transition-all text-sm font-medium"
            >
              <option value="">All Events</option>
              {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table/List */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-text-muted tracking-widest">Participant</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-text-muted tracking-widest">College</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-text-muted tracking-widest">Events</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-text-muted tracking-widest">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-brand-soft/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-brand-dark group-hover:text-brand-primary transition-colors">{reg.userName}</div>
                      <div className="text-xs text-text-muted">{reg.userEmail}</div>
                      <div className="text-xs text-text-muted">{reg.phone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-text-main">{reg.college}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {reg.eventIds.map((eid: string) => {
                          const event = EVENTS.find(e => e.id === eid);
                          const members = reg.teamDetails?.[eid];
                          return (
                            <div key={eid} className="group/item relative">
                              <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-brand-primary border border-brand-primary/10 shadow-sm cursor-help">
                                {event?.name}
                                {members && <span className="ml-1 text-amber-600">({members.length})</span>}
                              </span>
                              {members && (
                                <div className="absolute bottom-full left-0 mb-2 invisible group-hover/item:visible bg-brand-dark text-white text-[10px] p-2 rounded-lg shadow-xl z-10 w-40">
                                  <p className="font-bold border-b border-white/20 mb-1 pb-1 uppercase tracking-wider">Team Members</p>
                                  {members.map((m: string, i: number) => (
                                    <div key={i} className="truncate">• {m || 'Unnamed'}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-mono text-text-muted">
                        {new Date(reg.registrationTime).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-text-muted italic">No matching registrations found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
