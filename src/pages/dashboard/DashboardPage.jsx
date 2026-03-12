import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedProjects, deleteProject } from "../../utils/shared/projectStore";
import { formatCurrency, formatArea } from "../../utils/shared/formatHelpers";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import { Helmet } from "react-helmet-async";
import { SITE } from "../../config/constants";
import "./DashboardPage.css";

function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(getSavedProjects());
  }, []);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the project "${name}"?`)) {
      const success = deleteProject(id);
      if (success) {
        setProjects(getSavedProjects());
      }
    }
  };

  const handleLoad = (project) => {
    // Navigate to the calculator and pass the project data via router state
    navigate("/", { state: { loadProject: project } });
  };

  return (
    <>
      <Helmet>
        <title>Saved Projects | {SITE.name}</title>
        <meta name="description" content="View and manage your saved construction estimates and calculations." />
      </Helmet>

      <Sidebar activeTab="dashboard">
        <main className="dashboard-page-container">
          <div className="dashboard-header">
            <h1>📊 Total Projects</h1>
            <p>Manage your previously saved estimates and calculations.</p>
          </div>

          {!projects || projects.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Projects Found</h3>
              <p>You haven't saved any projects yet. Go to the Calculator to create and save a new estimate.</p>
              <button 
                className="dashboard-primary-btn"
                onClick={() => navigate("/")}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <>
              {/* --- SUMMARY STATS BAR --- */}
              <div className="dashboard-stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="stat-box">
                  <div className="stat-box-label">Total Projects</div>
                  <div className="stat-box-value">{projects.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Residential</div>
                  <div className="stat-box-value" style={{ color: 'var(--color-success, #38a169)' }}>
                    {projects.filter(p => !p.buildingType || p.buildingType === 'residential' || p.buildingType === 'residential_high_end').length}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Commercial</div>
                  <div className="stat-box-value" style={{ color: 'var(--color-warning, #d69e2e)' }}>
                    {projects.filter(p => p.buildingType && (p.buildingType === 'commercial' || p.buildingType === 'commercial_high_end' || p.buildingType === 'industrial')).length}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Gross Estimated Value</div>
                  <div className="stat-box-value highlight">
                    {formatCurrency(projects.reduce((sum, p) => sum + (p.results?.buildingCost?.totalCost || 0), 0))}
                  </div>
                </div>
              </div>

              {/* --- PROJECTS GRID --- */}
              <div className="dashboard-grid">
                {projects.map((project) => {
                const date = new Date(project.createdAt).toLocaleDateString("en-IN", {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute:'2-digit'
                });
                
                const area = project.inputs.length * project.inputs.breadth;
                const totalCost = project.results?.buildingCost?.totalCost || 0;

                return (
                  <div key={project.id} className="dashboard-card">
                    <div className="card-header">
                      <h3>{project.name}</h3>
                      <span className="card-date">{date}</span>
                    </div>
                    
                    <div className="card-body">
                      <div className="card-stat">
                        <span className="stat-label">Project Type:</span>
                        <span className="stat-value" style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                          {project.inputs.buildingType?.replace(/_/g, ' ') || "Residential"}
                        </span>
                      </div>
                      {project.clientName && (
                        <div className="card-stat">
                          <span className="stat-label">Client Name:</span>
                          <span className="stat-value">{project.clientName}</span>
                        </div>
                      )}
                      {project.engineerName && (
                        <div className="card-stat">
                          <span className="stat-label">Engineer:</span>
                          <span className="stat-value">{project.engineerName}</span>
                        </div>
                      )}
                      {project.phoneNumber && (
                        <div className="card-stat">
                          <span className="stat-label">Contact:</span>
                          <span className="stat-value">{project.phoneNumber}</span>
                        </div>
                      )}
                      {project.location && (
                        <div className="card-stat">
                          <span className="stat-label">Location:</span>
                          <span className="stat-value">{project.location}</span>
                        </div>
                      )}
                      <div className="card-stat">
                        <span className="stat-label">Total Area:</span>
                        <span className="stat-value">{formatArea(area, { includeUnit: false })} {project.unit || 'sq.ft'}</span>
                      </div>
                      <div className="card-stat">
                        <span className="stat-label">Estimated Cost:</span>
                        <span className="stat-value highlight">{formatCurrency(totalCost)}</span>
                      </div>
                      <div className="card-stat">
                        <span className="stat-label">Floors:</span>
                        <span className="stat-value">{project.inputs.floors}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="action-btn load-btn"
                        onClick={() => handleLoad(project)}
                      >
                        <span className="btn-icon">📂</span> Load
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        <span className="btn-icon">🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
        </main>
      </Sidebar>
    </>
  );
}

export default DashboardPage;
