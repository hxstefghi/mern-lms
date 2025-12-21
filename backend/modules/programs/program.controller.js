import Program from './program.model.js';

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
export const getPrograms = async (req, res, next) => {
  try {
    const { status, department, degree, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (degree) filter.degree = degree;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const programs = await Program.find(filter).sort({ code: 1 });

    res.json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
export const getProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create program
// @route   POST /api/programs
// @access  Private (Admin only)
export const createProgram = async (req, res, next) => {
  try {
    const program = await Program.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Program code already exists',
      });
    }
    next(error);
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin only)
export const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin only)
export const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get program statistics
// @route   GET /api/programs/:id/stats
// @access  Private
export const getProgramStats = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    const stats = {
      totalCapacity: program.capacity,
      enrolledStudents: program.enrolledStudents,
      availableSlots: program.availableSlots,
      occupancyRate: program.capacity > 0 
        ? ((program.enrolledStudents / program.capacity) * 100).toFixed(2) 
        : 0,
      status: program.status,
      tuitionFee: program.tuitionFee,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update program enrollment count
// @route   PATCH /api/programs/:id/enrollment
// @access  Private
export const updateEnrollmentCount = async (req, res, next) => {
  try {
    const { increment } = req.body; // true to add, false to subtract

    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    if (increment) {
      if (program.enrolledStudents >= program.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Program has reached maximum capacity',
        });
      }
      program.enrolledStudents += 1;
    } else {
      if (program.enrolledStudents > 0) {
        program.enrolledStudents -= 1;
      }
    }

    await program.save();

    res.json({
      success: true,
      message: 'Enrollment count updated successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};
