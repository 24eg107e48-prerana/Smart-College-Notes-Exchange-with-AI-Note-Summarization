import api from './api';

export const subjectService = {
  async getAllSubjects(department = null, semester = null) {
    const params = {};
    if (department && department !== 'All') params.department = department;
    if (semester && semester !== 'All') params.semester = semester;
    const response = await api.get('/subjects', { params });
    return response.data;
  },
};
