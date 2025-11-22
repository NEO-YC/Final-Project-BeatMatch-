const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false },
  birthday:  { type: Date, required: true },
  phone:     { type: String, required: false, trim: true },
  isMusician:{ type: Boolean, default: true },

  musicianProfile: {
    type: [{
      instrument:       { type: String, trim: true },
      musictype:        { type: String, trim: true },
      experienceYears:  { type: String, trim: true },
      profilePicture:   { type: String, trim: true },
      eventTypes:       [{ type: String, trim: true }],
      bio:              { type: String, trim: true },
      location:         [{ type: String, trim: true }],
      galleryPictures:  [{ type: String, trim: true }],
      galleryVideos:    [{ type: String, trim: true }],

      availability: {
        type: [{
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
          from:   { type: String, trim: true },
          to:     { type: String, trim: true },
          day:    { type: String, trim: true }
        }],
        default: []
      }
    }],
    default: []
  }

}, {
  timestamps: true
});




module.exports = mongoose.model('P-users', userSchema);
