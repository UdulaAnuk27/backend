// routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/authMiddleware");
const { bookTicket, getUserTickets } = require("../controllers/ticketController");

// Book ticket
router.post("/book", verifyUser, bookTicket);

// Get all tickets of logged-in user
router.get("/my-tickets", verifyUser, getUserTickets);

module.exports = router;
