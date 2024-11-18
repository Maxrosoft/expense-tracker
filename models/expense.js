import mongoose from "mongoose";
import moment from "moment";

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    category: String,
    date: {
        type: Date,
        default: moment().format("L"),
    },
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
