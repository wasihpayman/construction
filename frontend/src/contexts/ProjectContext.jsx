import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Load active project from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem("active_project");
    const savedProjectId = localStorage.getItem("active_project_id");
    
    if (savedProject && savedProjectId) {
      try {
        setActiveProject(JSON.parse(savedProject));
        setActiveProjectId(parseInt(savedProjectId));
      } catch (error) {
        console.error("Error loading saved project:", error);
        clearActiveProject();
      }
    }
  }, []);

  const selectProject = (project) => {
    setActiveProject(project);
    setActiveProjectId(project.id);
    localStorage.setItem("active_project", JSON.stringify(project));
    localStorage.setItem("active_project_id", project.id.toString());
  };

  const clearActiveProject = () => {
    setActiveProject(null);
    setActiveProjectId(null);
    localStorage.removeItem("active_project");
    localStorage.removeItem("active_project_id");
  };

  const value = {
    activeProject,
    activeProjectId,
    selectProject,
    clearActiveProject,
    hasActiveProject: !!activeProjectId
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
