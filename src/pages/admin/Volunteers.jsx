import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchDepartments } from '../../service/departmentApi';
import { fetchVolunteerProfileById } from '../../service/profileApi';
import { fetchVolunteers, updateVolunteerUserType, deleteVolunteer } from '../../service/volunteerApi';
import { formatUserType, formatDuration } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { Users, Shield, Trash2, Search } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import Pagination from '../../components/common/Pagination';
import './Volunteers.css';

const PAGE_SIZE = 10;

const shortName = (name) => {
  const parts = name?.trim()?.split(/\s+/).filter(Boolean) || [];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (parts.length <= 1) return cap(parts[0] || '');
  return `${cap(parts[0])} ${cap(parts[parts.length - 1])}`;
};

const Volunteers = () => {
  const { token } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadVolunteersAndProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchVolunteers(token, currentPage, PAGE_SIZE);
      const volunteersData = data.content;
      setVolunteers(volunteersData);
      setFilteredVolunteers(volunteersData);
      setTotalPages(data.totalPages);

      const profilePromises = volunteersData.map((vol) =>
        fetchVolunteerProfileById(vol.id, token)
          .then((profile) => ({ ...profile, volunteerId: vol.id }))
          .catch((err) => {
            console.warn(`⚠️ Perfil não encontrado para voluntário ${vol.id}`, err);
            return null;
          })
      );

      const loadedProfiles = await Promise.all(profilePromises);
      setProfiles(loadedProfiles.filter((profile) => profile !== null));
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao carregar voluntários e perfis');
      console.error('❌ Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage]);

  const loadDepartments = useCallback(async () => {
    try {
      const data = await fetchDepartments(token);
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadVolunteersAndProfiles();
      loadDepartments();
    }
  }, [loadDepartments, loadVolunteersAndProfiles, token]);

  const profileMap = useMemo(
    () => Object.fromEntries(profiles.map((profile) => [profile.volunteerId ?? profile.userId ?? profile.id, profile])),
    [profiles]
  );

  const departmentMap = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department.name])),
    [departments]
  );

  useEffect(() => {
    if (!searchTerm) {
      setFilteredVolunteers(volunteers);
      return;
    }

    const normalizedSearch = searchTerm.toLowerCase();
    const filtered = volunteers.filter((volunteer) => {
      const departmentName = departmentMap[volunteer.departmentId] || '';

      return (
        volunteer.name.toLowerCase().includes(normalizedSearch) ||
        volunteer.email.toLowerCase().includes(normalizedSearch) ||
        departmentName.toLowerCase().includes(normalizedSearch)
      );
    });

    setFilteredVolunteers(filtered);
  }, [departmentMap, searchTerm, volunteers]);

  const handleToggleUserType = async (volunteerId, currentType) => {
    const newType = currentType === 'ADMIN' ? 'VOLUNTEER' : 'ADMIN';
    const action = newType === 'ADMIN' ? 'promover a Admin' : 'remover privilégios de Admin';

    if (!window.confirm(`Deseja realmente ${action} este usuário?`)) {
      return;
    }

    try {
      await updateVolunteerUserType(volunteerId, newType, token);
      toast.success(`Usuário ${newType === 'ADMIN' ? 'promovido' : 'rebaixado'} com sucesso!`);
      loadVolunteersAndProfiles();
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao atualizar tipo de usuário');
      console.error(error);
    }
  };

  const handleDelete = async (volunteerId, volunteerName) => {
    if (!window.confirm(`Deseja realmente excluir ${volunteerName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteVolunteer(volunteerId, token);
      toast.success('Voluntário excluído com sucesso!');
      loadVolunteersAndProfiles();
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao excluir voluntário');
      console.error(error);
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="volunteers-page">
          <div className="page-header">
            <Users size={32} />
            <div>
              <h1>Voluntários</h1>
              <p className="subtitle">Gerencie os voluntários cadastrados</p>
            </div>
          </div>

          <div className="volunteers-card">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Carregando voluntários...</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>{searchTerm ? 'Nenhum voluntário encontrado' : 'Nenhum voluntário cadastrado'}</p>
              </div>
            ) : (
              <div className="volunteers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Setor</th>
                      <th>Tipo</th>
                      <th>Horas no mês</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolunteers.map((volunteer) => {
                      const profile = profileMap[volunteer.id];

                      return (
                        <Fragment key={volunteer.id}>
                          <tr
                            onClick={() =>
                              setSelectedVolunteer(
                                selectedVolunteer?.id === volunteer.id ? null : volunteer
                              )
                            }
                            className={selectedVolunteer?.id === volunteer.id ? 'selected-row' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <strong>{shortName(volunteer.name)}</strong>
                            </td>
                            <td>{volunteer.email}</td>
                            <td>{departmentMap[volunteer.departmentId] || '-'}</td>
                            <td>
                              <span className={`badge ${volunteer.userType === 'ADMIN' ? 'badge-admin' : 'badge-volunteer'}`}>
                                {formatUserType(volunteer.userType)}
                              </span>
                            </td>
                            <td>{formatDuration(volunteer.monthlyMinutes ?? 0)}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleUserType(volunteer.id, volunteer.userType);
                                  }}
                                  className="btn-icon btn-toggle"
                                  title={volunteer.userType === 'ADMIN' ? 'Remover Admin' : 'Promover a Admin'}
                                >
                                  <Shield size={18} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(volunteer.id, volunteer.name);
                                  }}
                                  className="btn-icon btn-delete"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {selectedVolunteer?.id === volunteer.id && (
                            <tr className="details-row">
                              <td colSpan="6">
                                <div className="volunteer-details-inline">
                                  <h3>Detalhes do Voluntário</h3>
                                  <div className="profile-details-grid">
                                    <div className="profile-section">
                                      <h4>Informações Pessoais</h4>
                                      <p><strong>Nome:</strong> {volunteer.name}</p>
                                      <p><strong>Email:</strong> {volunteer.email}</p>
                                      <p><strong>Telefone:</strong> {profile?.phone || '-'}</p>
                                      <p><strong>CPF:</strong> {profile?.cpf || '-'}</p>
                                      <p><strong>Data de Nascimento:</strong> {profile?.birthDate ? (() => { const [y, m, d] = profile.birthDate.split('-'); return new Date(y, m - 1, d).toLocaleDateString('pt-BR'); })() : '-'}</p>
                                    </div>

                                    <div className="profile-section">
                                      <h4>Endereço</h4>
                                      <p><strong>CEP:</strong> {profile?.zipCode || '-'}</p>
                                      <p><strong>Endereço:</strong> {profile?.address || profile?.street || '-'}</p>
                                      <p><strong>Cidade:</strong> {profile?.city || '-'}</p>
                                      <p><strong>Estado:</strong> {profile?.state || '-'}</p>
                                    </div>

                                    <div className="profile-section">
                                      <h4>Informações Profissionais</h4>
                                      <p><strong>Setor:</strong> {departmentMap[volunteer.departmentId] || '-'}</p>
                                      <p><strong>Tipo:</strong> {formatUserType(volunteer.userType)}</p>
                                      <p><strong>Data de Cadastro:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
                                    </div>

                                    {profile?.bio && (
                                      <div className="profile-section full-width">
                                        <h4>Biografia</h4>
                                        <p>{profile.bio}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="profile-actions">
                                    <button
                                      className="btn-action btn-edit"
                                      title="Editar perfil"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Funcionalidade de edição em desenvolvimento');
                                      }}
                                    >
                                      Editar Perfil
                                    </button>
                                    <button
                                      className="btn-action btn-view"
                                      title="Ver mais detalhes"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Detalhes completos do perfil');
                                      }}
                                    >
                                      Ver Mais
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredVolunteers.length > 0 && (
              <div className="table-footer">
                <p>{filteredVolunteers.length} voluntário(s) encontrado(s)</p>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Volunteers;
