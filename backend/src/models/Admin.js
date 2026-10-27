
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./src/models/Admin");

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing");
    }

    if (process.env.ADMIN_PASSWORD.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        $set: {
          name: "Lucky",
          password: hashedPassword,
          role: "admin",
        },
        $setOnInsert: {
          email,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Admin credentials configured successfully.");
    console.log("Admin email:", admin.email);
    console.log("Password updated: yes");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
