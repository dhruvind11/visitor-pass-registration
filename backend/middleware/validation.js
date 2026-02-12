import { body } from 'express-validator';

// Validation rules for visitor registration
const validateVisitorRegistration = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Title must be less than 20 characters'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name must be less than 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must be less than 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid mobile number'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

// Validation rules for visitor update
const validateVisitorUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Title must be less than 20 characters'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name must be less than 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must be less than 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('mobile')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid mobile number'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

// Validation rules for find my pass
const validateFindPass = [
  body('searchType')
    .trim()
    .notEmpty()
    .withMessage('Search type is required')
    .isIn(['mobile', 'visitorId'])
    .withMessage('Search type must be either "mobile" or "visitorId"'),
  
  body('searchValue')
    .trim()
    .notEmpty()
    .withMessage('Search value is required')
    .custom((value, { req }) => {
      const searchType = req.body.searchType;
      
      if (searchType === 'mobile') {
        // More flexible mobile number validation - just check it's not empty and has some digits
        const hasDigits = /\d/.test(value);
        if (!hasDigits || value.length < 5) {
          throw new Error('Please provide a valid mobile number');
        }
      } else if (searchType === 'visitorId') {
        // Validate visitor ID format (GTE-XXXXXX)
        const visitorIdRegex = /^GTE-\d{6}$/;
        if (!visitorIdRegex.test(value)) {
          throw new Error('Please provide a valid visitor ID (format: GTE-XXXXXX)');
        }
      }
      
      return true;
    }),
];

// Validation rules for scan pass
const validateScanPass = [
  body('visitorId')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !value.match(/^GTE-\d{6}$/)) {
        throw new Error('Invalid visitor ID format. Expected format: GTE-XXXXXX');
      }
      return true;
    }),
  
  body('qrCodeData')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('QR code data cannot be empty if provided'),
  
  // At least one of visitorId, qrCodeData, or image must be provided
  body().custom((value) => {
    if (!value.visitorId && !value.qrCodeData && !value.image) {
      throw new Error('Please provide either visitorId, qrCodeData, or image');
    }
    return true;
  }),
];

export {
  validateVisitorRegistration,
  validateVisitorUpdate,
  validateFindPass,
  validateScanPass,
};

