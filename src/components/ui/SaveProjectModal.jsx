import React, { useState } from "react";
import { Button } from "./Button";
import "./SaveProjectModal.css";

export function SaveProjectModal({ isOpen, onClose, onSave, defaultName }) {
  const [formData, setFormData] = useState({
    projectName: defaultName || "",
    clientName: "",
    location: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      alert("Project Name is required.");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="sys-modal-overlay">
      <div className="sys-modal-content">
        <div className="sys-modal-header">
          <h3>💾 Save Estimate</h3>
          <button className="sys-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="sys-modal-form">
          <div className="calc-form-group">
            <label className="calc-label-primary">Project Name *</label>
            <input
              type="text"
              name="projectName"
              className="calc-input-primary"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g. 1200 sqft Duplex"
              required
            />
          </div>
          <div className="calc-form-group">
            <label className="calc-label-primary">Client Name (Optional)</label>
            <input
              type="text"
              name="clientName"
              className="calc-input-primary"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="e.g. Mr. Sharma"
            />
          </div>
          <div className="calc-form-group">
            <label className="calc-label-primary">Location/Address (Optional)</label>
            <input
              type="text"
              name="location"
              className="calc-input-primary"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Raiganj, WB"
            />
          </div>
          <div className="calc-form-group">
            <label className="calc-label-primary">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              className="calc-input-primary"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any specific requests or details..."
              rows={3}
            />
          </div>
          <div className="sys-modal-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
