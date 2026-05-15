// routes/adoptionRoutes.js
const router   = require("express").Router();
const adoption = require("../controllers/adoptionController");
const protect  = require("../middleware/authMiddleware");

router.get   ("/",    protect, adoption.getAdoptions);
router.post  ("/",    protect, adoption.createAdoption);
router.patch ("/:id", protect, adoption.updateAdoptionStatus);

module.exports = router;
