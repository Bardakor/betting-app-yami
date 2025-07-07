const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/betting_main', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);
    
    const user = await User.findOne({ email: 'basquiat.liam@gmail.com' });
    
    if (user) {
      console.log('User found in MongoDB:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User not found in MongoDB');
    }
    
    // Also check total user count
    const count = await User.countDocuments();
    console.log(`\nTotal users in database: ${count}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();