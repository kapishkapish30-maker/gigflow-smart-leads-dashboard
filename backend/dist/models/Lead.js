"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const leadSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    status: {
        type: String,
        enum: ["New", "Contacted", "Qualified", "Lost"],
        default: "New",
    },
    source: {
        type: String,
        enum: ["Website", "Instagram", "Referral"],
        default: "Website",
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
const Lead = mongoose_1.default.model("Lead", leadSchema);
exports.default = Lead;
