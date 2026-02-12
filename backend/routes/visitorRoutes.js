import express from 'express';
const router = express.Router();
import {
  registerVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorByVisitorId,
  findMyPass,
  scanPass,
  getDashboardStats,
  checkOutVisitor,
  updateVisitor,
  deleteVisitor,
} from '../controllers/visitorController.js';
import { validateVisitorRegistration, validateVisitorUpdate, validateFindPass, validateScanPass } from '../middleware/validation.js';


router.post('/register', validateVisitorRegistration, registerVisitor);
router.post('/find-pass', validateFindPass, findMyPass);
router.post('/scan', validateScanPass, scanPass);
router.get('/dashboard', getDashboardStats);
router.get('/', getAllVisitors);
router.get('/id/:visitorId', getVisitorByVisitorId);
router.get('/:id', getVisitorById);
router.put('/:id', validateVisitorUpdate, updateVisitor);
router.put('/:id/checkout', checkOutVisitor);
router.delete('/:id', deleteVisitor);

export default router;

