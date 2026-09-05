// routes/anchorRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAnchorItem,
  getAllAnchorItems,
  getItemsByCategory,
  updateAnchorItem,
  deleteAnchorItem,
  trackUsage,
} = require('../controllers/anchorController');
const { requireAuth } = require('../middleware/auth');

// All anchor routes require authentication
router.use(requireAuth);

router.get('/', getAllAnchorItems);
router.post('/', createAnchorItem);
router.get('/:category', getItemsByCategory);
router.put('/:id', updateAnchorItem);
router.delete('/:id', deleteAnchorItem);
router.post('/use/:id', trackUsage);

module.exports = router;