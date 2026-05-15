// routes/petRoutes.js
const router  = require("express").Router();
const pets    = require("../controllers/petController");
const protect = require("../middleware/authMiddleware");

// /api/pets/categories  MUST come before /api/pets/:id
router.get("/categories",    pets.getCategories);

router.get   ("/",    pets.getPets);
router.get   ("/:id", pets.getPetById);
router.post  ("/",    protect, pets.createPet);     // shop_owner / ngo only
router.put   ("/:id", protect, pets.updatePet);
router.delete("/:id", protect, pets.deletePet);

module.exports = router;
