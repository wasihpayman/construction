import axios from "axios";

const projectApi = axios.create({
  baseURL: "http://constraction.test/api",
});

projectApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add project ID to all requests if available
  const projectId = localStorage.getItem("active_project_id");
  if (projectId) {
    config.headers["X-Project-ID"] = projectId;
  }

  return config;
});

projectApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("active_project_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default projectApi;
