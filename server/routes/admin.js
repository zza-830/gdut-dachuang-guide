const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { getUsers, deleteUser } = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
