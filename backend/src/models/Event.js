import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the event'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  club: {
    type: String,
    required: [true, 'Please provide the organizing club'],
  },
  category: {
    type: String,
    required: [true, 'Please provide an event category'],
  },
  teamSize: {
    type: Number,
    required: [true, 'Please specify the exact team size or 1 for individual events'],
    default: 1,
  },
  maxTeams: {
    type: Number,
    required: [true, 'Please provide maximum number of teams/participants'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a registration deadline'],
  },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);