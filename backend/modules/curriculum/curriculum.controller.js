import Curriculum from './curriculum.model.js';
import Subject from '../subjects/subjects.model.js';

// Get all curricula
export const getCurricula = async (req, res) => {
  try {
    const { program, effectiveYear, status } = req.query;
    const query = {};
    
    if (program) query.program = program;
    if (effectiveYear) query.effectiveYear = effectiveYear;
    if (status) query.status = status;

    const curricula = await Curriculum.find(query)
      .populate({
        path: 'subjects.subject',
        select: 'code name description units',
      })
      .populate({
        path: 'subjects.prerequisites',
        select: 'code name',
      })
      .sort({ effectiveYear: -1 });

    res.json({
      success: true,
      curricula,
    });
  } catch (error) {
    console.error('Error fetching curricula:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching curricula',
      error: error.message,
    });
  }
};

// Get curriculum by ID
export const getCurriculumById = async (req, res) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id)
      .populate({
        path: 'subjects.subject',
        select: 'code name description units offerings',
      })
      .populate({
        path: 'subjects.prerequisites',
        select: 'code name',
      });

    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found',
      });
    }

    res.json({
      success: true,
      curriculum,
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching curriculum',
      error: error.message,
    });
  }
};

// Get curriculum by program
export const getCurriculumByProgram = async (req, res) => {
  try {
    const { program } = req.params;
    const { effectiveYear } = req.query;

    const query = { program, status: 'Active' };
    if (effectiveYear) query.effectiveYear = effectiveYear;

    const curriculum = await Curriculum.findOne(query)
      .populate({
        path: 'subjects.subject',
        populate: {
          path: 'offerings.instructor',
          select: 'firstName lastName email',
        },
      })
      .populate({
        path: 'subjects.prerequisites',
        select: 'code name',
      })
      .sort({ effectiveYear: -1 });

    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'No active curriculum found for this program',
      });
    }

    res.json({
      success: true,
      curriculum,
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching curriculum',
      error: error.message,
    });
  }
};

// Create curriculum
export const createCurriculum = async (req, res) => {
  try {
    const curriculum = new Curriculum(req.body);
    await curriculum.save();

    res.status(201).json({
      success: true,
      message: 'Curriculum created successfully',
      curriculum,
    });
  } catch (error) {
    console.error('Error creating curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating curriculum',
      error: error.message,
    });
  }
};

// Update curriculum
export const updateCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found',
      });
    }

    res.json({
      success: true,
      message: 'Curriculum updated successfully',
      curriculum,
    });
  } catch (error) {
    console.error('Error updating curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating curriculum',
      error: error.message,
    });
  }
};

// Delete curriculum
export const deleteCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id);

    if (!curriculum) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum not found',
      });
    }

    res.json({
      success: true,
      message: 'Curriculum deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting curriculum',
      error: error.message,
    });
  }
};
