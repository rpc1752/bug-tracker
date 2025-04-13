import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Team from "../models/Team.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bug-tracker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function makeUserAdmin() {
  try {
    // Find the user by email
    const user = await User.findOne({ email: "rpc@gmail.com" });

    if (!user) {
      console.error("User not found with email rpc@gmail.com");
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Get all teams
    const teams = await Team.find({});
    let updatedCount = 0;

    for (const team of teams) {
      // Check if user is already a member of this team
      const memberIndex = team.members.findIndex(
        (member) => member.user.toString() === user._id.toString()
      );

      if (memberIndex !== -1) {
        const currentRole = team.members[memberIndex].role;

        if (currentRole !== "admin") {
          // Update the user's role to admin
          team.members[memberIndex].role = "admin";
          await team.save();

          console.log(
            `Updated user role from ${currentRole} to admin in team: ${team.name}`
          );
          updatedCount++;
        } else {
          console.log(`User is already admin in team: ${team.name}`);
        }
      } else {
        // Add user as admin to this team
        team.members.push({
          user: user._id,
          role: "admin",
          joinedAt: new Date(),
        });

        // Add team to user's teams if not already there
        if (!user.teams.includes(team._id)) {
          user.teams.push(team._id);
        }

        await team.save();
        console.log(`Added user as admin to team: ${team.name}`);
        updatedCount++;
      }
    }

    // Save the user with updated teams
    await user.save();

    console.log(`\nOperation completed. Updated ${updatedCount} teams.`);
    console.log(
      `The user ${user.name} (${user.email}) is now an admin in all teams.`
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the script
makeUserAdmin();
