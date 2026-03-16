const express = require('express');
const router = express.Router();
const { getCompetitions, getCompetitionById, getReviewList, submitReview } = require('../controllers/competitionController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - no auth required
router.get('/', getCompetitions);

// Admin-only: review queue (must be before /:id to avoid route conflict)
router.get('/review/list', authenticate, isAdmin, getReviewList);
router.put('/:id/review', authenticate, isAdmin, submitReview);

router.get('/:id', getCompetitionById);

module.exports = router;
