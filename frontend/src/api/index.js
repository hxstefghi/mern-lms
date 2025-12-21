import api from './axios';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
};

// Students API
export const studentsAPI = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  getStudentByUserId: (userId) => api.get(`/students/user/${userId}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  getAcademicHistory: (id) => api.get(`/students/${id}/academic-history`),
  addAcademicHistory: (id, historyData) =>
    api.post(`/students/${id}/academic-history`, historyData),
};

// Subjects API
export const subjectsAPI = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  updateSubject: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
  getSubjectOfferings: (id, params) => api.get(`/subjects/${id}/offerings`, { params }),
  addSubjectOffering: (id, offeringData) => api.post(`/subjects/${id}/offerings`, offeringData),
  updateSubjectOffering: (id, offeringId, offeringData) =>
    api.put(`/subjects/${id}/offerings/${offeringId}`, offeringData),
  deleteSubjectOffering: (id, offeringId) => api.delete(`/subjects/${id}/offerings/${offeringId}`),
  getAvailableOfferings: (params) => api.get('/subjects/offerings/available', { params }),

  // Offering announcements/materials
  getOfferingAnnouncements: (subjectId, offeringId) =>
    api.get(`/subjects/${subjectId}/offerings/${offeringId}/announcements`),
  postOfferingAnnouncement: (subjectId, offeringId, data) =>
    api.post(`/subjects/${subjectId}/offerings/${offeringId}/announcements`, data),
  deleteOfferingAnnouncement: (subjectId, offeringId, announcementId) =>
    api.delete(`/subjects/${subjectId}/offerings/${offeringId}/announcements/${announcementId}`),

  getOfferingMaterials: (subjectId, offeringId) =>
    api.get(`/subjects/${subjectId}/offerings/${offeringId}/materials`),
  postOfferingMaterial: (subjectId, offeringId, data) =>
    api.post(`/subjects/${subjectId}/offerings/${offeringId}/materials`, data),
  deleteOfferingMaterial: (subjectId, offeringId, materialId) =>
    api.delete(`/subjects/${subjectId}/offerings/${offeringId}/materials/${materialId}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getEnrollments: (params) => api.get('/enrollments', { params }),
  getEnrollmentById: (id) => api.get(`/enrollments/${id}`),
  getStudentEnrollments: (studentId) => api.get(`/enrollments/student/${studentId}`),
  createEnrollment: (enrollmentData) => api.post('/enrollments', enrollmentData),
  updateEnrollmentStatus: (id, statusData) => api.put(`/enrollments/${id}/status`, statusData),
  dropSubject: (id, subjectData) => api.put(`/enrollments/${id}/drop-subject`, subjectData),
  deleteEnrollment: (id) => api.delete(`/enrollments/${id}`),
};

// Registration API
export const registrationAPI = {
  getRegistrationCard: (enrollmentId) => api.get(`/registration/${enrollmentId}`),
  getRegistrationCardByStudent: (studentId, params) =>
    api.get(`/registration/student/${studentId}`, { params }),
};

// Tuition API
export const tuitionAPI = {
  getTuitions: (params) => api.get('/tuitions', { params }),
  getTuitionById: (id) => api.get(`/tuitions/${id}`),
  getTuitionByEnrollment: (enrollmentId) => api.get(`/tuitions/enrollment/${enrollmentId}`),
  getStudentTuitions: (studentId) => api.get(`/tuitions/student/${studentId}`),
  createTuition: (tuitionData) => api.post('/tuitions', tuitionData),
  addPayment: (id, paymentData) => api.post(`/tuitions/${id}/payments`, paymentData),
  updateTuition: (id, tuitionData) => api.put(`/tuitions/${id}`, tuitionData),
  deleteTuition: (id) => api.delete(`/tuitions/${id}`),
};

// Programs API
export const programsAPI = {
  getPrograms: (params) => api.get('/programs', { params }),
  getProgramById: (id) => api.get(`/programs/${id}`),
  createProgram: (programData) => api.post('/programs', programData),
  updateProgram: (id, programData) => api.put(`/programs/${id}`, programData),
  deleteProgram: (id) => api.delete(`/programs/${id}`),
  getProgramStats: (id) => api.get(`/programs/${id}/stats`),
  updateEnrollmentCount: (id, data) => api.patch(`/programs/${id}/enrollment`, data),
};

// Curriculum API
export const curriculumAPI = {
  getCurricula: (params) => api.get('/curriculum', { params }),
  getCurriculumById: (id) => api.get(`/curriculum/${id}`),
  getCurriculumByProgram: (program, params) => api.get(`/curriculum/program/${program}`, { params }),
  createCurriculum: (curriculumData) => api.post('/curriculum', curriculumData),
  updateCurriculum: (id, curriculumData) => api.put(`/curriculum/${id}`, curriculumData),
  deleteCurriculum: (id) => api.delete(`/curriculum/${id}`),
};
