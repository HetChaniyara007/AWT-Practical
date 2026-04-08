import Event from '../models/Event.js';
import '../models/Club.js';

// @desc    Fetch all events (with filtering)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'published'; // Default to published for public view

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query).sort({ start_datetime: 1 }).populate('club_id', 'name logo_url');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('created_by', 'name')
      .populate('club_id', 'name description logo_url');
      
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin or ClubAdmin
export const createEvent = async (req, res) => {
  try {
    const {
      title, description, banner_url, category, tags, venue,
      start_datetime, end_datetime, registration_deadline,
      max_capacity, is_paid, price, club_id, status
    } = req.body;

    const event = new Event({
      title,
      description,
      banner_url,
      category,
      tags: tags || [],
      venue,
      start_datetime,
      end_datetime,
      registration_deadline,
      max_capacity,
      is_paid,
      price,
      status: status || 'draft',
      created_by: req.user._id,
      club_id: club_id || null
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin or ClubAdmin
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if user is super admin or the creator
      if (req.user.role !== 'super_admin' && event.created_by.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      Object.assign(event, req.body);
      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin or ClubAdmin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (req.user.role !== 'super_admin' && event.created_by.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await event.deleteOne();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
