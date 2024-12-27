import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  salaryStatus: "Send" | "Pending";
  basicSalary: number;
  allowance: number;
  bonus: number;
  overtime: number;
  tax: number;
  holiday: number;
  designation: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // Ensure unique emails
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true, // Password field added
    },
    salaryStatus: {
      type: String,
      enum: ["Send", "Pending"],
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    overtime: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    holiday: {
      type: Number,
      default: 0,
    },
    designation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const User = models.User || model<IUser>("User", userSchema);

export default User;
