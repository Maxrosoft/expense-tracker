#!/usr/bin/env node

import { program } from "commander";
import mongoose from "mongoose";
import Table from "cli-table";
import moment from "moment";
import ObjectsToCsv from "objects-to-csv";
import validator from "validator";
import "dotenv/config";

import Expense from "./models/expense.js";
import Settings from "./models/settings.js";

function printExpenses(expenses) {
    const table = new Table({
        head: ["ID", "Date", "Description", "Amount", "Category"],
    });

    expenses.forEach((expense) => {
        table.push([
            expense._id,
            moment(expense.date).format("L") ?? "no-date",
            expense.description,
            "$" + expense.amount.toFixed(2),
            expense.category ?? "no-category",
        ]);
    });

    console.log(table.toString());
}

function summarizeExpenses(expenses) {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        program
            .name("expense-tracker")
            .description("CLI to manage your finances")
            .version("1.0.0");

        program
            .command("add")
            .description("Add an expense with a description and amount")
            .requiredOption("-d, --description <description>", "Description of the expense")
            .requiredOption("-a, --amount <amount>", "Amount of the expense")
            .option("-c, --category <category>", "Category of the expense")
            .action(async (options) => {
                try {
                    const { description, amount, category } = options;

                    if (!validator.isFloat(amount, { min: 0.01 })) {
                        throw new Error("Amount must be a number greater than $0.01");
                    }

                    const expenseData = {
                        description,
                        amount: parseFloat(amount),
                        category,
                        date: new Date(),
                    };

                    const expense = await Expense.create(expenseData);
                    console.log(`Expense added successfully (ID: ${expense._id})`);

                    const month = moment().month() + 1;
                    const settings = await Settings.findById("global_settings");
                    const budgetAmount = settings?.budget.get(`${month}`) || 0;

                    const expenses = await Expense.find({
                        date: {
                            $gte: moment().startOf("month").toDate(),
                            $lte: moment().endOf("month").toDate(),
                        },
                    });

                    const totalExpenses = summarizeExpenses(expenses);

                    if (budgetAmount && totalExpenses > budgetAmount) {
                        console.log(
                            `Warning: You have exceeded your budget for ${moment()
                                .format("MMMM")} by $${(totalExpenses - budgetAmount).toFixed(2)}`
                        );
                    }
                } catch (error) {
                    console.error("Error adding expense:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program
            .command("update")
            .description("Update an existing expense")
            .requiredOption("--id <id>", "ID of the expense to update")
            .option("-d, --description <description>", "New description of the expense")
            .option("-a, --amount <amount>", "New amount of the expense")
            .option("-c, --category <category>", "New category of the expense")
            .action(async (options) => {
                try {
                    const { id, description, amount, category } = options;

                    const updateData = {};
                    if (description) updateData.description = description;
                    if (amount) {
                        if (!validator.isFloat(amount, { min: 0.01 })) {
                            throw new Error("Amount must be a number greater than $0.01");
                        }
                        updateData.amount = parseFloat(amount);
                    }
                    if (category) updateData.category = category;

                    const expense = await Expense.findByIdAndUpdate(id, updateData, { new: true });
                    if (!expense) {
                        console.log("Expense not found");
                    } else {
                        console.log(`Expense updated successfully (ID: ${expense._id})`);
                    }
                } catch (error) {
                    console.error("Error updating expense:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program
            .command("delete")
            .description("Delete an expense")
            .requiredOption("--id <id>", "ID of the expense")
            .action(async (options) => {
                try {
                    const { id } = options;

                    const expense = await Expense.findById(id);
                    if (!expense) {
                        console.log("Expense not found");
                        return;
                    }

                    const readline = await import("readline");
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                    });

                    rl.question(
                        `Are you sure you want to delete expense (ID: ${id})? (yes/no): `,
                        async (answer) => {
                            if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
                                await Expense.deleteOne({ _id: id });
                                console.log("Expense deleted successfully");
                            } else {
                                console.log("Deletion cancelled");
                            }
                            rl.close();
                            await mongoose.connection.close();
                        }
                    );
                } catch (error) {
                    console.error("Error deleting expense:", error.message);
                    await mongoose.connection.close();
                }
            });

        program
            .command("list")
            .description("View all expenses [by category]")
            .option("-c, --category <category>", "Category of the expense")
            .action(async (options) => {
                try {
                    const { category } = options;
                    const query = category ? { category } : {};

                    const expenses = await Expense.find(query);
                    if (expenses.length === 0) {
                        console.log("No expenses to display.");
                    } else {
                        printExpenses(expenses);
                    }
                } catch (error) {
                    console.error("Error listing expenses:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program
            .command("summary")
            .description("View a summary of all expenses")
            .option("-m, --month <month>", "Month of the expense")
            .action(async (options) => {
                try {
                    const { month } = options;
                    let expenses;

                    if (month) {
                        if (!validator.isInt(month, { min: 1, max: 12 })) {
                            throw new Error("Month must be an integer between 1 and 12");
                        }

                        const startOfMonth = moment().month(month - 1).startOf("month").toDate();
                        const endOfMonth = moment().month(month - 1).endOf("month").toDate();

                        expenses = await Expense.find({
                            date: { $gte: startOfMonth, $lte: endOfMonth },
                        });
                    } else {
                        expenses = await Expense.find();
                    }

                    const total = summarizeExpenses(expenses);
                    const monthName = month ? moment().month(month - 1).format("MMMM") : "all time";

                    console.log(`Total expenses for ${monthName}: $${total.toFixed(2)}`);
                } catch (error) {
                    console.error("Error calculating summary:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program
            .command("set-budget")
            .description("Set a budget for each month")
            .requiredOption("-m, --month <month>", "Month of the budget")
            .requiredOption("-a, --amount <amount>", "Amount of the budget")
            .action(async (options) => {
                try {
                    const { month, amount } = options;

                    if (!validator.isInt(month, { min: 1, max: 12 })) {
                        throw new Error("Month must be an integer between 1 and 12");
                    }
                    if (!validator.isFloat(amount, { min: 0.01 })) {
                        throw new Error("Amount must be a number greater than $0.01");
                    }

                    let settings = await Settings.findById("global_settings");
                    if (!settings) {
                        settings = new Settings({
                            _id: "global_settings",
                            budget: {},
                        });
                    }

                    settings.budget.set(month, parseFloat(amount));
                    await settings.save();

                    console.log(
                        `Budget for ${moment()
                            .month(month - 1)
                            .format("MMMM")} set to $${parseFloat(amount).toFixed(2)}`
                    );
                } catch (error) {
                    console.error("Error setting budget:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program
            .command("export")
            .description("Export expenses to a CSV file")
            .requiredOption("-f, --file <file>", "Name of CSV file")
            .action(async (options) => {
                try {
                    const { file } = options;

                    if (!file.endsWith(".csv")) {
                        throw new Error("Filename must end with .csv");
                    }

                    const expenses = await Expense.find({}).lean();
                    if (expenses.length === 0) {
                        console.log("No expenses to export.");
                    } else {
                        const csv = new ObjectsToCsv(expenses);
                        await csv.toDisk(`./${file}`);
                        console.log(`Expenses exported successfully to ${file}`);
                    }
                } catch (error) {
                    console.error("Error exporting expenses:", error.message);
                } finally {
                    await mongoose.connection.close();
                }
            });

        program.parse(process.argv);
    } catch (error) {
        console.error("Unexpected error:", error.message);
        process.exit(1);
    }
})();
