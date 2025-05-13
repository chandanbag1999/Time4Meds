import Medicine from '../models/medicine.model.js';

// Get all medicines for the authenticated user
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      count: medicines.length,
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
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found or not authorized' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error updating medicine',
      error: error.message
    });
  }
};

// Delete a medicine
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found or not authorized' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting medicine',
      error: error.message
    });
  }
}; 