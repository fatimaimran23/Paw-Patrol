// routes/favoriteRoutes.js
const router    = require("express").Router();
const favorites = require("../controllers/favoriteController");
const protect   = require("../middleware/authMiddleware");

router.get   ("/",        protect, favorites.getFavorites);
router.post  ("/",        protect, favorites.addFavorite);
router.delete("/:petId",  protect, favorites.removeFavorite);

module.exports = router;
