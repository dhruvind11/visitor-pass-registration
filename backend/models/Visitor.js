import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  organization: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    unique: true,
  },
  website: {
    type: String,
    trim: true,
  },
  checkInTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['registered', 'checked-in'],
    default: 'registered',
  },
  visitorId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Generate unique visitor ID before saving
visitorSchema.pre('save', async function(next) {
  if (!this.visitorId) {
    let visitorId;
    let isUnique = false;
    
    // Generate unique ID format: GTE-XXXXXX (6-digit number)
    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number (100000-999999)
      visitorId = `GTE-${randomNum}`;
      
      // Check if this ID already exists
      const existingVisitor = await mongoose.model('Visitor').findOne({ visitorId: visitorId });
      if (!existingVisitor) {
        isUnique = true;
      }
    }
    
    this.visitorId = visitorId;
  }
  next();
});


const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;

