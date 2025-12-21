import asyncHandler from 'express-async-handler';
import Subject from './subjects.model.js';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = asyncHandler(async (req, res) => {
  const { search, program, yearLevel, page = 1, limit = 10 } = req.query;

  const query = {};

  if (program) query.program = program;
  if (yearLevel) query.yearLevel = yearLevel;

  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const subjects = await Subject.find(query)
    .populate('prerequisites', 'code name')
    .populate('offerings.instructor', 'firstName lastName middleName')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ code: 1 });

  const count = await Subject.countDocuments(query);

  res.json({
    subjects,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalSubjects: count,
  });
});

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('prerequisites', 'code name units')
    .populate('offerings.instructor', 'firstName lastName middleName email');

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  res.json(subject);
});

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
export const createSubject = asyncHandler(async (req, res) => {
  const { code, name, description, units, program, yearLevel, prerequisites } = req.body;

  // Check if subject code already exists
  const subjectExists = await Subject.findOne({ code: code.toUpperCase() });
  if (subjectExists) {
    res.status(400);
    throw new Error('Subject code already exists');
  }

  const subject = await Subject.create({
    code: code.toUpperCase(),
    name,
    description,
    units,
    program,
    yearLevel,
    prerequisites,
  });

  const populatedSubject = await Subject.findById(subject._id).populate(
    'prerequisites',
    'code name'
  );

  res.status(201).json(populatedSubject);
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const { code, name, description, units, program, yearLevel, prerequisites } = req.body;

  // Check if code is being changed and if it's already taken
  if (code && code.toUpperCase() !== subject.code) {
    const codeExists = await Subject.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      res.status(400);
      throw new Error('Subject code already exists');
    }
    subject.code = code.toUpperCase();
  }

  subject.name = name || subject.name;
  subject.description = description !== undefined ? description : subject.description;
  subject.units = units || subject.units;
  subject.program = program || subject.program;
  subject.yearLevel = yearLevel || subject.yearLevel;
  subject.prerequisites = prerequisites || subject.prerequisites;

  const updatedSubject = await subject.save();

  const populatedSubject = await Subject.findById(updatedSubject._id).populate(
    'prerequisites',
    'code name'
  );

  res.json(populatedSubject);
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  await subject.deleteOne();

  res.json({ message: 'Subject removed' });
});

// @desc    Get subject offerings
// @route   GET /api/subjects/:id/offerings
// @access  Private
export const getSubjectOfferings = asyncHandler(async (req, res) => {
  const { schoolYear, semester } = req.query;

  const subject = await Subject.findById(req.params.id).populate(
    'offerings.instructor',
    'firstName lastName middleName'
  );

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  let offerings = subject.offerings;

  // Filter by school year and semester if provided
  if (schoolYear) {
    offerings = offerings.filter((offering) => offering.schoolYear === schoolYear);
  }
  if (semester) {
    offerings = offerings.filter((offering) => offering.semester === semester);
  }

  res.json(offerings);
});

// @desc    Add subject offering
// @route   POST /api/subjects/:id/offerings
// @access  Private/Admin
export const addSubjectOffering = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const { schoolYear, semester, instructor, schedule, room, capacity } = req.body;

  // Check for schedule conflicts
  const existingOffering = subject.offerings.find(
    (offering) => offering.schoolYear === schoolYear && offering.semester === semester
  );

  if (existingOffering) {
    res.status(400);
    throw new Error('Offering already exists for this school year and semester');
  }

  subject.offerings.push({
    schoolYear,
    semester,
    instructor,
    schedule,
    room,
    capacity: capacity || 40,
    enrolled: 0,
    isOpen: true,
  });

  await subject.save();

  const updatedSubject = await Subject.findById(subject._id).populate(
    'offerings.instructor',
    'firstName lastName middleName'
  );

  res.status(201).json(updatedSubject.offerings);
});

// @desc    Update subject offering
// @route   PUT /api/subjects/:id/offerings/:offeringId
// @access  Private/Admin
export const updateSubjectOffering = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const offering = subject.offerings.id(req.params.offeringId);

  if (!offering) {
    res.status(404);
    throw new Error('Offering not found');
  }

  const { instructor, schedule, room, capacity, isOpen } = req.body;

  if (instructor) offering.instructor = instructor;
  if (schedule) offering.schedule = schedule;
  if (room) offering.room = room;
  if (capacity) offering.capacity = capacity;
  if (isOpen !== undefined) offering.isOpen = isOpen;

  await subject.save();

  const updatedSubject = await Subject.findById(subject._id).populate(
    'offerings.instructor',
    'firstName lastName middleName'
  );

  res.json(updatedSubject.offerings);
});

