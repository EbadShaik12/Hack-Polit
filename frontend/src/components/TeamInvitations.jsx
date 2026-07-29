import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Check,
  X,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';

const TeamInvitations = ({ team, onTeamUpdated }) => {
  const [myInvitations, setMyInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLeader = team && team.leader?._id;

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const [myRes, sentRes] = await Promise.all([
        api.get('/api/teams/invitations/my-invitations'),
        isLeader ? api.get('/api/teams/invitations/sent') : Promise.resolve({ data: [] }),
      ]);
      setMyInvitations(myRes.data);
      setSentInvitations(sentRes.data);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [team]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!inviteEmail.trim()) {
      setError('Please enter a participant email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/teams/invitations', {
        email: inviteEmail.trim(),
      });
      setSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptInvite = async (invitationId, teamName) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/api/teams/invitations/${invitationId}/accept`);
      setSuccess(`You joined team "${teamName}"!`);
      if (onTeamUpdated) onTeamUpdated(res.data.team);
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (invitationId) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/teams/invitations/${invitationId}/reject`);
      setSuccess('Invitation declined');
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleCancelInvite = async (invitationId) => {
    try {
      await api.delete(`/api/teams/invitations/${invitationId}`);
      fetchInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Received Invitations Banner */}
      {myInvitations.length > 0 && (
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600 animate-pulse" /> Pending Team Invitations
            </h4>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {myInvitations.length} Pending
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3">
            {myInvitations.map((inv) => (
              <div
                key={inv._id}
                className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    Team: <span className="text-blue-600">{inv.team?.name || 'Hackathon Team'}</span>
                  </h5>
                  <p className="text-xs text-slate-600">
                    Invited by <strong className="text-slate-800">{inv.inviter?.name}</strong> ({inv.inviter?.email})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Event: <strong className="text-slate-700">{inv.hackathon?.title}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleAcceptInvite(inv._id, inv.team?.name)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvite(inv._id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Teammates Section (For Team Leader) */}
      {isLeader && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" /> Send Team Invitations
            </h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Leader Control</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Send invite form */}
          <form onSubmit={handleSendInvite} className="flex gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter participant email address..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>

          {/* Sent Invitations List */}
          {sentInvitations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sent Invitations Status</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sentInvitations.map((inv) => {
                  const isPending = inv.status === 'pending';
                  const isAccepted = inv.status === 'accepted';
                  const isRejected = inv.status === 'rejected';

                  return (
                    <div
                      key={inv._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{inv.invitee?.name || 'Participant'}</p>
                        <p className="text-[10px] text-slate-500">{inv.invitee?.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => handleCancelInvite(inv._id)}
                            className="text-[10px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamInvitations;
