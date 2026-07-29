import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home, User, Settings, Layers, Code, Play, Trophy, Users, FileSpreadsheet, Award, Activity, Plus, FileText, Clock, Link2, UserPlus, Edit, Trash2, Globe, Eye, FileEdit, Menu, Search, Bell, Trash, Github, ExternalLink, CheckCircle, Image, Bookmark, BookmarkCheck, Calendar, MapPin, BarChart3, HeartHandshake, Star, ShieldAlert } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ActivityItem from '../components/ActivityItem';
import ProfileModal from '../components/ProfileModal';
import SubmissionModal from '../components/SubmissionModal';
import GradingModal from '../components/GradingModal';
import CountdownTimer from '../components/CountdownTimer';
import OrganizerInsights from '../components/OrganizerInsights';
import SponsorManager from '../components/SponsorManager';
import OrganizerFeedback from '../components/OrganizerFeedback';
import FeedbackModal from '../components/FeedbackModal';
import TeamInvitations from '../components/TeamInvitations';
import AdminAuditLogs from '../components/AdminAuditLogs';
import api from '../services/api';
import { GalleryContent } from './Gallery';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Settings State
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [settingsBio, setSettingsBio] = useState('Full Stack Developer focused on building modern MERN applications.');
  const [settingsSkills, setSettingsSkills] = useState('React, Node.js, Express, MongoDB, Tailwind CSS');
  const [settingsInterests, setSettingsInterests] = useState('Full Stack, AI Tools, Open Source');
  const [settingsExperience, setSettingsExperience] = useState('Intermediate');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setSettingsName(user.name);
  }, [user]);

  // Hackathons CRUD State
  const [hackathons, setHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [crudError, setCrudError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);

  // Participant Feedback Modal State
  const [feedbackHackathon, setFeedbackHackathon] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    venue: '',
    bannerImage: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    rules: '',
    judgingCriteria: '',
  });

  const fetchOrganizerHackathons = async () => {
    if (user?.role !== 'organizer') return;
    setHackathonsLoading(true);
    try {
      const res = await api.get('/hackathons/organizer/all');
      setHackathons(res.data);
    } catch (err) {
      setCrudError(err.response?.data?.message || 'Failed to fetch hackathons');
    } finally {
      setHackathonsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'hackathons') {
      fetchOrganizerHackathons();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setEditingHackathon(null);
    setFormData({
      title: '',
      description: '',
      theme: '',
      venue: '',
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      rules: '',
      judgingCriteria: '',
    });
    setCrudError('');
    setShowModal(true);
  };

  const openEditModal = (hack) => {
    setEditingHackathon(hack);
    setFormData({
      title: hack.title,
      description: hack.description,
      theme: hack.theme,
      venue: hack.venue,
      bannerImage: hack.bannerImage || '',
      startDate: hack.startDate ? hack.startDate.split('T')[0] : '',
      endDate: hack.endDate ? hack.endDate.split('T')[0] : '',
      registrationDeadline: hack.registrationDeadline ? hack.registrationDeadline.split('T')[0] : '',
      rules: hack.rules || '',
      judgingCriteria: hack.judgingCriteria || '',
    });
    setCrudError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setCrudError('');

    // Client-side date ordering logic checks
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const deadline = new Date(formData.registrationDeadline);

    if (start >= end) {
      setCrudError('Hackathon Start Date must be earlier than the End Date.');
      return;
    }

    if (deadline > start) {
      setCrudError('Registration Deadline cannot be after the Hackathon Start Date.');
      return;
    }

    try {
      if (editingHackathon) {
        await api.put(`/hackathons/${editingHackathon._id}`, formData);
      } else {
        await api.post('/hackathons', formData);
      }
      setShowModal(false);
      fetchOrganizerHackathons();
    } catch (err) {
      setCrudError(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      fetchOrganizerHackathons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleTogglePublish = async (hack) => {
    const nextStatus = hack.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/hackathons/${hack._id}`, { status: nextStatus });
      fetchOrganizerHackathons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Team Management State
  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [availableHacks, setAvailableHacks] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [createTeamName, setCreateTeamName] = useState('');
  const [selectedHack, setSelectedHack] = useState('');
  const [teamError, setTeamError] = useState('');

  // Organizer Team Viewer State
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [organizerSelectedHack, setOrganizerSelectedHack] = useState(null);
  const [hackTeams, setHackTeams] = useState([]);
  const [hackTeamsLoading, setHackTeamsLoading] = useState(false);

  const fetchUserTeam = async () => {
    if (user?.role !== 'participant') return;
    setTeamLoading(true);
    try {
      const res = await api.get('/teams/my-team');
      setTeam(res.data);
    } catch (err) {
      console.error('Failed to fetch team:', err.message);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchAvailableHackathons = async () => {
    if (user?.role !== 'participant') return;
    try {
      const res = await api.get('/hackathons');
      setAvailableHacks(res.data);
      if (res.data.length > 0) {
        setSelectedHack(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch public hackathons:', err.message);
    }
  };

  // Teammate Match State
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    skills: '',
    interests: '',
    experience: 'Beginner',
  });

  const fetchTeammateMatches = async () => {
    if (user?.role !== 'participant') return;
    setMatchesLoading(true);
    try {
      const res = await api.get('/matches');
      setMatches(res.data);
    } catch (err) {
      console.error('Failed to fetch teammate matches:', err.message);
    } finally {
      setMatchesLoading(false);
    }
  };

  const openProfileModal = () => {
    setProfileFormData({
      skills: user?.skills ? user.skills.join(', ') : '',
      interests: user?.interests ? user.interests.join(', ') : '',
      experience: user?.experience || 'Beginner',
    });
    setShowProfileModal(true);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/profile', profileFormData);
      const updatedUser = res.data;
      
      const localData = JSON.parse(localStorage.getItem('user')) || {};
      const newLocalData = { ...localData, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newLocalData));
      
      alert('Profile tags updated successfully!');
      setShowProfileModal(false);
      
      // Update local values in memory so they refresh on-screen
      user.skills = updatedUser.skills;
      user.interests = updatedUser.interests;
      user.experience = updatedUser.experience;
      
      fetchTeammateMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Project Submission State
  const [submission, setSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionSaving, setSubmissionSaving] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionFormData, setSubmissionFormData] = useState({
    projectName: '',
    description: '',
    githubRepo: '',
    liveDemoUrl: '',
    screenshots: '',
    presentationPdf: '',
    demoVideoLink: '',
  });

  // Organizer Submissions Inspector State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [organizerSelectedHackForSubs, setOrganizerSelectedHackForSubs] = useState(null);
  const [hackSubmissions, setHackSubmissions] = useState([]);
  const [hackSubmissionsLoading, setHackSubmissionsLoading] = useState(false);

  const fetchTeamSubmission = async () => {
    if (user?.role !== 'participant') return;
    setSubmissionLoading(true);
    try {
      const res = await api.get('/submissions/my-team');
      setSubmission(res.data);
    } catch (err) {
      console.error('Failed to fetch team submission:', err.message);
    } finally {
      setSubmissionLoading(false);
    }
  };

  // ── Bookmark State & Handlers ─────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState([]);          // full hackathon objects
  const [bookmarkIds, setBookmarkIds] = useState(new Set()); // O(1) lookup
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkTogglingId, setBookmarkTogglingId] = useState(null);

  const fetchBookmarks = async () => {
    if (user?.role !== 'participant') return;
    setBookmarkLoading(true);
    try {
      const res = await api.get('/hackathons/bookmarks');
      setBookmarks(res.data);
      setBookmarkIds(new Set(res.data.map((h) => h._id)));
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err.message);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleToggleBookmark = async (hackathonId) => {
    setBookmarkTogglingId(hackathonId);
    try {
      const res = await api.post(`/hackathons/${hackathonId}/bookmark`);
      if (res.data.bookmarked) {
        // Add to bookmarks
        const hack = availableHacks.find((h) => h._id === hackathonId);
        if (hack) {
          setBookmarks((prev) => [hack, ...prev]);
          setBookmarkIds((prev) => new Set([...prev, hackathonId]));
        }
      } else {
        // Remove from bookmarks
        setBookmarks((prev) => prev.filter((h) => h._id !== hackathonId));
        setBookmarkIds((prev) => {
          const next = new Set(prev);
          next.delete(hackathonId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err.message);
    } finally {
      setBookmarkTogglingId(null);
    }
  };

  const openSubmissionModal = () => {
    if (submission) {
      setSubmissionFormData({
        projectName: submission.projectName || '',
        description: submission.description || '',
        githubRepo: submission.githubRepo || '',
        liveDemoUrl: submission.liveDemoUrl || '',
        screenshots: submission.screenshots ? submission.screenshots.join(', ') : '',
        presentationPdf: submission.presentationPdf || '',
        demoVideoLink: submission.demoVideoLink || '',
      });
    } else {
      setSubmissionFormData({
        projectName: '',
        description: '',
        githubRepo: '',
        liveDemoUrl: '',
        screenshots: '',
        presentationPdf: '',
        demoVideoLink: '',
      });
    }
    setSubmissionError('');
    setShowSubmissionModal(true);
  };

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();
    setSubmissionSaving(true);
    setSubmissionError('');

    // URL validation
    const ghUrl = submissionFormData.githubRepo || '';
    if (!ghUrl.startsWith('https://') || !ghUrl.includes('github.com')) {
      setSubmissionError('GitHub Repository URL must be a valid HTTPS link pointing to github.com');
      setSubmissionSaving(false);
      return;
    }

    try {
      const res = await api.post('/submissions', submissionFormData);
      setSubmission(res.data);
      alert('Project submitted successfully!');
      setShowSubmissionModal(false);
    } catch (err) {
      setSubmissionError(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmissionSaving(false);
    }
  };

  const openSubmissionsViewerModal = async (hack) => {
    setOrganizerSelectedHackForSubs(hack);
    setShowSubmissionsModal(true);
    setHackSubmissionsLoading(true);
    try {
      const res = await api.get(`/submissions/hackathon/${hack._id}`);
      setHackSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch hackathon submissions:', err.message);
    } finally {
      setHackSubmissionsLoading(false);
    }
  };

  // Judge Panel & Blind Review State
  const [judgeHackathons, setJudgeHackathons] = useState([]);
  const [selectedJudgeHackathon, setSelectedJudgeHackathon] = useState('');
  const [judgeSubmissions, setJudgeSubmissions] = useState([]);
  const [judgeSubmissionsLoading, setJudgeSubmissionsLoading] = useState(false);
  const [judgeEvaluations, setJudgeEvaluations] = useState([]);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradingError, setGradingError] = useState('');
  const [gradingScores, setGradingScores] = useState({
    innovation: 5,
    ui: 5,
    functionality: 5,
    documentation: 5,
    scalability: 5,
  });
  const [gradingComments, setGradingComments] = useState('');

  const fetchJudgeHackathons = async () => {
    if (user?.role !== 'judge') return;
    try {
      const res = await api.get('/hackathons');
      setJudgeHackathons(res.data);
      if (res.data.length > 0) {
        setSelectedJudgeHackathon(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch judge hackathons:', err.message);
    }
  };

  const fetchJudgeSubmissions = async (hackathonId) => {
    if (!hackathonId || user?.role !== 'judge') return;
    setJudgeSubmissionsLoading(true);
    try {
      const res = await api.get(`/submissions/hackathon/${hackathonId}`);
      setJudgeSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions for grading:', err.message);
    } finally {
      setJudgeSubmissionsLoading(false);
    }
  };

  const fetchJudgeEvaluations = async () => {
    if (user?.role !== 'judge') return;
    try {
      const res = await api.get('/evaluations/my-scores');
      setJudgeEvaluations(res.data);
    } catch (err) {
      console.error('Failed to fetch judge evaluations:', err.message);
    }
  };

  const openGradingModal = (sub) => {
    setGradingSubmission(sub);
    const existing = judgeEvaluations.find((e) => e.submission === sub._id);
    if (existing) {
      setGradingScores({
        innovation: existing.scores.innovation,
        ui: existing.scores.ui,
        functionality: existing.scores.functionality,
        documentation: existing.scores.documentation,
        scalability: existing.scores.scalability,
      });
      setGradingComments(existing.comments || '');
    } else {
      setGradingScores({
        innovation: 5,
        ui: 5,
        functionality: 5,
        documentation: 5,
        scalability: 5,
      });
      setGradingComments('');
    }
    setGradingError('');
    setShowGradingModal(true);
  };

  const handleGradingSubmit = async (e) => {
    e.preventDefault();
    setGradingSaving(true);
    setGradingError('');
    try {
      await api.post('/evaluations', {
        submissionId: gradingSubmission._id,
        scores: gradingScores,
        comments: gradingComments,
      });
      alert('Grading sheet submitted successfully!');
      setShowGradingModal(false);
      fetchJudgeEvaluations();
      fetchJudgeSubmissions(selectedJudgeHackathon);
    } catch (err) {
      setGradingError(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setGradingSaving(false);
    }
  };

  // Effect to load judge items on select or role verification
  useEffect(() => {
    if (user?.role === 'judge') {
      fetchJudgeHackathons();
      fetchJudgeEvaluations();
    }
  }, [user]);

  // Effect to reload judge submissions when selected hackathon dropdown updates
  useEffect(() => {
    if (selectedJudgeHackathon) {
      fetchJudgeSubmissions(selectedJudgeHackathon);
    }
  }, [selectedJudgeHackathon]);

  // Leaderboard State
  const [leaderboardHackathons, setLeaderboardHackathons] = useState([]);
  const [selectedLeaderboardHackathon, setSelectedLeaderboardHackathon] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboardHackathons = async () => {
    try {
      const res = await api.get('/hackathons');
      setLeaderboardHackathons(res.data);
      if (res.data.length > 0) {
        setSelectedLeaderboardHackathon(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard hackathons:', err.message);
    }
  };

  const fetchLeaderboardData = async (hackathonId) => {
    if (!hackathonId) return;
    setLeaderboardLoading(true);
    try {
      const res = await api.get(`/evaluations/leaderboard/${hackathonId}`);
      setLeaderboardData(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard rankings:', err.message);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboardHackathons();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedLeaderboardHackathon) {
      fetchLeaderboardData(selectedLeaderboardHackathon);
    }
  }, [selectedLeaderboardHackathon]);

  // Notification Center State
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err.message);
    }
  };

  // Activity Feed Timeline State
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err.message);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchActivities();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchActivities();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // QR Attendance State
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceHistoryLoading, setAttendanceHistoryLoading] = useState(false);
  const [scannerSelectedUser, setScannerSelectedUser] = useState('');
  const [attendanceHackathonId, setAttendanceHackathonId] = useState('');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState('');
  const [participants, setParticipants] = useState([]);

  const fetchParticipantAttendanceStatus = async () => {
    if (team && team.hackathon) {
      const hackId = team.hackathon._id || team.hackathon;
      try {
        const res = await api.get(`/attendance/my-status/${hackId}`);
        setAttendanceStatus(res.data);
      } catch (err) {
        console.error('Failed to fetch attendance status:', err.message);
      }
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setAttendanceHistoryLoading(true);
      const res = await api.get('/attendance/history');
      setAttendanceHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance logs:', err.message);
    } finally {
      setAttendanceHistoryLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await api.get('/auth/users');
      setParticipants(res.data);
    } catch (err) {
      console.error('Failed to fetch participants:', err.message);
    }
  };

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    if (!scannerSelectedUser || !attendanceHackathonId) {
      setAttendanceError('Please select both a participant and a hackathon');
      return;
    }
    try {
      setAttendanceError('');
      setAttendanceSuccess('');
      const res = await api.post('/attendance/scan', {
        userId: scannerSelectedUser,
        hackathonId: attendanceHackathonId,
      });
      setAttendanceSuccess(res.data.message);
      fetchAttendanceHistory();
      fetchActivities();
    } catch (err) {
      setAttendanceError(err.response?.data?.message || 'Verification scan failed');
    }
  };

  useEffect(() => {
    if (user?.role === 'participant' && team) {
      fetchParticipantAttendanceStatus();
    }
  }, [team]);

  useEffect(() => {
    if (activeTab === 'attendance' && (user?.role === 'organizer' || user?.role === 'admin')) {
      fetchAttendanceHistory();
      fetchParticipants();
      const loadHacks = async () => {
        try {
          const res = await api.get('/hackathons/organizer');
          if (res.data.length > 0) {
            setHackathons(res.data);
            setAttendanceHackathonId(res.data[0]._id);
          } else {
            const fallback = await api.get('/hackathons');
            setHackathons(fallback.data);
            if (fallback.data.length > 0) {
              setAttendanceHackathonId(fallback.data[0]._id);
            }
          }
        } catch (err) {
          console.error('Failed to load hackathons:', err.message);
        }
      };
      loadHacks();
    }
  }, [activeTab]);

  // Certificate State
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificateSelectedParticipant, setCertificateSelectedParticipant] = useState('');
  const [certificateSelectedHackathon, setCertificateSelectedHackathon] = useState('');
  const [certificateType, setCertificateType] = useState('participation');
  const [certificateSignature, setCertificateSignature] = useState('');
  const [certificateError, setCertificateError] = useState('');
  const [certificateSuccess, setCertificateSuccess] = useState('');

  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const url = (user?.role === 'organizer' || user?.role === 'admin')
        ? '/certificates'
        : '/certificates/my-certificates';
      const res = await api.get(url);
      setCertificates(res.data);
    } catch (err) {
      console.error('Failed to fetch certificates:', err.message);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!certificateSelectedParticipant || !certificateSelectedHackathon || !certificateSignature) {
      setCertificateError('Please fill in all certificate builder fields');
      return;
    }
    try {
      setCertificateError('');
      setCertificateSuccess('');
      await api.post('/certificates', {
        participantId: certificateSelectedParticipant,
        hackathonId: certificateSelectedHackathon,
        type: certificateType,
        organizerSignature: certificateSignature,
      });
      setCertificateSuccess('Certificate issued successfully!');
      fetchCertificates();
      fetchActivities();
    } catch (err) {
      setCertificateError(err.response?.data?.message || 'Failed to issue certificate');
    }
  };

  useEffect(() => {
    if (activeTab === 'certificates' && user) {
      fetchCertificates();
      if (user.role === 'organizer' || user.role === 'admin') {
        fetchParticipants();
        const loadHacks = async () => {
          try {
            const res = await api.get('/hackathons/organizer');
            if (res.data.length > 0) {
              setHackathons(res.data);
              setCertificateSelectedHackathon(res.data[0]._id);
            } else {
              const fallback = await api.get('/hackathons');
              setHackathons(fallback.data);
              if (fallback.data.length > 0) {
                setCertificateSelectedHackathon(fallback.data[0]._id);
              }
            }
          } catch (err) {
            console.error('Failed to load hackathons:', err.message);
          }
        };
        loadHacks();
        if (!certificateSignature) {
          setCertificateSignature(user.name);
        }
      }
    }
  }, [activeTab, user]);

  // Mobile UI & UX states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Organizer Manage Hackathons list states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizerPage, setOrganizerPage] = useState(1);

  // Leaderboard pagination states
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  // Judge panel search queries
  const [judgeSearchQuery, setJudgeSearchQuery] = useState('');

  // Reset page pagination counters when search queries change
  useEffect(() => {
    setOrganizerPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setLeaderboardPage(1);
  }, [selectedLeaderboardHackathon]);

  useEffect(() => {
    if (activeTab) {
      setMobileSidebarOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user?.role === 'participant') {
      fetchUserTeam();
      fetchAvailableHackathons();
      fetchTeammateMatches();
      fetchTeamSubmission();
      fetchBookmarks();
    }
  }, [user]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setTeamError('');
    if (!createTeamName || !selectedHack) {
      return setTeamError('Please provide team name and select a hackathon');
    }
    try {
      await api.post('/teams', { name: createTeamName, hackathonId: selectedHack });
      setCreateTeamName('');
      fetchUserTeam();
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setTeamError('');
    if (!inviteEmail) return;
    try {
      const res = await api.post('/teams/invite', { email: inviteEmail });
      setTeam(res.data);
      setInviteEmail('');
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    setTeamError('');
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await api.post('/teams/remove', { memberId });
      setTeam(res.data);
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleTransferLead = async (newLeaderId) => {
    setTeamError('');
    if (!window.confirm('Are you sure you want to transfer leadership? You will lose leader controls.')) return;
    try {
      const res = await api.post('/teams/transfer-lead', { newLeaderId });
      setTeam(res.data);
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to transfer lead');
    }
  };

  const handleDeleteTeam = async () => {
    setTeamError('');
    if (!window.confirm('Are you sure you want to delete this team? This action is irreversible.')) return;
    try {
      await api.delete('/teams');
      setTeam(null);
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const openTeamsViewerModal = async (hack) => {
    setOrganizerSelectedHack(hack);
    setShowTeamsModal(true);
    setHackTeamsLoading(true);
    try {
      const res = await api.get(`/teams/hackathon/${hack._id}`);
      setHackTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch hackathon teams:', err.message);
    } finally {
      setHackTeamsLoading(false);
    }
  };

  // Filter and paginated list calculations for Organizer
  const filteredOrganizerHackathons = hackathons.filter((hack) => {
    const matchesSearch =
      (hack.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hack.theme || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hack.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const organizerItemsPerPage = 3;
  const totalOrganizerPages = Math.ceil(filteredOrganizerHackathons.length / organizerItemsPerPage);
  const paginatedOrganizerHackathons = filteredOrganizerHackathons.slice(
    (organizerPage - 1) * organizerItemsPerPage,
    organizerPage * organizerItemsPerPage
  );

  // Paginated calculations for Leaderboard
  const leaderboardItemsPerPage = 5;
  const totalLeaderboardPages = Math.ceil(leaderboardData.length / leaderboardItemsPerPage);
  const paginatedLeaderboardData = leaderboardData.slice(
    (leaderboardPage - 1) * leaderboardItemsPerPage,
    leaderboardPage * leaderboardItemsPerPage
  );

  // Search query filter for Judge Submissions list
  const filteredJudgeSubmissions = judgeSubmissions.filter((sub) => {
    return (
      (sub.projectName || '').toLowerCase().includes(judgeSearchQuery.toLowerCase()) ||
      (sub.description || '').toLowerCase().includes(judgeSearchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Mobile Sidebar Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-xs">
          <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between h-full relative shadow-2xl">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer"
            >
              &times;
            </button>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                  HP
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  HackPilot
                </span>
              </div>

              <nav className="space-y-1.5">
                {user?.role === 'organizer' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <Home className="h-5 w-5" /> Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('hackathons')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'hackathons' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <Layers className="h-5 w-5" /> My Hackathons
                    </button>
                    <button
                      onClick={() => setActiveTab('insights')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'insights' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <BarChart3 className="h-5 w-5" /> Insights
                    </button>
                    <button
                      onClick={() => setActiveTab('sponsors')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'sponsors' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <HeartHandshake className="h-5 w-5" /> Sponsors
                    </button>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <Star className="h-5 w-5 text-amber-500" /> Reviews & Feedback
                    </button>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'attendance' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <FileSpreadsheet className="h-5 w-5" /> Attendance
                    </button>
                    <button
                      onClick={() => setActiveTab('audit-logs')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'audit-logs' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <ShieldAlert className="h-5 w-5 text-blue-600" /> Audit Logs
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <Home className="h-5 w-5" /> Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('hackathons')}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'hackathons' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <Layers className="h-5 w-5" /> Hackathons
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'leaderboard' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Trophy className="h-5 w-5" /> Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'certificates' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Award className="h-5 w-5" /> Certificates
                </button>
                {user?.role === 'participant' && (
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'bookmarks' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <Bookmark className="h-5 w-5" /> Bookmarks
                    {bookmarks.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">{bookmarks.length}</span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => { setActiveTab('gallery'); setMobileSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'gallery' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Globe className="h-5 w-5" /> Project Gallery
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Settings className="h-5 w-5" /> Settings
                </button>
              </nav>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-200 uppercase">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user?.name || 'User Name'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="h-5 w-5" /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between hidden md:flex shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              HP
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              HackPilot
            </span>
          </div>

          <nav className="space-y-1.5">
            {user?.role === 'organizer' ? (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Home className="h-5 w-5" /> Overview
                </button>
                <button
                  onClick={() => setActiveTab('hackathons')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'hackathons' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Layers className="h-5 w-5" /> My Hackathons
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'insights' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <BarChart3 className="h-5 w-5" /> Insights
                </button>
                <button
                  onClick={() => setActiveTab('sponsors')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'sponsors' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <HeartHandshake className="h-5 w-5" /> Sponsors
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Star className="h-5 w-5 text-amber-500" /> Reviews & Feedback
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'attendance' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <FileSpreadsheet className="h-5 w-5" /> Attendance
                </button>
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'audit-logs' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <ShieldAlert className="h-5 w-5 text-blue-600" /> Audit Logs
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Home className="h-5 w-5" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('hackathons')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'hackathons' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Layers className="h-5 w-5" /> Hackathons
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'leaderboard' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Trophy className="h-5 w-5" /> Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'certificates' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Award className="h-5 w-5" /> Certificates
            </button>
            {user?.role === 'participant' && (
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'bookmarks' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Bookmark className="h-5 w-5" /> Bookmarks
                {bookmarks.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">{bookmarks.length}</span>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'gallery' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Globe className="h-5 w-5" /> Project Gallery
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Settings className="h-5 w-5" /> Settings
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-200 uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'User Name'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
          >
            <LogOut className="h-5 w-5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header Navigation Bar */}
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-xs sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-900 cursor-pointer p-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-xs">
                  HP
                </div>
                <span className="hidden sm:inline font-bold tracking-tight text-base text-slate-900">HackPilot</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <h1 className="text-sm md:text-base font-bold text-slate-800">Workspace Dashboard</h1>
            </div>
          </div>

          {/* Quick Top Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors cursor-pointer ${activeTab === 'overview' ? 'text-blue-600 font-extrabold' : 'hover:text-blue-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('hackathons')}
              className={`transition-colors cursor-pointer ${activeTab === 'hackathons' ? 'text-blue-600 font-extrabold' : 'hover:text-blue-600'}`}
            >
              Hackathons
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`transition-colors cursor-pointer ${activeTab === 'leaderboard' ? 'text-blue-600 font-extrabold' : 'hover:text-blue-600'}`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`transition-colors cursor-pointer flex items-center gap-1 ${activeTab === 'gallery' ? 'text-blue-600 font-extrabold' : 'hover:text-blue-600'}`}
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" /> Project Gallery
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer flex items-center justify-center bg-white shadow-xs"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs text-slate-900">
                    <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <span className="font-bold text-slate-900 text-xs">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 font-semibold text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3.5 space-y-1.5 transition-colors relative group ${
                              n.isRead ? 'bg-white' : 'bg-blue-50/50 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 pr-5">
                              <div className="space-y-0.5">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  n.type === 'registration' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  n.type === 'submission' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  n.type === 'grade' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  n.type === 'team' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {n.type}
                                </span>
                                <h5 className="font-bold text-slate-900 mt-1">{n.title}</h5>
                              </div>
                              <button
                                onClick={() => handleDeleteNotification(n._id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 absolute right-2 top-2 cursor-pointer"
                                title="Delete notification"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed pr-3">{n.message}</p>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1">
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
            </span>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">

          {/* Dynamic Role-Based Views Section */}
          <div className="space-y-4">

            {/* Overview tab: role-aware greeting header */}
            {activeTab === 'overview' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {user?.role === 'organizer' && 'Organizer Overview'}
                    {user?.role === 'participant' && 'Participant Dashboard'}
                    {user?.role === 'judge' && 'Judge Panel'}
                    {user?.role === 'admin' && 'Admin Console'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Welcome back, <span className="font-semibold text-slate-700">{user?.name || 'User'}</span> — here's what's happening today.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 capitalize">
                  {user?.role}
                </span>
              </div>
            )}

            {/* Admin: overview cards — only on overview tab */}
            {user?.role === 'admin' && activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span> System Management Console
                  </h4>
                  <p className="text-sm text-slate-600">
                    Access administrative reports, audit user actions, and manage platform configurations.
                  </p>
                  <button 
                    onClick={() => setActiveTab('audit-logs')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Open Admin Console
                  </button>
                </div>
                <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></span> User Database Manager
                  </h4>
                  <p className="text-sm text-slate-600">
                    Review registered credentials, update permissions, assign user roles, and revoke tokens.
                  </p>
                  <button 
                    onClick={() => setActiveTab('audit-logs')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Manage User Logs
                  </button>
                </div>
              </div>
            )}

            {user?.role === 'organizer' && activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="ACTIVE HACKATHONS"
                    value={hackathons.length ? hackathons.length.toString() : "0"}
                    description="Ready to create your first"
                    icon={Play}
                    color="blue"
                  />
                  <MetricCard
                    title="REGISTERED TEAMS"
                    value="0"
                    description="Invite developers to register"
                    icon={User}
                    color="purple"
                  />
                  <MetricCard
                    title="API STATUS"
                    value="Online"
                    description="Express server on port 5000"
                    icon={Settings}
                    color="emerald"
                  />
                </div>

                {/* Dashboard Flex-Layout Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Recent Activity Log */}
                  <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 bg-white space-y-6 flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                          <Activity className="h-4 w-4 text-blue-600" /> Recent Activity Log
                        </h4>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200 uppercase tracking-wider">
                          Live Feed
                        </span>
                      </div>

                      <div className="space-y-3">
                        {activitiesLoading ? (
                          <div className="flex justify-center py-6">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500 font-semibold">
                            No activities logged yet.
                          </div>
                        ) : (
                          activities.map((act) => (
                            <ActivityItem
                              key={act._id}
                              timestamp={new Date(act.createdAt).toLocaleString()}
                              message={act.message}
                              badge={act.type}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('hackathons')}
                      className="w-full py-2.5 mt-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      Manage Hackathons Panel
                    </button>
                  </div>

                  {/* Quick Actions Panel */}
                  <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-xs">
                    <div className="border-b border-slate-200 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Organizer Actions
                      </h4>
                    </div>

                    <div className="space-y-3.5">
                      <button 
                        onClick={openCreateModal}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Create New Hackathon
                      </button>

                      <button 
                        onClick={() => setActiveTab('insights')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4" /> View Organizer Insights
                      </button>

                      <button 
                        onClick={() => setActiveTab('sponsors')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <HeartHandshake className="h-4 w-4 text-blue-600" /> Manage Sponsors
                      </button>

                      <button 
                        onClick={() => setActiveTab('feedback')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Reviews & Feedback
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-200 text-center">
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Need assistance? Read the <a href="#" className="text-blue-600 hover:underline font-bold">Organizer Handbook</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hackathons' && (
              <div className="space-y-6">
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4E5563] pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Explore & Manage Hackathons</h3>
                    <p className="text-xs text-slate-600">Discover active events, manage submissions, and review hackathon details.</p>
                  </div>
                  {user?.role === 'organizer' && (
                    <button
                      onClick={openCreateModal}
                      className="flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Create Hackathon
                    </button>
                  )}
                </div>

                {/* Search & Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by title or theme..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none min-w-[140px]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Main list */}
                {hackathonsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : (user?.role === 'organizer' ? filteredOrganizerHackathons : availableHacks).length === 0 ? (
                  <div className="text-center py-12 border border-slate-200 rounded-2xl bg-white space-y-2 shadow-xs text-slate-900">
                    <Layers className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800">No matching hackathons found.</p>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or filter options.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(user?.role === 'organizer' ? paginatedOrganizerHackathons : availableHacks).map((hack) => (
                        <div key={hack._id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider">
                                {hack.theme}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${hack.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {hack.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 leading-tight">{hack.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{hack.description}</p>
                          </div>

                          <div className="border-t border-slate-200 pt-4 space-y-3.5">
                            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                              <span>Start: {hack.startDate ? hack.startDate.split('T')[0] : 'N/A'}</span>
                              <span>Venue: {hack.venue}</span>
                            </div>
                            {/* Submission / registration deadline countdown */}
                            {hack.endDate && (
                              <CountdownTimer
                                deadline={hack.endDate}
                                label={new Date(hack.endDate) > Date.now() ? 'Submission deadline' : 'Event ended'}
                                size="sm"
                                showDays={true}
                              />
                            )}
                            
                            {user?.role === 'organizer' ? (
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => openTeamsViewerModal(hack)}
                                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" /> Teams
                                </button>
                                <button
                                  onClick={() => openSubmissionsViewerModal(hack)}
                                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <FileText className="h-3 w-3" /> Subs
                                </button>
                                <button
                                  onClick={() => openEditModal(hack)}
                                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Edit className="h-3 w-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleTogglePublish(hack)}
                                  className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${hack.status === 'published' ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                  <Globe className="h-3 w-3" /> {hack.status === 'published' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                  onClick={() => handleDelete(hack._id)}
                                  className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleToggleBookmark(hack._id)}
                                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Bookmark className="h-3.5 w-3.5" /> Save Hackathon
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalOrganizerPages > 1 && (
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                        <button
                          disabled={organizerPage === 1}
                          onClick={() => setOrganizerPage(prev => Math.max(prev - 1, 1))}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          &larr; Previous
                        </button>
                        <span className="text-xs font-bold text-slate-500">
                          Page {organizerPage} of {totalOrganizerPages}
                        </span>
                        <button
                          disabled={organizerPage === totalOrganizerPages}
                          onClick={() => setOrganizerPage(prev => Math.min(prev + 1, totalOrganizerPages))}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Create / Edit Modal */}
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 relative my-8">
                      {/* Modal Header */}
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-base font-bold text-slate-900">
                            {editingHackathon ? 'Edit Hackathon Details' : 'Create New Hackathon'}
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-lg"
                        >
                          &times;
                        </button>
                      </div>

                      {crudError && (
                        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                          {crudError}
                        </div>
                      )}

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hackathon Title</label>
                            <input
                              type="text"
                              name="title"
                              required
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="e.g. Artificial Intelligence Challenge"
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Theme / Focus</label>
                            <input
                              type="text"
                              name="theme"
                              required
                              value={formData.theme}
                              onChange={handleInputChange}
                              placeholder="e.g. AI/ML, Blockchain"
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                          <textarea
                            name="description"
                            required
                            rows="3"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe what this hackathon is about..."
                            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                            <input
                              type="date"
                              name="startDate"
                              required
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
                            <input
                              type="date"
                              name="endDate"
                              required
                              value={formData.endDate}
                              onChange={handleInputChange}
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reg. Deadline</label>
                            <input
                              type="date"
                              name="registrationDeadline"
                              required
                              value={formData.registrationDeadline}
                              onChange={handleInputChange}
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Venue / Platform</label>
                            <input
                              type="text"
                              name="venue"
                              required
                              value={formData.venue}
                              onChange={handleInputChange}
                              placeholder="e.g. Virtual, San Francisco HQ"
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Banner Image URL</label>
                            <input
                              type="text"
                              name="bannerImage"
                              value={formData.bannerImage}
                              onChange={handleInputChange}
                              placeholder="Image link (Unsplash or custom)"
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rules & Guidelines</label>
                            <textarea
                              name="rules"
                              required
                              rows="3"
                              value={formData.rules}
                              onChange={handleInputChange}
                              placeholder="Add rules, limits, guidelines..."
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                            ></textarea>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Judging Criteria</label>
                            <textarea
                              name="judgingCriteria"
                              required
                              rows="3"
                              value={formData.judgingCriteria}
                              onChange={handleInputChange}
                              placeholder="e.g. Design 25%, Usability 25%, Originality 50%..."
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                            ></textarea>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                          >
                            {editingHackathon ? 'Save Changes' : 'Create Hackathon'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}


                {/* Organizer Teams Inspector Modal (Read-Only) */}
                {showTeamsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
                        <h4 className="text-base font-bold text-white">
                          Registered Teams for: <span className="text-indigo-400">{organizerSelectedHack?.title}</span>
                        </h4>
                        <button
                          onClick={() => setShowTeamsModal(false)}
                          className="text-slate-400 hover:text-white text-lg font-bold"
                        >
                          &times;
                        </button>
                      </div>

                      {hackTeamsLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                      ) : hackTeams.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-slate-750 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-slate-455">No teams registered for this hackathon yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                          {hackTeams.map((t) => (
                            <div key={t._id} className="p-4 rounded-lg bg-slate-950 border border-slate-805 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                <h5 className="font-bold text-white text-sm">{t.name}</h5>
                                <span className="text-xxs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-405 border border-indigo-500/20 font-bold uppercase">
                                  {t.members.length} Members
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {t.members.map((m) => (
                                  <div key={m._id} className="flex justify-between items-center bg-slate-900/30 p-2 rounded border border-slate-850/50">
                                    <div>
                                      <p className="font-semibold text-slate-205">{m.name}</p>
                                      <p className="text-[10px] text-slate-500">{m.email}</p>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold ${t.leader?._id === m._id ? 'text-indigo-405' : 'text-slate-500'}`}>
                                      {t.leader?._id === m._id ? 'Lead' : 'Member'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end pt-3 border-t border-slate-800 mt-5">
                        <button
                          type="button"
                          onClick={() => setShowTeamsModal(false)}
                          className="px-5 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Close Inspector
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.role === 'organizer' && activeTab === 'insights' && (
              <OrganizerInsights />
            )}

            {user?.role === 'organizer' && activeTab === 'sponsors' && (
              <SponsorManager />
            )}

            {user?.role === 'organizer' && activeTab === 'feedback' && (
              <OrganizerFeedback />
            )}

            {activeTab === 'audit-logs' && (
              <AdminAuditLogs />
            )}

            {user?.role === 'judge' && activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500 animate-pulse" /> Judge Evaluation Dashboard
                    </h3>
                    <p className="text-xs text-slate-450">Blind Review Mode enabled. All participant identities are anonymized.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Event:</label>
                    <select
                      value={selectedJudgeHackathon}
                      onChange={(e) => setSelectedJudgeHackathon(e.target.value)}
                      className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-205 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-w-[200px]"
                    >
                      {judgeHackathons.length === 0 ? (
                        <option value="">No events available</option>
                      ) : (
                        judgeHackathons.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Search query input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search submissions by project name or description..."
                    value={judgeSearchQuery}
                    onChange={(e) => setJudgeSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Submissions List */}
                {judgeSubmissionsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : filteredJudgeSubmissions.length === 0 ? (
                  <div className="text-center py-12 border border-slate-850 rounded-xl bg-slate-900/10">
                    <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No matching project submissions found.</p>
                    <p className="text-xs text-slate-655 mt-1">Try adjusting your search criteria or review event status.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJudgeSubmissions.map((sub) => {
                      const myEval = judgeEvaluations.find((e) => e.submission === sub._id);
                      const isGraded = !!myEval;
                      const blindId = `SUB-${sub._id.slice(-6).toUpperCase()}`;

                      return (
                        <div key={sub._id} className="bg-slate-900/35 border border-slate-850 hover:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-400 tracking-wider">
                                {blindId}
                              </span>
                              <span className={`text-xxs font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                                isGraded ? 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20' : 'bg-amber-500/10 text-amber-455 border-amber-500/25'
                              }`}>
                                {isGraded ? `Graded: ${myEval.totalScore}/50` : 'Pending Score'}
                              </span>
                            </div>
                            <h4 className="text-base font-extrabold text-white leading-tight">{sub.projectName}</h4>
                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{sub.description}</p>
                          </div>

                          <div className="border-t border-slate-850/60 pt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xxs text-slate-500">
                              <div>
                                <span className="font-bold text-slate-550 block uppercase">Code Repository</span>
                                <a
                                  href={sub.githubRepo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline font-semibold"
                                >
                                  View on GitHub
                                </a>
                              </div>
                              {sub.liveDemoUrl && (
                                <div>
                                  <span className="font-bold text-slate-550 block uppercase">Live Site</span>
                                  <a
                                    href={sub.liveDemoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:underline font-semibold"
                                  >
                                    Visit Demo
                                  </a>
                                </div>
                              )}
                            </div>

                            {sub.demoVideoLink && (
                              <div className="text-xxs">
                                <span className="font-bold text-slate-550 block uppercase">Video Pitch link</span>
                                <a
                                  href={sub.demoVideoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline font-semibold"
                                >
                                  Watch Demo Recording
                                </a>
                              </div>
                            )}

                            <button
                              onClick={() => openGradingModal(sub)}
                              className={`w-full py-2 rounded-lg text-xxs font-bold transition-all cursor-pointer ${
                                isGraded ? 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300' : 'bg-indigo-650 hover:bg-indigo-600 text-white'
                              }`}
                            >
                              {isGraded ? 'Edit Scorecard' : 'Evaluate Project'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {user?.role === 'participant' && activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Top Quick Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="ACTIVE HACKATHONS"
                    value={availableHacks.length ? availableHacks.length.toString() : "0"}
                    description="Ready to create your first"
                    icon={Play}
                    color="blue"
                  />
                  <MetricCard
                    title="REGISTERED TEAMS"
                    value={team ? team.members.length.toString() : "0"}
                    description={team ? `Team: ${team.name}` : "Invite developers to register"}
                    icon={User}
                    color="purple"
                  />
                  <MetricCard
                    title="API STATUS"
                    value="Online"
                    description="Express server on port 5000"
                    icon={Settings}
                    color="emerald"
                  />
                </div>

                {/* Main Split Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Registered Hackathons, Available Hackathons With Bookmark Buttons */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Browse Hackathons
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">{availableHacks.length} available</span>
                      </div>
                      {availableHacks.length === 0 ? (
                        <div className="text-center py-8">
                          <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-500">No published hackathons yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableHacks.map((hack) => {
                            const isBookmarked = bookmarkIds.has(hack._id);
                            const isToggling = bookmarkTogglingId === hack._id;
                            return (
                              <div key={hack._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-slate-900 text-sm leading-snug">{hack.title}</h5>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold uppercase">
                                      {hack.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Layers className="h-3 w-3 text-blue-600" /> {hack.theme}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-blue-600" /> {hack.venue}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-blue-600" /> {new Date(hack.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                  {/* Live countdown — registration or event end */}
                                  {hack.registrationDeadline && new Date(hack.registrationDeadline) > Date.now() ? (
                                    <CountdownTimer
                                      deadline={hack.registrationDeadline}
                                      label="Reg. closes in"
                                      size="sm"
                                      className="mt-1"
                                    />
                                  ) : hack.endDate && new Date(hack.endDate) > Date.now() ? (
                                    <CountdownTimer
                                      deadline={hack.endDate}
                                      label="Event ends in"
                                      size="sm"
                                      className="mt-1"
                                    />
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  {new Date(hack.endDate) <= new Date() && (
                                    <button
                                      onClick={() => {
                                        setFeedbackHackathon(hack);
                                        setShowFeedbackModal(true);
                                      }}
                                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
                                    >
                                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Rate Event
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleBookmark(hack._id)}
                                    disabled={isToggling}
                                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this hackathon'}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                                      isBookmarked
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                                    }`}
                                  >
                                    {isToggling ? (
                                      <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                    ) : isBookmarked ? (
                                      <BookmarkCheck className="h-3.5 w-3.5" />
                                    ) : (
                                      <Bookmark className="h-3.5 w-3.5" />
                                    )}
                                    {isBookmarked ? 'Saved' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Team Invitations Section (Received & Sent) */}
                    <TeamInvitations team={team} onTeamUpdated={(newTeam) => setTeam(newTeam)} />

                    {/* Team Info & Submission Status */}
                    {teamLoading ? (
                      <div className="p-6 rounded-2xl border border-slate-200 bg-white flex justify-center py-8 shadow-xs">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : !team ? (
                      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5">
                          Create or Join a Team
                        </h4>
                        {teamError && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                            {teamError}
                          </div>
                        )}
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team Name</label>
                              <input
                                type="text"
                                required
                                value={createTeamName}
                                onChange={(e) => setCreateTeamName(e.target.value)}
                                placeholder="Enter team name"
                                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Hackathon</label>
                              <select
                                value={selectedHack}
                                onChange={(e) => setSelectedHack(e.target.value)}
                                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              >
                                {availableHacks.length === 0 ? (
                                  <option value="">No hackathons available</option>
                                ) : (
                                  availableHacks.map((h) => (
                                    <option key={h._id} value={h._id}>
                                      {h.title}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={availableHacks.length === 0}
                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                          >
                            Create Team
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-xs text-slate-900">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                            Team: <span className="text-blue-600">{team.name}</span>
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            Hackathon: {team.hackathon?.title || 'N/A'}
                          </span>
                        </div>

                        {teamError && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                            {teamError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Team Roster */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Teammates</h5>
                            <div className="space-y-2">
                              {team.members.map((member) => (
                                <div key={member._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-900">
                                      {member.name} {member._id === user?._id && '(You)'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{member.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {team.leader?._id === member._id ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold uppercase">
                                        Leader
                                      </span>
                                    ) : (
                                      <>
                                        {team.leader?._id === user?._id && (
                                          <>
                                            <button
                                              onClick={() => handleTransferLead(member._id)}
                                              className="text-[10px] text-amber-600 hover:underline font-bold cursor-pointer"
                                              title="Transfer Leadership"
                                            >
                                              Make Leader
                                            </button>
                                            <button
                                              onClick={() => handleRemoveMember(member._id)}
                                              className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                                              title="Remove Teammate"
                                            >
                                              Remove
                                            </button>
                                          </>
                                        )}
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase border border-slate-200">
                                          Member
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {team.leader?._id === user?._id && (
                              <form onSubmit={handleInvite} className="pt-2 flex gap-2">
                                <input
                                  type="email"
                                  required
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="Teammate's email"
                                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                                >
                                  Add Member
                                </button>
                              </form>
                            )}
                          </div>

                          {/* Action Settings Panel */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Submission & Details</h5>
                            
                            {submissionLoading ? (
                              <div className="flex justify-center py-4">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                              </div>
                            ) : !submission ? (
                              <div className="space-y-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600 font-medium">Status:</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-bold uppercase">
                                      Not Submitted
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal">
                                    Please submit your project details before the hackathon deadline.
                                  </p>
                                </div>
                                
                                {team.leader?._id === user?._id ? (
                                  <button
                                    onClick={openSubmissionModal}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                                  >
                                    Submit Project
                                  </button>
                                ) : (
                                  <p className="text-[10px] text-center text-slate-500 italic">
                                    Ask team leader to submit project.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                    <span className="font-semibold text-slate-600">Status:</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold uppercase">
                                      Submitted
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Project Title</p>
                                    <p className="text-slate-900 font-semibold">{submission.projectName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">GitHub Codebase</p>
                                    <a
                                      href={submission.githubRepo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                                    >
                                      <Link2 className="h-3 w-3" /> View Repository
                                    </a>
                                  </div>
                                  {submission.liveDemoUrl && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 font-bold uppercase">Live Demo</p>
                                      <a
                                        href={submission.liveDemoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-semibold"
                                      >
                                        Visit Live Site
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {team.leader?._id === user?._id ? (
                                  <button
                                    onClick={openSubmissionModal}
                                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Edit Project Details
                                  </button>
                                ) : (
                                  <p className="text-[10px] text-center text-slate-500 italic">
                                    Submission locked (Leader editing only).
                                  </p>
                                )}
                              </div>
                            )}

                            {team.leader?._id === user?._id && (
                              <div className="pt-4 border-t border-slate-200">
                                <button
                                  onClick={handleDeleteTeam}
                                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 transition-colors cursor-pointer"
                                >
                                  Delete Team
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activity Timeline */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" /> Developer Activity Timeline
                      </h4>
                      <div className="space-y-3">
                        {activitiesLoading ? (
                          <div className="flex justify-center py-6">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500 font-semibold">
                            No activities logged yet.
                          </div>
                        ) : (
                          activities.map((act) => (
                            <ActivityItem
                              key={act._id}
                              timestamp={new Date(act.createdAt).toLocaleString()}
                              message={act.message}
                              badge={act.type}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Deadlines & Achievement Badges */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* QR Attendance Ticket */}
                    {team && team.hackathon && (
                      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 text-center shadow-xs">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center justify-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600" /> QR Attendance Ticket
                        </h4>
                        <div className="flex flex-col items-center justify-center space-y-3 py-4 bg-slate-50 rounded-xl border border-slate-200">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              JSON.stringify({
                                userId: user?._id,
                                hackathonId: team.hackathon?._id || team.hackathon,
                              })
                            )}&color=0f172a&bgcolor=f8fafc`}
                            alt="Attendance QR Code Ticket"
                            className="h-36 w-36 rounded-xl border border-slate-200"
                          />
                          <div className="space-y-1">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                              attendanceStatus?.status === 'present'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}>
                              {attendanceStatus?.status === 'present' ? 'Checked In 🟢' : 'Pending Scan 🟡'}
                            </span>
                            {attendanceStatus?.status === 'present' && (
                              <p className="text-[10px] text-slate-500 leading-normal pt-1.5">
                                Marked by Organizer at:<br />
                                {new Date(attendanceStatus.scannedAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                          Show this ticket to any hackathon organizer at registration to check in.
                        </p>
                      </div>
                    )}

                    {/* Deadlines */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" /> Upcoming Deadlines
                      </h4>
                      <div className="space-y-3.5">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                            3d
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">LLM Challenge Code Freeze</h5>
                            <p className="text-[10px] text-slate-500">Aug 18, 2026 - 18:00 UTC</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                            4d
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">LLM Challenge Video Pitch</h5>
                            <p className="text-[10px] text-slate-500">Aug 19, 2026 - 23:59 UTC</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Badges */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" /> Achievement Badges
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1.5 shadow-xs">
                          <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xs font-bold">
                            🚀
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 block tracking-tight leading-none">Fast Hacker</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1.5 shadow-xs">
                          <div className="h-8 w-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xs font-bold">
                            👑
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 block tracking-tight leading-none">Team Lead</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1.5 shadow-xs">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold">
                            👾
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 block tracking-tight leading-none">Dev Pioneer</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Teammate Match Scores */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" /> Compatible Teammates
                        </h4>
                        <button
                          onClick={openProfileModal}
                          className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Edit Profile Tags
                        </button>
                      </div>

                      {matchesLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                      ) : matches.length === 0 ? (
                        <div className="text-center py-6 space-y-2">
                          <p className="text-xs text-slate-500 font-semibold">No matches calculated yet.</p>
                          <button
                            onClick={openProfileModal}
                            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Set Skills & Interests
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                          {matches.map((m) => (
                            <div key={m._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-900">{m.name}</p>
                                  <p className="text-[10px] text-slate-500">{m.email}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                  m.matchPercentage >= 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  m.matchPercentage >= 40 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {m.matchPercentage}% Match
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {m.skills.slice(0, 3).map((s, idx) => (
                                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                                    {s}
                                  </span>
                                ))}
                                {m.skills.length > 3 && (
                                  <span className="text-[9px] text-slate-500 font-bold">+{m.skills.length - 3} more</span>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                                <span>Exp: <strong className="text-slate-700">{m.experience}</strong></span>
                                {team && team.leader?._id === user?._id && !team.members.some(mem => mem._id === m._id) && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await api.post('/teams/invite', { email: m.email });
                                        setTeam(res.data);
                                        alert(`Teammate ${m.name} added to your team successfully!`);
                                      } catch (err) {
                                        alert(err.response?.data?.message || 'Failed to add teammate');
                                      }
                                    }}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                                  >
                                    Add Teammate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Bookmarks Tab ─────────────────────────────────────────────── */}
            {user?.role === 'participant' && activeTab === 'bookmarks' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Bookmark className="h-5 w-5 text-blue-600" /> Saved Hackathons
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hackathons you've bookmarked for quick access.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {bookmarkLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <Bookmark className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-bold text-base">No bookmarks yet</p>
                      <p className="text-slate-500 text-xs mt-1 max-w-xs">
                        Go to your dashboard overview and click the <strong className="text-blue-600">Save</strong> button on any hackathon to bookmark it here.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      Browse Hackathons
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {bookmarks.map((hack) => {
                      const isToggling = bookmarkTogglingId === hack._id;
                      const startDate = hack.startDate ? new Date(hack.startDate) : null;
                      const endDate = hack.endDate ? new Date(hack.endDate) : null;
                      const regDeadline = hack.registrationDeadline ? new Date(hack.registrationDeadline) : null;
                      const now = new Date();
                      const isLive = startDate && endDate && now >= startDate && now <= endDate;
                      const isUpcoming = startDate && now < startDate;
                      const isEnded = endDate && now > endDate;

                      return (
                        <div
                          key={hack._id}
                          className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 text-slate-900"
                        >
                          {/* Banner */}
                          <div className="relative h-28 overflow-hidden bg-slate-100">
                            {hack.bannerImage ? (
                              <img
                                src={hack.bannerImage}
                                alt={hack.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                <Trophy className="h-10 w-10 text-blue-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                            {/* Status badge */}
                            <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isLive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : isUpcoming
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}>
                              {isLive ? '🟢 Live' : isUpcoming ? '⏳ Upcoming' : '⬛ Ended'}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="flex flex-col flex-1 p-4 gap-3">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{hack.title}</h4>
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">{hack.theme}</p>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{hack.description}</p>

                            <div className="space-y-1.5 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="line-clamp-1">{hack.venue}</span>
                              </div>
                              {startDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  {endDate && <span>→ {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                                </div>
                              )}
                            </div>
                            {/* Live countdown */}
                            {regDeadline && isUpcoming ? (
                              <CountdownTimer
                                deadline={regDeadline}
                                label="Reg. closes in"
                                size="sm"
                                showDays={true}
                              />
                            ) : isLive && endDate ? (
                              <CountdownTimer
                                deadline={endDate}
                                label="Submission closes in"
                                size="sm"
                                showDays={true}
                              />
                            ) : isEnded ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Event Ended</span>
                              </div>
                            ) : null}

                            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">by {hack.organizer?.name || 'Organizer'}</span>
                              <button
                                onClick={() => handleToggleBookmark(hack._id)}
                                disabled={isToggling}
                                title="Remove bookmark"
                                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isToggling ? (
                                  <div className="h-3 w-3 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                                ) : (
                                  <BookmarkCheck className="h-3.5 w-3.5" />
                                )}
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {user?.role === 'organizer' && activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" /> QR Attendance Scanner & History
                    </h3>
                    <p className="text-xs text-slate-500">Simulate badge scans and check attendance rosters.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Scanner Simulator */}
                  <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 bg-white space-y-4 h-fit shadow-xs text-slate-900">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5">
                      Simulated QR Scanner
                    </h4>
                    
                    {attendanceError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                        {attendanceError}
                      </div>
                    )}
                    {attendanceSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold">
                        {attendanceSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSimulateScan} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Hackathon</label>
                        <select
                          value={attendanceHackathonId}
                          onChange={(e) => setAttendanceHackathonId(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        >
                          {hackathons.map((h) => (
                            <option key={h._id} value={h._id}>{h.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Participant Badge</label>
                        <select
                          value={scannerSelectedUser}
                          onChange={(e) => setScannerSelectedUser(e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        >
                          <option value="">-- Choose Participant --</option>
                          {participants.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer text-xs"
                      >
                        Simulate Ticket Scan
                      </button>
                    </form>
                  </div>

                  {/* Attendance Log List */}
                  <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-2.5">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Check-in Logs
                      </h4>
                      <input
                        type="text"
                        placeholder="Search logs by name..."
                        value={attendanceSearchQuery}
                        onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                        className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none max-w-xs w-full"
                      />
                    </div>

                    {attendanceHistoryLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : attendanceHistory.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 font-semibold text-xs">
                        No check-in logs recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                              <th className="py-2.5">Participant</th>
                              <th className="py-2.5">Email</th>
                              <th className="py-2.5">Hackathon</th>
                              <th className="py-2.5">Scanned By</th>
                              <th className="py-2.5">Checked In At</th>
                              <th className="py-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {attendanceHistory
                              .filter((log) =>
                                log.participant?.name
                                  ?.toLowerCase()
                                  .includes(attendanceSearchQuery.toLowerCase())
                              )
                              .map((log) => (
                                <tr key={log._id} className="text-slate-800 hover:bg-slate-50">
                                  <td className="py-3 font-semibold text-slate-900">
                                    {log.participant?.name || 'N/A'}
                                  </td>
                                  <td className="py-3 text-slate-500">
                                    {log.participant?.email || 'N/A'}
                                  </td>
                                  <td className="py-3 font-medium text-slate-800">
                                    {log.hackathon?.title || 'N/A'}
                                  </td>
                                  <td className="py-3 text-slate-600 font-semibold">
                                    {log.scannedBy?.name || 'N/A'}
                                  </td>
                                  <td className="py-3 text-slate-500 font-medium">
                                    {new Date(log.scannedAt).toLocaleString()}
                                  </td>
                                  <td className="py-3">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" /> Hackathon Leaderboard
                    </h3>
                    <p className="text-xs text-slate-500">Inspect project scores, winner standings, and metrics breakdown.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Event:</label>
                    <select
                      value={selectedLeaderboardHackathon}
                      onChange={(e) => setSelectedLeaderboardHackathon(e.target.value)}
                      className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none min-w-[200px] shadow-xs"
                    >
                      {leaderboardHackathons.length === 0 ? (
                        <option value="">No events available</option>
                      ) : (
                        leaderboardHackathons.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {leaderboardLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-12 border border-slate-200 rounded-2xl bg-white space-y-2 shadow-xs text-slate-900">
                    <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800">No project submissions ranked yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Once judges grade submitted codebases, they will appear on the leaderboard.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Top 3 Podium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                      {/* 2nd Place */}
                      {leaderboardData[1] && (
                        <div className="order-2 md:order-1 bg-white border border-slate-200 rounded-2xl p-5 text-center relative pt-8 shadow-xs">
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-300 text-lg shadow-xs">
                            🥈
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">2nd Place</span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-2 truncate">{leaderboardData[1].projectName}</h4>
                          <p className="text-xs text-blue-600 mt-1 font-semibold">Team: {leaderboardData[1].teamName}</p>
                          <div className="mt-4 pt-3 border-t border-slate-200 text-slate-900">
                            <span className="text-2xl font-black text-slate-800">{leaderboardData[1].avgTotal}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block">Average Score</span>
                          </div>
                        </div>
                      )}

                      {/* 1st Place */}
                      {leaderboardData[0] && (
                        <div className="order-1 md:order-2 bg-gradient-to-b from-blue-50/50 via-white to-white border-2 border-blue-500 rounded-2xl p-6 text-center relative pt-10 shadow-md md:scale-105">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-amber-400 flex items-center justify-center border-2 border-amber-300 text-2xl shadow-md">
                            👑
                          </div>
                          <span className="text-[10px] uppercase font-black text-amber-700 tracking-widest bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">Winner</span>
                          <h4 className="font-black text-slate-900 text-lg mt-3 truncate">{leaderboardData[0].projectName}</h4>
                          <p className="text-xs text-blue-600 mt-1 font-semibold">Team: {leaderboardData[0].teamName}</p>
                          <div className="mt-5 pt-4 border-t border-slate-200 text-slate-900">
                            <span className="text-3xl font-black text-blue-600">{leaderboardData[0].avgTotal}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block">Average Score</span>
                          </div>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {leaderboardData[2] && (
                        <div className="order-3 bg-white border border-slate-200 rounded-2xl p-5 text-center relative pt-8 shadow-xs">
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300 text-lg shadow-xs">
                            🥉
                          </div>
                          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">3rd Place</span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-2 truncate">{leaderboardData[2].projectName}</h4>
                          <p className="text-xs text-blue-600 mt-1 font-semibold">Team: {leaderboardData[2].teamName}</p>
                          <div className="mt-4 pt-3 border-t border-slate-200 text-slate-900">
                            <span className="text-2xl font-black text-amber-700">{leaderboardData[2].avgTotal}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block">Average Score</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Leaderboard Table Rankings */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              <th className="p-4 text-center w-16">Rank</th>
                              <th className="p-4">Project / Team</th>
                              <th className="p-4 text-center">Innovation</th>
                              <th className="p-4 text-center">UI/UX</th>
                              <th className="p-4 text-center">Functionality</th>
                              <th className="p-4 text-center">Docs</th>
                              <th className="p-4 text-center">Scalability</th>
                              <th className="p-4 text-center">Reviews</th>
                              <th className="p-4 text-right">Avg Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            {paginatedLeaderboardData.map((item) => (
                              <tr key={item.submissionId} className="hover:bg-slate-50 transition-all">
                                <td className="p-4 text-center font-bold">
                                  {item.position === 1 ? '🥇' : item.position === 2 ? '🥈' : item.position === 3 ? '🥉' : `#${item.position}`}
                                </td>
                                <td className="p-4">
                                  <span className="font-extrabold text-slate-900 block">{item.projectName}</span>
                                  <span className="text-[10px] text-slate-500 block">Team: {item.teamName}</span>
                                </td>
                                <td className="p-4 text-center text-slate-600 font-semibold">{item.averages.innovation}</td>
                                <td className="p-4 text-center text-slate-600 font-semibold">{item.averages.ui}</td>
                                <td className="p-4 text-center text-slate-600 font-semibold">{item.averages.functionality}</td>
                                <td className="p-4 text-center text-slate-600 font-semibold">{item.averages.documentation}</td>
                                <td className="p-4 text-center text-slate-600 font-semibold">{item.averages.scalability}</td>
                                <td className="p-4 text-center text-slate-500 font-semibold">{item.reviewCount}</td>
                                <td className="p-4 text-right font-black text-blue-600 text-sm">{item.avgTotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Leaderboard Pagination Controls */}
                      {totalLeaderboardPages > 1 && (
                        <div className="flex justify-between items-center bg-slate-50 p-4 border-t border-slate-200">
                          <button
                            disabled={leaderboardPage === 1}
                            onClick={() => setLeaderboardPage(prev => Math.max(prev - 1, 1))}
                            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            &larr; Previous
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            Page {leaderboardPage} of {totalLeaderboardPages}
                          </span>
                          <button
                            disabled={leaderboardPage === totalLeaderboardPages}
                            onClick={() => setLeaderboardPage(prev => Math.min(prev + 1, totalLeaderboardPages))}
                            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* ── Gallery Tab ────────────────────────────────────────────────── */}
            {activeTab === 'gallery' && (
              <GalleryContent />
            )}

            {/* ── Settings Tab ────────────────────────────────────────────────── */}
            {activeTab === 'settings' && (

              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" /> Settings & Preferences
                    </h3>
                    <p className="text-xs text-slate-500">Manage your profile details, skills, and account preferences.</p>
                  </div>
                </div>

                {settingsSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{settingsSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Account Profile Form */}
                  <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-xs text-slate-900">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" /> Account Profile
                    </h4>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSettingsSaving(true);
                        setTimeout(() => {
                          setSettingsSaving(false);
                          setSettingsSuccess('Profile & settings updated successfully!');
                          setTimeout(() => setSettingsSuccess(''), 4000);
                        }, 600);
                      }}
                      className="space-y-5 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                          <input
                            type="text"
                            required
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address (Verified)</label>
                          <input
                            type="email"
                            disabled
                            value={user?.email || 'user@example.com'}
                            className="block w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bio / Short Description</label>
                        <textarea
                          rows={3}
                          value={settingsBio}
                          onChange={(e) => setSettingsBio(e.target.value)}
                          placeholder="Tell other hackathon participants about yourself..."
                          className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Skills (Comma-separated)</label>
                          <input
                            type="text"
                            value={settingsSkills}
                            onChange={(e) => setSettingsSkills(e.target.value)}
                            placeholder="React, Node.js, Express, MongoDB"
                            className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience Level</label>
                          <select
                            value={settingsExperience}
                            onChange={(e) => setSettingsExperience(e.target.value)}
                            className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Beginner">Beginner (0-1 years)</option>
                            <option value="Intermediate">Intermediate (1-3 years)</option>
                            <option value="Expert">Expert (3+ years)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interests & Focus Areas</label>
                        <input
                          type="text"
                          value={settingsInterests}
                          onChange={(e) => setSettingsInterests(e.target.value)}
                          placeholder="e.g. AI/ML, Web Development, Open Source"
                          className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={settingsSaving}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          {settingsSaving ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Platform Overview */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* User Role Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5">
                        Account Info
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">User Role:</span>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                            {user?.role || 'Developer'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Status:</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Theme:</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                            Pure White Theme
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Security Info Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5">
                        System Security
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Your account is secured via JWT session tokens. Click below to manage your password or sign out.
                      </p>
                      <button
                        onClick={logout}
                        className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Log Out of Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Participant Profile Tags Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        formData={profileFormData}
        onChange={setProfileFormData}
        onSubmit={handleProfileSave}
        saving={profileSaving}
      />

      {/* Participant Project Submission Modal */}
      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        submission={submission}
        formData={submissionFormData}
        onChange={setSubmissionFormData}
        onSubmit={handleSubmissionSubmit}
        error={submissionError}
        saving={submissionSaving}
      />

      {/* Organizer Submissions Inspector Modal (Read-Only) */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
              <h4 className="text-base font-bold text-white">
                Project Submissions for: <span className="text-indigo-400">{organizerSelectedHackForSubs?.title}</span>
              </h4>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {hackSubmissionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : hackSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-455">No submissions uploaded for this hackathon yet.</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
                {hackSubmissions.map((sub) => (
                  <div key={sub._id} className="p-5 rounded-lg bg-slate-950 border border-slate-850 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-2.5 gap-2">
                      <div>
                        <h5 className="font-extrabold text-white text-base">{sub.projectName}</h5>
                        <p className="text-xxs text-slate-505 mt-0.5">
                          Submitted by Team: <strong className="text-slate-400">{sub.team?.name || 'N/A'}</strong>
                        </p>
                      </div>
                      <span className="text-xxs text-slate-500 font-semibold italic shrink-0">
                        {sub.submittedAt ? `Submitted: ${sub.submittedAt.split('T')[0]}` : 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h6 className="text-xxs font-bold uppercase tracking-wider text-slate-405">Project Description</h6>
                      <p className="text-xs text-slate-350 leading-relaxed">{sub.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xxs border-t border-slate-900/60">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-500 block uppercase">GitHub Link</span>
                        <a
                          href={sub.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline font-semibold block"
                        >
                          Code Repository
                        </a>
                      </div>
                      {sub.liveDemoUrl && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-500 block uppercase">Live Demo Link</span>
                          <a
                            href={sub.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline font-semibold block"
                          >
                            Live Application
                          </a>
                        </div>
                      )}
                              {sub.demoVideoLink && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-500 block uppercase">Video Pitch Link</span>
                          <a
                            href={sub.demoVideoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-405 hover:underline font-semibold block"
                          >
                            Watch Demo Recording
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Tech Stack */}
                    {sub.techStack?.length > 0 && (
                      <div className="pt-2 border-t border-slate-900/60">
                        <span className="text-xxs font-bold text-slate-500 uppercase block mb-1.5">Tech Stack</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.techStack.map((t) => (
                            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery Approve Toggle */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        sub.isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {sub.isApproved ? '✓ In Public Gallery' : 'Not in Gallery'}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.patch(`/submissions/${sub._id}/approve`);
                            setHackSubmissions(prev =>
                              prev.map(s => s._id === sub._id ? { ...s, isApproved: res.data.isApproved } : s)
                            );
                          } catch (err) {
                            console.error('Failed to toggle gallery approval:', err.message);
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          sub.isApproved
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {sub.isApproved ? 'Remove from Gallery' : 'Approve for Gallery'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-5">
              <button
                type="button"
                onClick={() => { setShowSubmissionsModal(false); setActiveTab('gallery'); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-semibold cursor-pointer transition-all"
              >
                <Globe className="h-3.5 w-3.5" /> View Public Gallery
              </button>
              <button
                type="button"
                onClick={() => setShowSubmissionsModal(false)}
                className="px-5 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Judge Project Evaluation Modal */}
      <GradingModal
        isOpen={showGradingModal}
        onClose={() => setShowGradingModal(false)}
        submission={gradingSubmission}
        scores={gradingScores}
        onChange={setGradingScores}
        comments={gradingComments}
        onCommentsChange={setGradingComments}
        onSubmit={handleGradingSubmit}
        saving={gradingSaving}
        error={gradingError}
      />

      {/* Participant Feedback Modal */}
      {showFeedbackModal && feedbackHackathon && (
        <FeedbackModal
          hackathon={feedbackHackathon}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