// @desc    Delete subject offering
// @route   DELETE /api/subjects/:id/offerings/:offeringId
// @access  Private/Admin
export const deleteSubjectOffering = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const offering = subject.offerings.id(req.params.offeringId);

  if (!offering) {
    res.status(404);
    throw new Error('Offering not found');
  }

  // Check if students are enrolled
  if (offering.enrolled > 0) {
    res.status(400);
    throw new Error('Cannot delete offering with enrolled students');
  }

  offering.deleteOne();
  await subject.save();

  res.json({ message: 'Offering removed' });
});

// @desc    Get available offerings for enrollment
// @route   GET /api/subjects/offerings/available
// @access  Private/Student
export const getAvailableOfferings = asyncHandler(async (req, res) => {
  const { schoolYear, semester, program, yearLevel } = req.query;

  if (!schoolYear || !semester) {
    res.status(400);
    throw new Error('School year and semester are required');
  }

  const query = {};
  if (program) query.program = program;
  if (yearLevel) query.yearLevel = yearLevel;

  const subjects = await Subject.find(query)
    .populate('prerequisites', 'code name')
    .populate('offerings.instructor', 'firstName lastName middleName');

  // Filter subjects to only include the specified offering
  const availableSubjects = subjects
    .map((subject) => {
      const offering = subject.offerings.find(
        (off) =>
          off.schoolYear === schoolYear &&
          off.semester === semester &&
          off.isOpen &&
          off.enrolled < off.capacity
      );

      if (offering) {
        return {
          ...subject.toObject(),
          currentOffering: offering,
        };
      }
      return null;
    })
    .filter((subject) => subject !== null);

  res.json(availableSubjects);
});

const assertInstructorOwnsOffering = (req, offering) => {
  if (req.user?.role !== 'instructor') return;
  if (!offering?.instructor) {
    const err = new Error('Offering instructor is not assigned');
    err.statusCode = 403;
    throw err;
  }
  if (String(offering.instructor) !== String(req.user._id)) {
    const err = new Error('Not authorized to modify this offering');
    err.statusCode = 403;
    throw err;
  }
};

const getSubjectAndOffering = async (req) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }

  const offering = subject.offerings.id(req.params.offeringId);
  if (!offering) {
    const err = new Error('Offering not found');
    err.statusCode = 404;
    throw err;
  }

  return { subject, offering };
};

// @desc    Get announcements for a subject offering
// @route   GET /api/subjects/:id/offerings/:offeringId/announcements
// @access  Private
export const getOfferingAnnouncements = asyncHandler(async (req, res) => {
  const { offering } = await getSubjectAndOffering(req);
  res.json({ announcements: offering.announcements || [] });
});

// @desc    Create announcement for a subject offering
// @route   POST /api/subjects/:id/offerings/:offeringId/announcements
// @access  Private/Instructor/Admin
export const createOfferingAnnouncement = asyncHandler(async (req, res) => {
  const { subject, offering } = await getSubjectAndOffering(req);
  assertInstructorOwnsOffering(req, offering);

  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  offering.announcements.unshift({ title, content, date: new Date() });
  await subject.save();

  res.status(201).json({ announcements: offering.announcements });
});

// @desc    Delete announcement from a subject offering
// @route   DELETE /api/subjects/:id/offerings/:offeringId/announcements/:announcementId
// @access  Private/Instructor/Admin
export const deleteOfferingAnnouncement = asyncHandler(async (req, res) => {
  const { subject, offering } = await getSubjectAndOffering(req);
  assertInstructorOwnsOffering(req, offering);

  const announcement = offering.announcements.id(req.params.announcementId);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  announcement.deleteOne();
  await subject.save();

  res.json({ announcements: offering.announcements });
});

// @desc    Get materials for a subject offering
// @route   GET /api/subjects/:id/offerings/:offeringId/materials
// @access  Private
export const getOfferingMaterials = asyncHandler(async (req, res) => {
  const { offering } = await getSubjectAndOffering(req);
  res.json({ materials: offering.materials || [] });
});

// @desc    Create material for a subject offering
// @route   POST /api/subjects/:id/offerings/:offeringId/materials
// @access  Private/Instructor/Admin
export const createOfferingMaterial = asyncHandler(async (req, res) => {
  const { subject, offering } = await getSubjectAndOffering(req);
  assertInstructorOwnsOffering(req, offering);

  const { title, type = 'link', url, description = '' } = req.body;
  if (!title || !url) {
    res.status(400);
    throw new Error('Title and url are required');
  }

  offering.materials.unshift({ title, type, url, description, uploadDate: new Date() });
  await subject.save();

  res.status(201).json({ materials: offering.materials });
});

// @desc    Delete material from a subject offering
// @route   DELETE /api/subjects/:id/offerings/:offeringId/materials/:materialId
// @access  Private/Instructor/Admin
export const deleteOfferingMaterial = asyncHandler(async (req, res) => {
  const { subject, offering } = await getSubjectAndOffering(req);
  assertInstructorOwnsOffering(req, offering);

  const material = offering.materials.id(req.params.materialId);
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }

  material.deleteOne();
  await subject.save();

  res.json({ materials: offering.materials });
});
