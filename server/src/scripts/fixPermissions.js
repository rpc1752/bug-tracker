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

async function fixPermissions() {
  try {
    // Find the user by email
    const email = "rpc@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User not found with email ${email}. Creating new user...`);

      // Create user if it doesn't exist
      const newUser = new User({
        email,
        name: "RPC User",
        password: "password123", // This will be hashed by the model
        role: "admin",
      });

      await newUser.save();
      console.log(`Created new user: ${newUser.name} (${newUser._id})`);

      // Continue with the newly created user
      return fixPermissions();
    }

    console.log(`Found user: ${user.name} (${user._id})`);
    console.log(
      `User's current teams: ${
        user.teams.length ? user.teams.join(", ") : "None"
      }`
    );

    // Get all teams
    const teams = await Team.find({});
    console.log(`Found ${teams.length} teams in the database`);

    if (teams.length === 0) {
      // Create a new team if none exist
      console.log("No teams found. Creating a new team...");

      const newTeam = new Team({
        name: "Default Team",
        description: "Default team created by permission fix script",
        owner: user._id,
        members: [
          {
            user: user._id,
            role: "admin",
            joinedAt: new Date(),
          },
        ],
      });

      await newTeam.save();

      // Add team to user's teams
      user.teams.push(newTeam._id);
      await user.save();

      console.log(`Created new team: ${newTeam.name} (${newTeam._id})`);
      console.log(
        `User ${user.name} is now the owner and admin of the new team`
      );

      return;
    }

    let updatedCount = 0;

    for (const team of teams) {
      console.log(`Processing team: ${team.name} (${team._id})`);

      // Check if user is already a member of this team
      const memberIndex = team.members.findIndex(
        (member) =>
          member.user && member.user.toString() === user._id.toString()
      );

      if (memberIndex !== -1) {
        const currentRole = team.members[memberIndex].role;
        console.log(
          `User is a member of team "${team.name}" with role "${currentRole}"`
        );

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
        console.log(
          `User is not a member of team "${team.name}". Adding as admin...`
        );

        // Add user as admin to this team
        team.members.push({
          user: user._id,
          role: "admin",
          joinedAt: new Date(),
        });

        await team.save();
        console.log(`Added user as admin to team: ${team.name}`);
        updatedCount++;
      }

      // Make sure team is in user's teams array
      const teamInUser = user.teams.some(
        (t) => t.toString() === team._id.toString()
      );
      if (!teamInUser) {
        console.log(`Adding team "${team.name}" to user's teams array`);
        user.teams.push(team._id);
      }
    }

    // Save the user with updated teams
    await user.save();

    // Get the full user data with populated teams
    const updatedUser = await User.findById(user._id).populate("teams");
    console.log(`\nOperation completed. Updated ${updatedCount} teams.`);
    console.log(
      `The user ${updatedUser.name} (${updatedUser.email}) is now an admin in all teams.`
    );
    console.log(
      `User's teams: ${updatedUser.teams.map((t) => t.name).join(", ")}`
    );

    // Print team IDs and names for easy reference
    console.log("\nTeams where user is admin:");
    for (const team of teams) {
      const isAdmin = team.members.some(
        (m) => m.user.toString() === user._id.toString() && m.role === "admin"
      );
      console.log(
        `- ${team.name} (${team._id}): ${isAdmin ? "ADMIN" : "NOT ADMIN"}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the script
fixPermissions();
