import mongoose, { Schema } from "mongoose";

const HistorySchema = new mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        dispatchDate: {
            type: Date,
            required: [true, "Dispatch Date is required"],
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
    },
    {
        timestamps: true,
    }
);

const History = mongoose.models.History || mongoose.model("History", HistorySchema);

export default History;
