// routes/reportRoutes.js
const router  = require("express").Router();
const reports = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");

router.get   ("/",              protect, reports.getReports);
router.post  ("/",              protect, reports.createReport);
router.patch ("/:id/assign",    protect, reports.assignHandler);   // ngo only
router.patch ("/:id/status",    protect, reports.updateStatus);    // ngo only

module.exports = router;
