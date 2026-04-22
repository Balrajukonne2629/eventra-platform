import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'eventId is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    teamName: {
      type: String,
      required: [true, 'teamName is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'rollNumber is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'department is required'],
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

RegistrationSchema.index({ eventId: 1, teamName: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
