import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedProjects, deleteProject } from "../../utils/shared/projectStore";
import { formatCurrency, formatArea } from "../../utils/shared/formatHelpers";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
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

      <DashboardLayout activeTab="dashboard">
        <main className="dashboard-page-container">
          <div className="dashboard-header">
            <h1>💾 Saved Projects</h1>
            <p>Manage your previously saved estimates and calculations.</p>
          </div>

          {projects.length === 0 ? (
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
          )}
        </main>
      </DashboardLayout>
    </>
  );
}

export default DashboardPage;
