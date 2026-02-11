import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line, PolarArea } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

// Palette de couleurs professionnelle
const COLORS = {
  primary: '#4f46e5',
  primaryLight: 'rgba(79, 70, 229, 0.1)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  info: '#06b6d4',
  infoLight: 'rgba(6, 182, 212, 0.1)',
  purple: '#8b5cf6',
  purpleLight: 'rgba(139, 92, 246, 0.1)',
  gray: '#6b7280',
  grayLight: 'rgba(107, 114, 128, 0.1)',
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filtres
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [proposalFilter, setProposalFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(id);
  }, [notice]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, internshipsRes, proposalsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/internships'),
        fetch('/api/proposals')
      ]);

      const statsData = await statsRes.json();
      const internshipsData = await internshipsRes.json();
      const proposalsData = await proposalsRes.json();

      if (statsData.ok) {
        setStats(statsData.stats);
      }
      if (internshipsData.ok) {
        setInternships(internshipsData.data);
      }
      if (proposalsData.ok) {
        setProposals(proposalsData.data);
      }
    } catch (err) {
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (type, id, status) => {
    try {
      const endpoint = type === 'internship' ? `/api/internships/${id}/status` : `/api/proposals/${id}/status`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.ok) {
        fetchData();
        setNotice({ type: 'success', message: 'Statut mis à jour avec succès.' });
      } else {
        setNotice({ type: 'danger', message: data.message || 'Erreur lors de la mise à jour du statut.' });
      }
    } catch (err) {
      setNotice({ type: 'danger', message: 'Erreur de connexion au serveur.' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-status badge-pending',
      approved: 'badge-status badge-approved',
      accepted: 'badge-status badge-approved',
      rejected: 'badge-status badge-rejected',
      available: 'badge-status badge-available',
      assigned: 'badge-status badge-assigned',
      archived: 'badge-status badge-archived',
    };
    return badges[status] || 'badge-status badge-default';
  };

  const getOfferTypeLabel = (type) => {
    switch (type) {
      case 'initiation':
        return "Stage d'initiation";
      case 'perfectionnement':
        return 'Stage de perfectionnement';
      case 'pfe':
        return 'Stage PFE';
      default:
        return type;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé',
      available: 'Disponible',
      assigned: 'Assigné',
      archived: 'Archivé',
    };
    return labels[status] || status;
  };

  // Filtres appliqués
  const filteredInternships = internships.filter(item => {
    const matchStatus = internshipFilter === 'all' || item.status === internshipFilter;
    const matchSearch = !searchTerm || 
      `${item.student_name} ${item.student_surname} ${item.subject_title || ''} ${item.host_company || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredProposals = proposals.filter(item => {
    const matchStatus = proposalFilter === 'all' || item.status === proposalFilter;
    const matchSearch = !searchTerm || 
      `${item.teacher_name} ${item.teacher_surname} ${item.subject_title || ''} ${item.host_company || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Configuration des graphiques - Style professionnel moderne
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', 'Segoe UI', sans-serif",
            weight: '500'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { size: 14, weight: '600', family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 14,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { 
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#6b7280',
          stepSize: 1,
          padding: 10
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { 
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#6b7280',
          stepSize: 1,
          padding: 10
        }
      }
    }
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280', stepSize: 1, padding: 10 }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#374151' }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false }
    }
  };

  // Données pour le graphique des candidatures par statut
  const getApplicationsChartData = () => {
    if (!stats?.applicationsByStatus || stats.applicationsByStatus.length === 0) return null;
    
    const statusColors = {
      pending: { bg: COLORS.warning, border: COLORS.warning },
      approved: { bg: COLORS.success, border: COLORS.success },
      accepted: { bg: COLORS.primary, border: COLORS.primary },
      rejected: { bg: COLORS.danger, border: COLORS.danger },
    };
    
    return {
      labels: stats.applicationsByStatus.map(s => getStatusLabel(s.status)),
      datasets: [{
        data: stats.applicationsByStatus.map(s => s.count),
        backgroundColor: stats.applicationsByStatus.map(s => statusColors[s.status]?.bg || COLORS.gray),
        borderColor: stats.applicationsByStatus.map(s => statusColors[s.status]?.border || COLORS.gray),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  };

  // Données pour le graphique des offres par type
  const getOffersByTypeData = () => {
    if (!stats?.offersByType || stats.offersByType.length === 0) return null;
    
    const typeColors = {
      initiation: { bg: COLORS.primary, border: COLORS.primary },
      perfectionnement: { bg: COLORS.warning, border: COLORS.warning },
      pfe: { bg: COLORS.danger, border: COLORS.danger },
    };
    
    const typeLabels = {
      initiation: "Initiation",
      perfectionnement: 'Perfectionnement',
      pfe: 'PFE',
    };
    
    return {
      labels: stats.offersByType.map(t => typeLabels[t.type] || t.type),
      datasets: [{
        data: stats.offersByType.map(t => t.count),
        backgroundColor: stats.offersByType.map(t => typeColors[t.type]?.bg || COLORS.gray),
        borderColor: stats.offersByType.map(t => typeColors[t.type]?.border || COLORS.gray),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  };

  // Données pour le graphique combiné inscriptions + candidatures
  const getCombinedMonthlyData = () => {
    if (!stats?.registrationsByMonth && !stats?.applicationsByMonth) return null;
    
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Créer un ensemble de tous les mois présents
    const allMonths = new Set();
    stats.registrationsByMonth?.forEach(r => allMonths.add(r.month));
    stats.applicationsByMonth?.forEach(a => allMonths.add(a.month));
    
    const sortedMonths = Array.from(allMonths).sort();
    
    const labels = sortedMonths.map(m => {
      const [year, month] = m.split('-');
      return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
    });
    
    const registrationData = sortedMonths.map(m => {
      const found = stats.registrationsByMonth?.find(r => r.month === m);
      return found ? found.count : 0;
    });
    
    const applicationData = sortedMonths.map(m => {
      const found = stats.applicationsByMonth?.find(a => a.month === m);
      return found ? found.count : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Inscriptions',
          data: registrationData,
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
          borderWidth: 0,
          borderRadius: 8,
          barThickness: 24,
        },
        {
          label: 'Candidatures',
          data: applicationData,
          backgroundColor: COLORS.success,
          borderColor: COLORS.success,
          borderWidth: 0,
          borderRadius: 8,
          barThickness: 24,
        }
      ],
    };
  };

  // Données pour le graphique d'évolution des candidatures (ligne)
  const getApplicationsTrendData = () => {
    if (!stats?.applicationsByMonth || stats.applicationsByMonth.length === 0) return null;
    
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return {
      labels: stats.applicationsByMonth.map(r => {
        const [year, month] = r.month.split('-');
        return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
      }),
      datasets: [{
        label: 'Candidatures',
        data: stats.applicationsByMonth.map(r => r.count),
        fill: true,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderColor: COLORS.primary,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: COLORS.primary,
        pointBorderWidth: 3,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: COLORS.primary,
      }],
    };
  };

  // Données pour le graphique des top entreprises
  const getTopCompaniesData = () => {
    if (!stats?.topCompanies || stats.topCompanies.length === 0) return null;
    
    const colors = [
      COLORS.primary,
      COLORS.success,
      COLORS.warning,
      COLORS.info,
      COLORS.purple,
    ];
    
    return {
      labels: stats.topCompanies.map(c => c.company?.length > 18 ? c.company.substring(0, 18) + '...' : c.company),
      datasets: [{
        label: 'Nombre d\'offres',
        data: stats.topCompanies.map(c => c.count),
        backgroundColor: colors.slice(0, stats.topCompanies.length),
        borderColor: colors,
        borderWidth: 0,
        borderRadius: 6,
      }],
    };
  };

  // Données pour les demandes de stage par statut
  const getInternshipsByStatusData = () => {
    if (!stats?.internshipsByStatus || stats.internshipsByStatus.length === 0) return null;
    
    const statusColors = {
      pending: COLORS.warning,
      approved: COLORS.success,
      rejected: COLORS.danger,
    };
    
    return {
      labels: stats.internshipsByStatus.map(s => getStatusLabel(s.status)),
      datasets: [{
        data: stats.internshipsByStatus.map(s => s.count),
        backgroundColor: stats.internshipsByStatus.map(s => statusColors[s.status] || COLORS.gray),
        borderWidth: 0,
      }],
    };
  };

  // Données pour les propositions par statut
  const getProposalsByStatusData = () => {
    if (!stats?.proposalsByStatus || stats.proposalsByStatus.length === 0) return null;
    
    const statusColors = {
      available: COLORS.info,
      assigned: COLORS.success,
      archived: COLORS.gray,
    };
    
    return {
      labels: stats.proposalsByStatus.map(s => getStatusLabel(s.status)),
      datasets: [{
        data: stats.proposalsByStatus.map(s => s.count),
        backgroundColor: stats.proposalsByStatus.map(s => statusColors[s.status] || COLORS.gray),
        borderWidth: 0,
      }],
    };
  };

  // Données pour les étudiants par classe
  const getStudentsByClassData = () => {
    if (!stats?.studentsByClass || stats.studentsByClass.length === 0) return null;
    
    const colors = [
      COLORS.primary,
      COLORS.purple,
      COLORS.info,
      COLORS.success,
      COLORS.warning,
      COLORS.danger,
      '#ec4899',
      '#14b8a6',
      '#f97316',
      '#84cc16',
    ];
    
    return {
      labels: stats.studentsByClass.map(c => c.student_class || 'Non spécifié'),
      datasets: [{
        label: 'Demandes par classe',
        data: stats.studentsByClass.map(c => c.count),
        backgroundColor: colors.slice(0, stats.studentsByClass.length),
        borderWidth: 0,
      }],
    };
  };

  // Calcul du taux de conversion
  const conversionRate = useMemo(() => {
    if (!stats?.totals) return 0;
    const { applications, offers } = stats.totals;
    if (offers === 0) return 0;
    return Math.round((applications / offers) * 100);
  }, [stats]);

  // Vérifier si les données des graphiques sont disponibles
  const hasChartData = useMemo(() => {
    return {
      applications: stats?.applicationsByStatus?.length > 0,
      offers: stats?.offersByType?.length > 0,
      monthly: stats?.registrationsByMonth?.length > 0 || stats?.applicationsByMonth?.length > 0,
      companies: stats?.topCompanies?.length > 0,
      internships: stats?.internshipsByStatus?.length > 0,
      proposals: stats?.proposalsByStatus?.length > 0,
      classes: stats?.studentsByClass?.length > 0,
    };
  }, [stats]);

  // Formatage de la date
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const dashboardStyles = `
    .admin-dashboard {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .dashboard-header {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
      border-radius: 20px;
      padding: 2rem;
      color: white;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .dashboard-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 60%;
      height: 200%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .dashboard-header h1 {
      font-weight: 700;
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }
    
    .dashboard-header p {
      opacity: 0.9;
      margin-bottom: 0;
    }
    
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
      height: 100%;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }
    
    .stat-card .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .stat-card .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
    }
    
    .stat-card .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .stat-card .stat-trend {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
    }
    
    .stat-trend.up {
      background: ${COLORS.successLight};
      color: ${COLORS.success};
    }
    
    .stat-trend.down {
      background: ${COLORS.dangerLight};
      color: ${COLORS.danger};
    }
    
    .chart-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .chart-card .card-header {
      background: white;
      border-bottom: 1px solid #f3f4f6;
      padding: 1.25rem 1.5rem;
    }
    
    .chart-card .card-header h6 {
      font-weight: 600;
      color: #111827;
      font-size: 1rem;
      margin-bottom: 0;
    }
    
    .chart-card .card-body {
      padding: 1.5rem;
    }
    
    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .kpi-card .kpi-value {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .kpi-card .kpi-label {
      color: #374151;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .kpi-card .kpi-sublabel {
      color: #9ca3af;
      font-size: 0.8125rem;
    }
    
    .nav-pills-custom {
      background: #f8fafc;
      padding: 0.5rem;
      border-radius: 12px;
      gap: 0.5rem;
    }
    
    .nav-pills-custom .nav-link {
      border-radius: 10px;
      padding: 0.75rem 1.25rem;
      font-weight: 500;
      color: #64748b;
      transition: all 0.2s ease;
    }
    
    .nav-pills-custom .nav-link:hover {
      background: white;
      color: #334155;
    }
    
    .nav-pills-custom .nav-link.active {
      background: ${COLORS.primary};
      color: white;
      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);
    }
    
    .alert-banner {
      background: linear-gradient(135deg, ${COLORS.warningLight}, rgba(245, 158, 11, 0.05));
      border: 1px solid ${COLORS.warning};
      border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    
    .alert-banner .alert-icon {
      width: 40px;
      height: 40px;
      background: ${COLORS.warning};
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .badge-status {
      padding: 0.375rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
    }
    
    .badge-pending { background: ${COLORS.warningLight}; color: #b45309; }
    .badge-approved { background: ${COLORS.successLight}; color: #047857; }
    .badge-rejected { background: ${COLORS.dangerLight}; color: #b91c1c; }
    .badge-available { background: ${COLORS.infoLight}; color: #0e7490; }
    .badge-assigned { background: ${COLORS.successLight}; color: #047857; }
    .badge-archived { background: ${COLORS.grayLight}; color: #374151; }
    .badge-default { background: #f3f4f6; color: #6b7280; }
    
    .activity-list .activity-item {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s ease;
    }
    
    .activity-list .activity-item:hover {
      background: #f9fafb;
    }
    
    .activity-list .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    
    .data-table {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .data-table .table {
      margin-bottom: 0;
    }
    
    .data-table .table thead th {
      background: #f8fafc;
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1rem;
    }
    
    .data-table .table tbody td {
      padding: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .data-table .table tbody tr:hover {
      background: #f9fafb;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      transition: all 0.2s ease;
    }
    
    .action-btn.approve {
      background: ${COLORS.successLight};
      color: ${COLORS.success};
    }
    
    .action-btn.approve:hover {
      background: ${COLORS.success};
      color: white;
    }
    
    .action-btn.reject {
      background: ${COLORS.dangerLight};
      color: ${COLORS.danger};
    }
    
    .action-btn.reject:hover {
      background: ${COLORS.danger};
      color: white;
    }
    
    .action-btn.archive {
      background: ${COLORS.grayLight};
      color: ${COLORS.gray};
    }
    
    .action-btn.archive:hover {
      background: ${COLORS.gray};
      color: white;
    }
    
    .loading-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loading-content {
      text-align: center;
    }
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: ${COLORS.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .quick-action-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      position: relative;
      z-index: 10;
      cursor: pointer;
    }
    
    .quick-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
    }
    
    .empty-state .empty-icon {
      width: 64px;
      height: 64px;
      background: #f3f4f6;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: #9ca3af;
      font-size: 1.5rem;
    }
    
    .filter-group {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    
    .filter-input {
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .filter-input:focus {
      border-color: ${COLORS.primary};
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      outline: none;
    }
  `;

  if (loading) {
    return (
      <div className="admin-dashboard">
        <style>{dashboardStyles}</style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h4>Chargement du tableau de bord</h4>
            <p className="text-muted">Récupération des données en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <style>{dashboardStyles}</style>
      
      {/* Header moderne */}
      <div className="dashboard-header mt-4">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1>
              <i className="fas fa-chart-line me-2"></i>
              Tableau de bord administrateur
            </h1>
            <p>{formatDate(currentTime)} • Gestion des stages</p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0" style={{ position: 'relative', zIndex: 10 }}>
            <button 
              className="btn btn-light quick-action-btn" 
              onClick={fetchData} 
              disabled={loading}
              style={{ cursor: 'pointer' }}
            >
              <i className={`fas fa-sync-alt me-2 ${loading ? 'fa-spin' : ''}`}></i>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
          <i className={`fas fa-${notice.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {notice.message}
          <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
        </div>
      )}

      {/* Navigation par onglets */}
      <ul className="nav nav-pills nav-pills-custom d-flex mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-th-large me-2"></i>
            Vue d'ensemble
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'internships' ? 'active' : ''} position-relative`}
            onClick={() => setActiveTab('internships')}
          >
            <i className="fas fa-file-alt me-2"></i>
            Demandes
            {stats?.pending?.internships > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {stats.pending.internships}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            <i className="fas fa-lightbulb me-2"></i>
            Propositions
            <span className="badge bg-secondary bg-opacity-25 text-white ms-2">{proposals.length}</span>
          </button>
        </li>
      </ul>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Tab Vue d'ensemble */}
      {activeTab === 'overview' && (
        <>
          {/* Alertes - Éléments en attente */}
          {stats?.pending?.total > 0 && (
            <div className="alert-banner d-flex align-items-center mb-4">
              <div className="alert-icon me-3">
                <i className="fas fa-bell"></i>
              </div>
              <div className="flex-grow-1">
                <strong className="d-block mb-1">Actions requises</strong>
                <div className="d-flex flex-wrap gap-2">
                  {stats.pending.applications > 0 && (
                    <span className="badge-status badge-pending">
                      <i className="fas fa-paper-plane me-1"></i>
                      {stats.pending.applications} candidature(s)
                    </span>
                  )}
                  {stats.pending.internships > 0 && (
                    <span className="badge-status badge-available">
                      <i className="fas fa-file-alt me-1"></i>
                      {stats.pending.internships} demande(s)
                    </span>
                  )}
                  {stats.pending.proposals > 0 && (
                    <span className="badge-status badge-archived">
                      <i className="fas fa-lightbulb me-1"></i>
                      {stats.pending.proposals} proposition(s)
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-warning btn-sm" onClick={() => setActiveTab('internships')}>
                Traiter maintenant
              </button>
            </div>
          )}

          {/* Cartes statistiques principales */}
          <div className="row g-4 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-icon" style={{ background: COLORS.primaryLight }}>
                    <i className="fas fa-users" style={{ color: COLORS.primary }}></i>
                  </div>
                  <span className="stat-trend up">
                    <i className="fas fa-arrow-up me-1"></i>Actif
                  </span>
                </div>
                <div className="stat-value">{stats?.totals?.users || 0}</div>
                <div className="stat-label mb-2">Utilisateurs</div>
                <div className="d-flex gap-2 flex-wrap">
                  <small className="text-muted">
                    <i className="fas fa-user-graduate me-1" style={{ color: COLORS.primary }}></i>
                    {stats?.totals?.students || 0} étudiants
                  </small>
                  <small className="text-muted">
                    <i className="fas fa-chalkboard-teacher me-1" style={{ color: COLORS.success }}></i>
                    {stats?.totals?.teachers || 0} enseignants
                  </small>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-icon" style={{ background: COLORS.successLight }}>
                    <i className="fas fa-briefcase" style={{ color: COLORS.success }}></i>
                  </div>
                  <Link to="/admin/offers" className="text-decoration-none">
                    <small className="text-muted">
                      Voir tout <i className="fas fa-arrow-right ms-1"></i>
                    </small>
                  </Link>
                </div>
                <div className="stat-value">{stats?.totals?.offers || 0}</div>
                <div className="stat-label mb-2">Offres de stage</div>
                <div className="d-flex align-items-center">
                  <span className="badge-status badge-approved">
                    <i className="fas fa-door-open me-1"></i>
                    {stats?.totals?.openOffers || 0} ouvertes
                  </span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-icon" style={{ background: COLORS.warningLight }}>
                    <i className="fas fa-paper-plane" style={{ color: COLORS.warning }}></i>
                  </div>
                  {stats?.pending?.applications > 0 && (
                    <span className="stat-trend" style={{ background: COLORS.warningLight, color: '#b45309' }}>
                      <i className="fas fa-clock me-1"></i>{stats.pending.applications} en attente
                    </span>
                  )}
                </div>
                <div className="stat-value">{stats?.totals?.applications || 0}</div>
                <div className="stat-label mb-2">Candidatures</div>
                <small className="text-muted">
                  {stats?.pending?.applications === 0 ? (
                    <><i className="fas fa-check-circle me-1" style={{ color: COLORS.success }}></i>Toutes traitées</>
                  ) : (
                    <>Candidatures aux offres</>
                  )}
                </small>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="stat-icon" style={{ background: COLORS.infoLight }}>
                    <i className="fas fa-file-signature" style={{ color: COLORS.info }}></i>
                  </div>
                </div>
                <div className="stat-value">{(stats?.totals?.internships || 0) + (stats?.totals?.proposals || 0)}</div>
                <div className="stat-label mb-2">Demandes & Propositions</div>
                <div className="d-flex gap-2 flex-wrap">
                  <small className="text-muted">
                    <i className="fas fa-file-alt me-1" style={{ color: COLORS.info }}></i>
                    {stats?.totals?.internships || 0} demandes
                  </small>
                  <small className="text-muted">
                    <i className="fas fa-lightbulb me-1" style={{ color: COLORS.purple }}></i>
                    {stats?.totals?.proposals || 0} propositions
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="kpi-card">
                <div className="kpi-value">{stats?.totals?.acceptanceRate || 0}%</div>
                <div className="kpi-label">Taux d'acceptation</div>
                <div className="kpi-sublabel">Des candidatures traitées</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="kpi-card">
                <div className="kpi-value">{conversionRate}%</div>
                <div className="kpi-label">Ratio candidatures/offres</div>
                <div className="kpi-sublabel">Engagement des étudiants</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="kpi-card">
                <div className="kpi-value">{stats?.totals?.openOffers || 0}</div>
                <div className="kpi-label">Offres actives</div>
                <div className="kpi-sublabel">Disponibles pour les étudiants</div>
              </div>
            </div>
          </div>

          {/* Graphiques principaux */}
          <div className="row g-4 mb-4">
            <div className="col-xl-8">
              <div className="chart-card h-100">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <div>
                    <h6>
                      <i className="fas fa-chart-bar me-2" style={{ color: COLORS.primary }}></i>
                      Activité des 6 derniers mois
                    </h6>
                    <small className="text-muted">Inscriptions vs Candidatures</small>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ height: '320px' }}>
                    {hasChartData.monthly && getCombinedMonthlyData() ? (
                      <Bar data={getCombinedMonthlyData()} options={barChartOptions} />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-chart-bar"></i>
                        </div>
                        <p className="text-muted mb-1">Aucune donnée disponible</p>
                        <small className="text-muted">Les statistiques apparaîtront avec l'activité</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-chart-pie me-2" style={{ color: COLORS.warning }}></i>
                    Candidatures par statut
                  </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div style={{ height: '280px', width: '100%' }}>
                    {hasChartData.applications && getApplicationsChartData() ? (
                      <Doughnut 
                        data={getApplicationsChartData()} 
                        options={{
                          ...chartOptions,
                          cutout: '65%',
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 16,
                                usePointStyle: true,
                                font: { size: 11, family: "'Inter', sans-serif" }
                              }
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-chart-pie"></i>
                        </div>
                        <p className="text-muted mb-0">Aucune candidature</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques secondaires */}
          <div className="row g-4 mb-4">
            <div className="col-xl-6">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-chart-line me-2" style={{ color: COLORS.success }}></i>
                    Évolution des candidatures
                  </h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '260px' }}>
                    {hasChartData.monthly && getApplicationsTrendData() ? (
                      <Line data={getApplicationsTrendData()} options={lineChartOptions} />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <p className="text-muted mb-0">Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-graduation-cap me-2" style={{ color: COLORS.primary }}></i>
                    Types de stages
                  </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div style={{ height: '220px', width: '100%' }}>
                    {hasChartData.offers && getOffersByTypeData() ? (
                      <Pie 
                        data={getOffersByTypeData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 12,
                                usePointStyle: true,
                                font: { size: 10, family: "'Inter', sans-serif" }
                              }
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-briefcase"></i>
                        </div>
                        <small className="text-muted">Aucune offre</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-tasks me-2" style={{ color: COLORS.info }}></i>
                    Demandes de stage
                  </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div style={{ height: '220px', width: '100%' }}>
                    {hasChartData.internships && getInternshipsByStatusData() ? (
                      <PolarArea 
                        data={getInternshipsByStatusData()} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 12,
                                usePointStyle: true,
                                font: { size: 10, family: "'Inter', sans-serif" }
                              }
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-file-alt"></i>
                        </div>
                        <small className="text-muted">Aucune demande</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top entreprises et répartition par classe */}
          <div className="row g-4 mb-4">
            <div className="col-xl-6">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-building me-2" style={{ color: COLORS.purple }}></i>
                    Top 5 Entreprises partenaires
                  </h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '260px' }}>
                    {hasChartData.companies && getTopCompaniesData() ? (
                      <Bar data={getTopCompaniesData()} options={horizontalBarOptions} />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <p className="text-muted mb-0">Aucune entreprise enregistrée</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <div className="chart-card h-100">
                <div className="card-header">
                  <h6>
                    <i className="fas fa-users-class me-2" style={{ color: COLORS.danger }}></i>
                    Répartition par classe
                  </h6>
                </div>
                <div className="card-body">
                  <div style={{ height: '260px' }}>
                    {hasChartData.classes && getStudentsByClassData() ? (
                      <Doughnut 
                        data={getStudentsByClassData()} 
                        options={{
                          ...chartOptions,
                          cutout: '55%',
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'right',
                              labels: {
                                padding: 12,
                                usePointStyle: true,
                                font: { size: 11, family: "'Inter', sans-serif" }
                              }
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                        <p className="text-muted mb-0">Aucune donnée par classe</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="row g-4">
            <div className="col-xl-6 mb-4">
              <div className="chart-card h-100">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h6>
                    <i className="fas fa-clock me-2" style={{ color: COLORS.primary }}></i>
                    Offres récentes
                  </h6>
                  <Link to="/admin/offers" className="btn btn-sm" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
                    Voir tout
                  </Link>
                </div>
                <div className="card-body p-0">
                  {stats?.recentOffers?.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="fas fa-briefcase"></i>
                      </div>
                      <p className="text-muted mb-0">Aucune offre récente</p>
                    </div>
                  ) : (
                    <div className="activity-list">
                      {stats?.recentOffers?.map((offer, index) => (
                        <div key={offer.id} className="activity-item d-flex align-items-center">
                          <div 
                            className="activity-avatar me-3" 
                            style={{ 
                              background: offer.type === 'pfe' ? COLORS.dangerLight : offer.type === 'initiation' ? COLORS.primaryLight : COLORS.warningLight,
                              color: offer.type === 'pfe' ? COLORS.danger : offer.type === 'initiation' ? COLORS.primary : COLORS.warning
                            }}
                          >
                            <i className="fas fa-briefcase"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.9375rem' }}>{offer.title}</h6>
                            <small className="text-muted">{offer.company}</small>
                          </div>
                          <span className={`badge-status ${offer.type === 'pfe' ? 'badge-rejected' : offer.type === 'initiation' ? '' : 'badge-pending'}`} style={offer.type === 'initiation' ? { background: COLORS.primaryLight, color: COLORS.primary } : {}}>
                            {getOfferTypeLabel(offer.type)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-6 mb-4">
              <div className="chart-card h-100">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h6>
                    <i className="fas fa-paper-plane me-2" style={{ color: COLORS.success }}></i>
                    Candidatures récentes
                  </h6>
                  <span className="badge-status badge-approved">
                    {stats?.recentApplications?.length || 0} récentes
                  </span>
                </div>
                <div className="card-body p-0">
                  {stats?.recentApplications?.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="fas fa-paper-plane"></i>
                      </div>
                      <p className="text-muted mb-0">Aucune candidature récente</p>
                    </div>
                  ) : (
                    <div className="activity-list">
                      {stats?.recentApplications?.slice(0, 5).map((app) => (
                        <div key={app.id} className="activity-item d-flex align-items-center">
                          <div className="activity-avatar me-3" style={{ background: COLORS.grayLight, color: COLORS.gray }}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.9375rem' }}>{app.student_name}</h6>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                              {app.offer_title}
                            </small>
                          </div>
                          <span className={getStatusBadge(app.status)}>
                            {getStatusLabel(app.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab Demandes de Stage */}
      {activeTab === 'internships' && (
        <div className="chart-card mb-4">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h6 className="mb-1">
                <i className="fas fa-file-alt me-2" style={{ color: COLORS.primary }}></i>
                Demandes de Stage
              </h6>
              <small className="text-muted">{filteredInternships.length} sur {internships.length} demandes</small>
            </div>
            <div className="filter-group">
              <div className="position-relative">
                <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '36px', width: '220px' }}
                />
              </div>
              <select
                className="filter-input"
                value={internshipFilter}
                onChange={(e) => setInternshipFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="data-table">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Étudiant</th>
                      <th>Classe</th>
                      <th>Binôme</th>
                      <th>Sujet</th>
                      <th>Entreprise</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>CV</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInternships.length === 0 ? (
                      <tr>
                        <td colSpan="10">
                          <div className="empty-state">
                            <div className="empty-icon">
                              <i className="fas fa-inbox"></i>
                            </div>
                            <p className="text-muted mb-0">Aucune demande trouvée</p>
                            <small className="text-muted">Modifiez vos critères de recherche</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInternships.map((item) => (
                        <tr key={item.id}>
                          <td><span className="fw-medium">#{item.id}</span></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="activity-avatar me-2" style={{ width: '36px', height: '36px', background: COLORS.primaryLight, color: COLORS.primary, fontSize: '0.75rem' }}>
                                {item.student_name?.charAt(0)}{item.student_surname?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-medium">{item.student_name} {item.student_surname}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge-status" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>{item.student_class}</span></td>
                          <td>
                            {item.has_partner ? (
                              <span className="badge-status badge-available">
                                <i className="fas fa-user-friends me-1"></i>Oui
                              </span>
                            ) : (
                              <span className="badge-status badge-archived">Non</span>
                            )}
                          </td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={item.subject_title}>
                              {item.subject_title || <em className="text-muted">Non spécifié</em>}
                            </span>
                          </td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }} title={item.host_company}>
                              {item.host_company || <em className="text-muted">Non spécifié</em>}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadge(item.status)}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </small>
                          </td>
                          <td>
                            {item.cv_url ? (
                              <a href={item.cv_url} target="_blank" rel="noopener noreferrer" className="action-btn" style={{ background: COLORS.dangerLight, color: COLORS.danger }} title="Voir le CV">
                                <i className="fas fa-file-pdf"></i>
                              </a>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="action-btn approve"
                                onClick={() => updateStatus('internship', item.id, 'approved')}
                                disabled={item.status === 'approved'}
                                title="Approuver"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="action-btn reject"
                                onClick={() => updateStatus('internship', item.id, 'rejected')}
                                disabled={item.status === 'rejected'}
                                title="Rejeter"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Propositions */}
      {activeTab === 'proposals' && (
        <div className="chart-card mb-4">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h6 className="mb-1">
                <i className="fas fa-lightbulb me-2" style={{ color: COLORS.warning }}></i>
                Propositions de Sujets
              </h6>
              <small className="text-muted">{filteredProposals.length} sur {proposals.length} propositions</small>
            </div>
            <div className="filter-group">
              <div className="position-relative">
                <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '36px', width: '220px' }}
                />
              </div>
              <select
                className="filter-input"
                value={proposalFilter}
                onChange={(e) => setProposalFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponible</option>
                <option value="assigned">Assigné</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="data-table">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Enseignant</th>
                      <th>Titre</th>
                      <th>Description</th>
                      <th>Entreprise cible</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <div className="empty-state">
                            <div className="empty-icon">
                              <i className="fas fa-lightbulb"></i>
                            </div>
                            <p className="text-muted mb-0">Aucune proposition trouvée</p>
                            <small className="text-muted">Modifiez vos critères de recherche</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProposals.map((item) => (
                        <tr key={item.id}>
                          <td><span className="fw-medium">#{item.id}</span></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="activity-avatar me-2" style={{ width: '36px', height: '36px', background: COLORS.successLight, color: COLORS.success, fontSize: '0.75rem' }}>
                                {item.teacher_name?.charAt(0)}{item.teacher_surname?.charAt(0)}
                              </div>
                              <div>
                                <div className="fw-medium">{item.teacher_name} {item.teacher_surname}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="fw-medium text-truncate d-inline-block" style={{ maxWidth: '180px' }} title={item.title}>
                              {item.title}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={item.description}>
                              {item.description?.substring(0, 60)}
                              {item.description?.length > 60 && '...'}
                            </span>
                          </td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }} title={item.target_company}>
                              {item.target_company || <em className="text-muted">Non spécifié</em>}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadge(item.status)}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="action-btn approve"
                                onClick={() => updateStatus('proposal', item.id, 'available')}
                                disabled={item.status === 'available'}
                                title="Rendre disponible"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="action-btn archive"
                                onClick={() => updateStatus('proposal', item.id, 'archived')}
                                disabled={item.status === 'archived'}
                                title="Archiver"
                              >
                                <i className="fas fa-archive"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
