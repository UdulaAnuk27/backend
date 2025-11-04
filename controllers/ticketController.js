const Ticket = require("../models/Ticket");
const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const QRCode = require("qrcode");

// Book ticket
exports.bookTicket = async (req, res) => {
  try {
    const { event_title, event_date, venue, tickets_count, total_price } = req.body;
    const user_id = req.user.id; // Logged-in user ID from JWT

    if (!event_title || !event_date || !venue || !tickets_count || !total_price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch user with details
    const user = await User.findByPk(user_id, {
      include: [{ model: UserDetails, as: "details" }],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create ticket
    const ticket = await Ticket.create({
      user_id,
      event_title,
      event_date,
      venue,
      tickets_count,
      total_price,
      status: "Paid",
    });

    // Generate QR code
    const qrData = `
Ticket ID: ${ticket.id}
Event: ${event_title}
Date: ${event_date}
Venue: ${venue}
Tickets: ${tickets_count}
Price: Rs.${total_price}

User:
Name: ${user.first_name} ${user.last_name}
Email: ${user.details?.email || "N/A"}
Mobile: ${user.mobile}
`;
    const qrCodeImage = await QRCode.toDataURL(qrData);
    ticket.qr_code = qrCodeImage;
    await ticket.save();

    // Send ticket + user info in response
    res.status(201).json({
      message: "Ticket booked successfully",
      ticket,
      user: {
        name: user.first_name + " " + user.last_name,
        email: user.details?.email || "N/A",
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get logged-in user tickets
exports.getUserTickets = async (req, res) => {
  try {
    const user_id = req.user.id;

    const tickets = await Ticket.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "mobile"],
          include: [{ model: UserDetails, as: "details", attributes: ["email"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const formattedTickets = tickets.map((t) => ({
      ...t.toJSON(),
      user_name: t.user.first_name + " " + t.user.last_name,
      user_email: t.user.details?.email,
    }));

    res.status(200).json(formattedTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
