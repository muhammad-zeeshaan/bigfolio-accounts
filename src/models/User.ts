import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
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
      unique: true,
    },
    personalEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    jobStatus: {
      type: String,
      enum: ["permanent", "underReview", "partTime", "newJoinee"]
    },
    joiningDate: {
      type: Date,
    },
    leavingDate: {
      type: Date,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    salaryStatus: {
      type: String,
      enum: ["Send", "Pending"]
    },
    basicSalary: {
      type: Number,
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
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model("User", userSchema);

export default User;
