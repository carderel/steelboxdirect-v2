import React, { useState, useEffect } from 'react';
import { supabase, type Lead } from '../lib/supabase';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id: string, updates: Partial<Lead>) {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, ...updates });
      }
    } catch (err: any) {
      alert('Error updating lead: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  if (loading) return <div className="admin-loading">Loading leads...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h2>Leads Pipeline</h2>
          <div className="admin-actions">
            <button onClick={fetchLeads} className="btn-small">Refresh</button>
            <button onClick={handleLogout} className="btn-small btn-ghost">Logout</button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="leads-list">
          {leads.length === 0 ? (
            <p className="no-leads">No leads found yet.</p>
          ) : (
            leads.map(lead => (
              <div 
                key={lead.id} 
                className={`lead-card ${selectedLead?.id === lead.id ? 'is-active' : ''} ${lead.status}`}
                onClick={() => setSelectedLead(lead)}
              >
                <div className="lead-card-hd">
                  <span className={`status-dot ${lead.status}`}></span>
                  <span className="lead-name">{lead.name}</span>
                  <span className="lead-score">{lead.lead_score}</span>
                </div>
                <div className="lead-card-meta">
                  <span>{lead.size_preference}</span> · <span>{lead.delivery_zip}</span>
                </div>
                <div className="lead-card-date">
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </aside>

        <main className="lead-detail">
          {selectedLead ? (
            <div className="detail-content">
              <section className="detail-header">
                <div className="detail-title">
                  <h1>{selectedLead.name}</h1>
                  <span className={`badge ${selectedLead.status}`}>{selectedLead.status}</span>
                </div>
                <div className="detail-contact">
                  <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a> · 
                  <a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a>
                </div>
              </section>

              <div className="detail-grid">
                <section className="detail-block">
                  <h3>Decisions</h3>
                  <div className="specs">
                    <div className="spec"><span>Size:</span> <strong>{selectedLead.size_preference}</strong></div>
                    <div className="spec"><span>Condition:</span> <strong>{selectedLead.condition_preference}</strong></div>
                    <div className="spec"><span>Use:</span> <strong>{selectedLead.primary_use}</strong></div>
                    <div className="spec"><span>Timeline:</span> <strong>{selectedLead.timeline}</strong></div>
                  </div>
                </section>

                <section className="detail-block">
                  <h3>Logistics</h3>
                  <div className="specs">
                    <div className="spec"><span>Zip:</span> <strong>{selectedLead.delivery_zip}</strong></div>
                    <div className="spec"><span>Access:</span> <strong>{selectedLead.site_access}</strong></div>
                    <div className="spec"><span>Distance:</span> <strong>{selectedLead.distance_miles || 'Unknown'} mi</strong></div>
                    <div className="spec"><span>In Area:</span> <strong>{selectedLead.in_service_area ? 'Yes' : 'No'}</strong></div>
                  </div>
                </section>

                <section className="detail-block wide">
                  <h3>Buyer Notes</h3>
                  <p className="notes-box">{selectedLead.buyer_notes || 'No notes provided by buyer.'}</p>
                </section>

                <section className="detail-block wide">
                  <h3>Attribution</h3>
                  <div className="attribution-grid">
                    <div className="spec"><span>Source:</span> <strong>{selectedLead.first_touch_source || 'direct'}</strong></div>
                    <div className="spec"><span>Medium:</span> <strong>{selectedLead.first_touch_medium || 'none'}</strong></div>
                    <div className="spec"><span>Landing:</span> <strong>{selectedLead.landing_page || 'unknown'}</strong></div>
                    <div className="spec"><span>Time:</span> <strong>{selectedLead.time_on_site_seconds ? Math.round(selectedLead.time_on_site_seconds / 60) : '?'} min</strong></div>
                  </div>
                </section>

                <section className="detail-block wide admin-edit">
                  <h3>Seller Management</h3>
                  <div className="admin-form">
                    <div className="form-group">
                      <label>Lead Status</label>
                      <select 
                        value={selectedLead.status} 
                        onChange={(e) => updateLeadStatus(selectedLead.id, { status: e.target.value as any })}
                        disabled={saving}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="won">Won (Sale)</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Internal Seller Notes</label>
                      <textarea 
                        defaultValue={selectedLead.seller_notes || ''}
                        onBlur={(e) => updateLeadStatus(selectedLead.id, { seller_notes: e.target.value })}
                        disabled={saving}
                        placeholder="Add internal notes about this lead..."
                        rows={4}
                      />
                    </div>

                    {selectedLead.status === 'won' && (
                      <div className="form-group">
                        <label>Sale Amount ($)</label>
                        <input 
                          type="number"
                          defaultValue={selectedLead.sale_amount || ''}
                          onBlur={(e) => updateLeadStatus(selectedLead.id, { sale_amount: parseFloat(e.target.value) })}
                          disabled={saving}
                        />
                      </div>
                    )}

                    {selectedLead.status === 'lost' && (
                      <div className="form-group">
                        <label>Reason Lost</label>
                        <select 
                          value={selectedLead.lost_reason || ''} 
                          onChange={(e) => updateLeadStatus(selectedLead.id, { lost_reason: e.target.value as any })}
                          disabled={saving}
                        >
                          <option value="">Select reason...</option>
                          <option value="price">Price</option>
                          <option value="timing">Timing</option>
                          <option value="competitor">Competitor</option>
                          <option value="unqualified">Unqualified</option>
                          <option value="no_response">No Response</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20"/></svg>
              <p>Select a lead to view details and manage status.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .admin-dashboard { height: calc(100vh - 60px); display: flex; flex-direction: column; overflow: hidden; background: white; }
        .admin-header { border-bottom: 2px solid var(--ink); padding: 16px 24px; background: var(--cream); }
        .admin-header-inner { display: flex; justify-content: space-between; align-items: center; }
        .admin-header h2 { font-family: var(--narrow); text-transform: uppercase; margin: 0; font-size: 20px; }
        
        .admin-layout { display: flex; flex: 1; overflow: hidden; }
        
        .leads-list { width: 320px; border-right: 2px solid var(--ink); overflow-y: auto; background: var(--cream); }
        .lead-card { padding: 16px 20px; border-bottom: 1.5px solid rgba(11,15,26,.1); cursor: pointer; transition: background .15s; }
        .lead-card:hover { background: rgba(255,211,0,.15); }
        .lead-card.is-active { background: var(--yellow); }
        
        .lead-card-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
        .status-dot.new { background: var(--c3-deliver); }
        .status-dot.contacted { background: var(--c4-cost); }
        .status-dot.won { background: #000; }
        .status-dot.lost { background: var(--c2-cond); }
        
        .lead-name { font-weight: 700; flex: 1; font-family: var(--narrow); text-transform: uppercase; font-size: 15px; }
        .lead-score { font-family: var(--mono); font-size: 10px; padding: 2px 4px; background: rgba(0,0,0,.05); border-radius: 3px; }
        .lead-card-meta { font-size: 12px; opacity: .7; margin-bottom: 2px; }
        .lead-card-date { font-family: var(--mono); font-size: 9px; opacity: .5; }

        .lead-detail { flex: 1; overflow-y: auto; background: white; }
        .detail-content { padding: 48px; max-width: 960px; }
        
        .detail-header { margin-bottom: 40px; }
        .detail-title { display: flex; align-items: baseline; gap: 16px; margin-bottom: 8px; }
        .detail-title h1 { font-family: var(--narrow); text-transform: uppercase; font-size: 40px; margin: 0; }
        .badge { padding: 4px 10px; font-family: var(--mono); font-size: 10px; text-transform: uppercase; font-weight: 700; background: var(--cream); border: 1.5px solid var(--ink); }
        .badge.new { background: var(--c3-deliver); color: white; border-color: var(--c3-deliver); }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .detail-block { border: 1.5px solid var(--ink); padding: 24px; }
        .detail-block.wide { grid-column: 1 / -1; }
        .detail-block h3 { font-family: var(--mono); font-size: 11px; text-transform: uppercase; opacity: .5; margin: 0 0 16px; }
        
        .specs { display: flex; flex-direction: column; gap: 8px; }
        .spec { font-size: 14px; display: flex; justify-content: space-between; }
        .spec span { opacity: .6; font-size: 12px; }
        .notes-box { font-size: 15px; line-height: 1.5; color: var(--ink); background: var(--cream); padding: 16px; border-radius: 4px; margin: 0; }
        
        .admin-form { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .admin-form .form-group:nth-child(2) { grid-row: span 2; }
        .form-group label { display: block; font-family: var(--mono); font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
        .form-group select, .form-group textarea, .form-group input { width: 100%; padding: 10px; border: 1.5px solid var(--ink); font-size: 14px; }
        
        .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: .2; }
        .empty-state svg { width: 64px; height: 64px; stroke: var(--ink); stroke-width: 1; fill: none; margin-bottom: 16px; }
        
        .btn-small { padding: 6px 12px; font-size: 12px; background: var(--ink); color: var(--yellow); border: none; font-family: var(--narrow); font-weight: 700; text-transform: uppercase; cursor: pointer; }
      `}</style>
    </div>
  );
}
