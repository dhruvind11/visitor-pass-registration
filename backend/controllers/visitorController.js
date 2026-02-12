import Visitor from '../models/Visitor.js';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerVisitor = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const {
      title,
      firstName,
      lastName,
      organization,
      designation,
      email,
      mobile,
      website,
    } = req.body;

    // Check if mobile number already exists
    const existingMobile = await Visitor.findOne({ mobile: mobile });
    if (existingMobile) {
      throw new ApiError(
        409,
        "This mobile number is already registered. Please use a different mobile number."
      );
    }

    // Check if email already exists
    const existingEmail = await Visitor.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ApiError(
        409,
        "This email address is already registered. Please use a different email."
      );
    }

    // Create visitor
    const visitor = await Visitor.create({
      title,
      firstName,
      lastName,
      organization,
      designation,
      email,
      mobile,
      website,
    });
    
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            {
              visitorId: visitor.visitorId,
              title: visitor.title,
              firstName: visitor.firstName,
              lastName: visitor.lastName,
              organization: visitor.organization,
              designation: visitor.designation,
              email: visitor.email,
              mobile: visitor.mobile,
              website: visitor.website,
              status: visitor.status,
              createdAt: visitor.createdAt,
            },
            "Visitor registered successfully"
          )
        );
  } catch (error) {
    next(error);
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const visitors = await Visitor.find(query)
      .sort({ checkInTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Visitor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: visitors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitors',
      error: error.message,
    });
  }
};

const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor',
      error: error.message,
    });
  }
};

const updateVisitor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Visitor updated successfully',
      data: visitor,
    });
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visitor',
      error: error.message,
    });
  }
};

const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Visitor deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting visitor',
      error: error.message,
    });
  }
};


const findMyPass = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { searchType, searchValue } = req.body;

    let visitor;

    // Search by mobile number
    if (searchType === 'mobile') {
      visitor = await Visitor.findOne({ mobile: searchValue });
    }
    // Search by visitor ID
    else if (searchType === 'visitorId') {
      visitor = await Visitor.findOne({ visitorId: searchValue });
    }
    else {
      throw new ApiError(400, 'Invalid search type. Use "mobile" or "visitorId"');
    }

    if (!visitor) {
      throw new ApiError(404, 'Visitor pass not found. Please check your details and try again.');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, visitor, 'Visitor pass found successfully'));
  } catch (error) {
    next(error);
  }
};


const scanPass = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation failed", errors.array());
    }

    const { visitorId, qrCodeData } = req.body;
    let visitorIdToCheck = null;

    // Determine visitor ID from different input methods
    if (visitorId) {
      visitorIdToCheck = visitorId.trim();
    } else if (qrCodeData) {
      // QR code scanned - extract visitor ID from QR data
      // QR code format: GTE-XXXXXX or just the visitor ID
      visitorIdToCheck = qrCodeData.trim();
    } else {
      throw new ApiError(400, "Please provide either visitorId, qrCodeData, or image");
    }

    // Validate visitor ID format
    if (!visitorIdToCheck || !visitorIdToCheck.match(/^GTE-\d{6}$/)) {
      throw new ApiError(400, "Invalid visitor ID format. Expected format: GTE-XXXXXX");
    }
  console.log("visitorIdToCheck",visitorIdToCheck);
  
    // Find visitor by ID
    const visitor = await Visitor.findOne({ visitorId: visitorIdToCheck });
   console.log("visitor",visitor);
   
    if (!visitor) {
      return res.status(200).json(
        new ApiResponse(200, {
          isValid: false,
          visitor: null,
          message: "Invalid pass. Visitor not found."
        }, "Pass validation failed")
      );
    }

    // Check if visitor is already checked-in
    if (visitor.status === 'checked-in') {
      return res.status(200).json(
        new ApiResponse(200, {
          isValid: true,
          visitor: {
            visitorId: visitor.visitorId,
            firstName: visitor.firstName,
            lastName: visitor.lastName,
            email: visitor.email,
            organization: visitor.organization,
            designation: visitor.designation,
            status: visitor.status,
            checkInTime: visitor.checkInTime,
            createdAt: visitor.createdAt,
          },
        message: "User already check-in",
        toastType: "warning",
      }, "User already check-in")
      );
    }

    // Update status to checked-in and set check-in time
    visitor.status = 'checked-in';
    visitor.checkInTime = new Date();
    await visitor.save();

    return res.status(200).json(
      new ApiResponse(200, {
        isValid: true,
        visitor: {
          visitorId: visitor.visitorId,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          email: visitor.email,
          organization: visitor.organization,
          designation: visitor.designation,
          status: visitor.status,
          checkInTime: visitor.checkInTime,
          createdAt: visitor.createdAt,
        },
      message: "Pass scanned successfully. Visitor checked-in.",
      toastType: "success",
    }, "Pass is valid - Visitor checked-in")
    );
  } catch (error) {
    next(error);
  }
};


const getDashboardStats = async (req, res, next) => {
  try {
    // Get today's date range (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total Registered Visitors
    const totalRegistered = await Visitor.countDocuments({});

    // Total Entries Today (visitors checked-in today)
    const totalEntriesToday = await Visitor.countDocuments({
      status: 'checked-in',
      checkInTime: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Last Scan (most recent check-in)
    const lastScan = await Visitor.findOne({
      status: 'checked-in',
      checkInTime: { $exists: true }
    })
      .sort({ checkInTime: -1 })
      .select('checkInTime vitiorId firstName lastName');

    // Check-in Rate (percentage of registered visitors who have checked in)
    const totalCheckedIn = await Visitor.countDocuments({ status: 'checked-in' });
    const checkInRate = totalRegistered > 0 
      ? Math.round((totalCheckedIn / totalRegistered) * 100) 
      : 0;

    // Avg Scans per Visitor (total check-ins / total registered)
    // Since a visitor can only check-in once, this is essentially the same as check-in rate
    // But if you want to track multiple scans, you'd need a separate scan log
    const avgScansPerVisitor = totalRegistered > 0 
      ? (totalCheckedIn / totalRegistered).toFixed(2) 
      : '0';

    return res.status(200).json(
      new ApiResponse(200, {
        totalRegisteredVisitors: totalRegistered,
        totalEntriesToday: totalEntriesToday,
        lastScan: lastScan 
          ? {
              time: lastScan.checkInTime,
              visitorId: lastScan.visitorId,
              visitorName: `${lastScan.firstName} ${lastScan.lastName}`
            }
          : null,
        checkInRate: `${checkInRate}%`,
        avgScansPerVisitor: parseFloat(avgScansPerVisitor)
      }, "Dashboard statistics retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getVisitorByVisitorId = async (req, res, next) => {
  try {
    
    const visitor = await Visitor.findOne({ visitorId: req.params.visitorId });

    if (!visitor) {
      throw new ApiError(404, 'Visitor not found');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, visitor, 'Visitor found successfully'));
  } catch (error) {
    next(error);
  }
};


const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    if (visitor.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Visitor already checked out',
      });
    }

    visitor.status = 'checked-out';
    visitor.checkOutTime = new Date();
    await visitor.save();

    res.status(200).json({
      success: true,
      message: 'Visitor checked out successfully',
      data: visitor,
    });
  } catch (error) {
    console.error('Error checking out visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking out visitor',
      error: error.message,
    });
  }
};


export {
  registerVisitor,
  getAllVisitors,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  findMyPass,
  scanPass,
  getDashboardStats,
  getVisitorByVisitorId,
  checkOutVisitor,
};

