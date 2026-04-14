const router = require('express').Router();
const Club = require('../models/Club');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

// ── GET /api/clubs ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true })
      .populate('adminUser', 'name email')
      .sort({ name: 1 });
    res.json({ clubs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clubs.', error: err.message });
  }
});

// ── GET /api/clubs/:id ────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('adminUser', 'name email');
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ club });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch club.', error: err.message });
  }
});

// ── POST /api/clubs — Superadmin creates club ─────────────
router.post('/', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, description, logo, tags, foundedYear, adminEmail } = req.body;
    if (!name) return res.status(400).json({ message: 'Club name is required.' });

    let adminUser = null;
    if (adminEmail) {
      adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) return res.status(404).json({ message: `No user found with email: ${adminEmail}` });
    }

    const club = await Club.create({ name, description, logo, tags, foundedYear, adminUser: adminUser?._id });

    // Update that user's role and clubRef
    if (adminUser) {
      adminUser.role = 'club_admin';
      adminUser.clubRef = club._id;
      await adminUser.save();
    }

    const populated = await club.populate('adminUser', 'name email');
    res.status(201).json({ club: populated });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A club with this name already exists.' });
    res.status(500).json({ message: 'Failed to create club.', error: err.message });
  }
});

// ── PUT /api/clubs/:id — Superadmin or club admin updates club ─
router.put('/:id', protect, requireRole('superadmin', 'club_admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });

    // Club admin can only edit their own club
    if (req.user.role === 'club_admin') {
      const userClubId = req.user.clubRef?._id?.toString() || req.user.clubRef?.toString();
      if (userClubId !== req.params.id) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    const { name, description, logo, tags, foundedYear } = req.body;
    if (name) club.name = name;
    if (description !== undefined) club.description = description;
    if (logo !== undefined) club.logo = logo;
    if (tags) club.tags = tags;
    if (foundedYear) club.foundedYear = foundedYear;

    await club.save();
    res.json({ club });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update club.', error: err.message });
  }
});

// ── DELETE /api/clubs/:id — Superadmin deactivates club ──
router.delete('/:id', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    club.isActive = false;
    await club.save();
    res.json({ message: 'Club deactivated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate club.', error: err.message });
  }
});

module.exports = router;
