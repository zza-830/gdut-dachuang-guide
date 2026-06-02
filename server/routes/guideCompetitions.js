const express = require('express');
const router = express.Router();
const { getGuideCompetitions, getGuideCompetitionById } = require('../controllers/guideCompetitionController');

// Public routes - no auth required
router.get('/', getGuideCompetitions);
router.get('/:id', getGuideCompetitionById);

module.exports = router;
