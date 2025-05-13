import Medicine from '../models/medicine.model.js';

// Get all medicines for the authenticated user
export const getAllMedicines = async (req, res) => {
  try {
    const { isActive, frequency, name } = req.query;
    
    // Build query object
    const query = { userId: req.user._id };
    
    // Add optional filters if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (frequency) {
      query.frequency = frequency;
    }
    
    // Search by name (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    // Get pagination and sorting from middleware
    const { limit, skip } = req.pagination || { limit: 10, skip: 0 };
    const sort = req.sorting || { createdAt: -1 }; // Default sort by creation date
    
    // Count total documents for pagination
    const total = await Medicine.countDocuments(query);
    
    // Find medicines with filters, pagination and sorting
    const medicines = await Medicine.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      pagination: {
        page: skip / limit + 1,
        pages: Math.ceil(total / limit),
        limit
      },
      data: medicines
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching medicines',
      error: error.message
    });
  }
};

// Get a single medicine
export const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching medicine',
      error: error.message
    });
  }
};

// Create a new medicine
export const createMedicine = async (req, res) => {
  try {
    // Add the authenticated user's ID to the medicine data
    const medicineData = {
      ...req.body,
      userId: req.user._id
    };
    
    const medicine = new Medicine(medicineData);
    const newMedicine = await medicine.save();
    
    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: newMedicine
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error creating medicine',
      error: error.message
    });
  }
};

// Update a medicine
export const updateMedicine = async (req, res) => {
  try {
    // Find the medicine first to verify it exists and belongs to the user
    const existingMedicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!existingMedicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found or not authorized' 
      });
    }
    
    // Extract allowed fields from request body
    const { name, dosage, frequency, times, notes, isActive } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (times !== undefined) updateData.times = times;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update the medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating medicine',
      error: error.message
    });
  }
};

// Delete a medicine
export const deleteMedicine = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }

    // First check if the medicine exists and belongs to the user
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found or you are not authorized to delete it' 
      });
    }
    
    // Delete the medicine
    await Medicine.findByIdAndDelete(req.params.id);
    
    // Return success message with details of the deleted medicine
    res.status(200).json({ 
      success: true,
      message: 'Medicine deleted successfully',
      data: {
        id: medicine._id,
        name: medicine.name
      }
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    
    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine ID format',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting medicine',
      error: error.message
    });
  }
}; 