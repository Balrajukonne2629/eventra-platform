const mongoose = require('mongoose');

async function run() {
  await mongoose.connect("mongodb+srv://balrajukonne_db_user:******%402026@cluster0.defiblo.mongodb.net/eventraDB?retryWrites=true&w=majority");

  const EventSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    club: { type: String },
    category: { type: String },
    teamSize: { type: Number, default: 1 },
    maxTeams: { type: Number },
    deadline: { type: Date }
  });

  const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

  const sampleEventData = {
    title: "Test Event",
    description: "Testing event creation",
    club: "CSI",
    category: "Technical",
    teamSize: 2,
    maxTeams: 10,
    deadline: new Date("2026-04-20"),
  };

  try {
    const createdEvent = await Event.create(sampleEventData);
    console.log("SUCCESS:", createdEvent);
  } catch (err) {
    console.error("CREATE ERROR:", err);
  }

  process.exit(0);
}

run();
