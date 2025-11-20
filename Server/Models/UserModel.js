const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  birthday: {
    type: Date,
    required: true
  },
  phone: {
    type: String,
    default: null,
  }, 
}, {
  timestamps: true 
});



module.exports=mongoose.model('P-users', userSchema);



//for Postman register test
// {
//   "firstname": "Daniel",
//   "lastname": "Nisan",
//   "email": "Daniel@example.com",
//   "password": "12xx345678",
//   "birthday": "1997-04-17"
// }
