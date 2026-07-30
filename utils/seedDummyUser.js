const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ek dummy user create karta hai, sirf agar already exist nahi karta
const seedDummyUser = async () => {
  try {
    const existingUser = await User.findOne({ email: "amit@test.com" });

    if (existingUser) {
      console.log("Dummy user already exists, skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash("test123", 10);

    const dummyUser = new User({
      employeeId: "EMP001",
      firstName: "Amit",
      lastName: "Mishra",
      email: "amit@test.com",
      password: hashedPassword,
      role: "Admin",
    });

    await dummyUser.save();
    console.log("Dummy user created: amit@test.com / test123");
  } catch (error) {
    console.log("Error seeding dummy user:", error.message);
  }
};

module.exports = seedDummyUser;