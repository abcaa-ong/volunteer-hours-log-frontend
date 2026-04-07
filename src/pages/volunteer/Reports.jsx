import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchActivityReport, generateCertificate } from '../../service/reportApi';
import { formatDate, formatDuration } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { FileText, Calendar, Download, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import './Reports.css';

const Reports = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Selecione o período');
      return;
    }

    if (dateRange.startDate > dateRange.endDate) {
      toast.error('Data inicial não pode ser maior que data final');
      return;
    }

    try {
      setLoading(true);
      const data = await fetchActivityReport(
        user.volunteerId,
        dateRange.startDate,
        dateRange.endDate,
        token
      );
      setReport(data);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Selecione o período');
      return;
    }

    if (!report || report.totalHours < 20) {
      toast.error('Mínimo de 20 horas necessárias para gerar certificado');
      return;
    }

    try {
      setGenerating(true);
      const blob = await generateCertificate(
        user.volunteerId,
        dateRange.startDate,
        dateRange.endDate,
        token
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${user.name}-${dateRange.startDate}-${dateRange.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificado gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar certificado');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="reports-page">
          <div className="page-header">
            <FileText size={32} />
            <div>
              <h1>Meus Relatórios</h1>
              <p className="subtitle">Consulte suas horas e gere certificados</p>
            </div>
          </div>

          <div className="reports-card">
            <h2>Selecionar Período</h2>
            <form onSubmit={handleGenerateReport} className="date-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Data Final
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </form>
          </div>

          {report && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <CheckCircle size={32} />
                  </div>
                  <div className="stat-content">
                    <h3>{report.totalActivities}</h3>
                    <p>Atividades Aprovadas</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock size={32} />
                  </div>
                  <div className="stat-content">
                    <h3>{report.totalHours}h</h3>
                    <p>Total de Horas</p>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <div className="card-header">
                  <h2>Detalhes do Período</h2>
                  {report.totalHours >= 20 && (
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={generating}
                      className="btn btn-success"
                    >
                      <Download size={18} />
                      {generating ? 'Gerando PDF...' : 'Baixar Certificado'}
                    </button>
                  )}
                </div>

                {report.totalHours < 20 && (
                  <div className="info-message">
                    <p>
                      Você precisa de pelo menos 20 horas aprovadas para gerar um certificado.
                      Faltam {(20 - report.totalHours).toFixed(1)}h.
                    </p>
                  </div>
                )}

                <div className="activities-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th className="description-column">Título da Atividade</th>
                        <th>Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.activities && report.activities.length > 0 ? (
                        report.activities.map((activity) => (
                          <tr key={activity.id}>
                            <td>{formatDate(activity.date)}</td>
                            <td
                              className="description-cell"
                              title={activity.title}
                            >
                              {activity.title}
                            </td>
                            <td>{formatDuration(activity.durationMinutes)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="no-data">
                            Nenhuma atividade aprovada neste período
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;
