// Format validation errors
export const formatValidationErrors = (errors) => {
  return errors.array().map((error) => ({
    field: error.param,
    message: error.msg,
  }));
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Calculate GPA
export const calculateGPA = (academicHistory) => {
  const completedSubjects = academicHistory.filter(
    (item) => item.grade && item.remarks === 'Passed'
  );

  if (completedSubjects.length === 0) return 0;

  const totalGrade = completedSubjects.reduce((sum, item) => sum + item.grade, 0);
  return (totalGrade / completedSubjects.length).toFixed(2);
};

// Get current school year
export const getCurrentSchoolYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-indexed

  // School year typically starts in August/September
  if (currentMonth >= 8) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

// Get current semester
export const getCurrentSemester = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 0-indexed

  // Typical semester breakdown:
  // August-December: 1st Semester
  // January-May: 2nd Semester
  // June-July: Summer
  if (currentMonth >= 8 && currentMonth <= 12) {
    return '1st';
  } else if (currentMonth >= 1 && currentMonth <= 5) {
    return '2nd';
  } else {
    return 'Summer';
  }
};

// Paginate results
export const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {
    data: data.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(data.length / limit),
    totalItems: data.length,
  };

  return results;
};
