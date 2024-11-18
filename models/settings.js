import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: "global_settings",
    },
    budget: {
        type: Map,
        of: Number,
    },
});

const Settings = mongoose.model("Settings", SettingsSchema);

export default Settings;
