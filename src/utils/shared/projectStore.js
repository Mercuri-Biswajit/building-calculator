/**
 * projectStore.js
 * Utility for managing saved calculation projects in localStorage
 */

const STORAGE_KEY = 'bdb_saved_projects';

/**
 * Get all saved projects from local storage
 * @returns {Array} Array of project objects
 */
export const getSavedProjects = () => {
  try {
    const projects = localStorage.getItem(STORAGE_KEY);
    return projects ? JSON.parse(projects) : [];
  } catch (error) {
    console.error('Failed to parse saved projects:', error);
    return [];
  }
};

/**
 * Save a new project to local storage
 * @param {Object} projectData - The data of the project to save
 * @returns {Object} The saved project object with ID and timestamp
 */
export const saveProject = (projectData) => {
  try {
    const projects = getSavedProjects();
    
    // Create new project record
    const newProject = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...projectData
    };
    
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    
    return newProject;
  } catch (error) {
    console.error('Failed to save project:', error);
    return null;
  }
};

/**
 * Delete a project by ID
 * @param {string} id - The ID of the project to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteProject = (id) => {
  try {
    const projects = getSavedProjects();
    const initialLength = projects.length;
    const filteredProjects = projects.filter(p => p.id !== id);
    
    if (filteredProjects.length !== initialLength) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return false;
  }
};
