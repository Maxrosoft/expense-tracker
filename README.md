# Expense Tracker

A CLI application to manage your finances. Allows you to add, update, and delete expenses, view expense lists and summaries, set monthly budgets, and export data to a CSV file.

## Features

- **Add Expenses**: Record expenses with a description, amount, and category.
- **Update Expenses**: Modify existing expenses.
- **Delete Expenses**: Remove expenses with confirmation.
- **View Expenses**: List all expenses, with optional filtering by category.
- **Expense Summaries**: View total expenses over all time or for a specific month.
- **Set Monthly Budgets**: Define a budget for a month and receive warnings when exceeded.
- **Export to CSV**: Export your expenses to a CSV file.

## Requirements

- **Node.js** version 14 or higher.
- **MongoDB** database.
- **npm** for dependency management.

## Installation

1. **Clone the repository or download the project code:**

   ```bash
   git clone https://github.com/maxrosoft/expense-tracker.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd expense-tracker
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the root directory of the project and add the following variable:

   ```env
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   ```

   Replace `mongodb://localhost:27017/expense-tracker` with your MongoDB connection URI if necessary.

5. **Ensure MongoDB is running:**

   If you're using a local database, make sure the MongoDB service is started.

## Usage

Run the application from the command line using the `expense-tracker` command. Below are the available commands and examples of how to use them.

### Add an Expense

```bash
expense-tracker add -d <description> -a <amount> [-c <category>]
```

**Example:**

```bash
expense-tracker add -d "Lunch" -a 15.50 -c "Food"
```

### Update an Expense

```bash
expense-tracker update --id <ID> [-d <new description>] [-a <new amount>] [-c <new category>]
```

**Example:**

```bash
expense-tracker update --id 605c5f2b8e7f8e3f14c8a4d1 -a 20.00
```

### Delete an Expense

```bash
expense-tracker delete --id <ID>
```

**Example:**

```bash
expense-tracker delete --id 605c5f2b8e7f8e3f14c8a4d1
```

**Note:** The system will ask for confirmation before deleting.

### View Expenses

```bash
expense-tracker list [-c <category>]
```

**Example:**

```bash
expense-tracker list
expense-tracker list -c "Food"
```

### View Expense Summary

```bash
expense-tracker summary [-m <month>]
```

**Example:**

```bash
expense-tracker summary
expense-tracker summary -m 11
```

### Set Monthly Budget

```bash
expense-tracker set-budget -m <month> -a <amount>
```

**Example:**

```bash
expense-tracker set-budget -m 11 -a 500.00
```

### Export Expenses to CSV

```bash
expense-tracker export -f <filename.csv>
```

**Example:**

```bash
expense-tracker export -f expenses.csv
```

## Examples

### 1. Adding an Expense

```bash
$ expense-tracker add -d "Coffee" -a 4.50 -c "Beverages"
Expense added successfully (ID: 605c5f2b8e7f8e3f14c8a4d1)
```

### 2. Updating an Expense

```bash
$ expense-tracker update --id 605c5f2b8e7f8e3f14c8a4d1 -a 5.00
Expense updated successfully (ID: 605c5f2b8e7f8e3f14c8a4d1)
```

### 3. Deleting an Expense

```bash
$ expense-tracker delete --id 605c5f2b8e7f8e3f14c8a4d1
Are you sure you want to delete expense (ID: 605c5f2b8e7f8e3f14c8a4d1)? (yes/no): yes
Expense deleted successfully
```

### 4. Viewing Expenses

```bash
$ expense-tracker list
+------------------------+------------+-------------+--------+-------------+
| ID                     | Date       | Description | Amount | Category    |
+------------------------+------------+-------------+--------+-------------+
| 605c5f2b8e7f8e3f14c8a4d2 | 03/15/2021 | Lunch       | $15.50 | Food        |
| 605c5f2b8e7f8e3f14c8a4d3 | 03/15/2021 | Gasoline    | $40.00 | Transportation |
+------------------------+------------+-------------+--------+-------------+
```

### 5. Viewing Expense Summary

```bash
$ expense-tracker summary
Total expenses for all time: $55.50

$ expense-tracker summary -m 3
Total expenses for March: $55.50
```

### 6. Setting a Monthly Budget

```bash
$ expense-tracker set-budget -m 3 -a 200.00
Budget for March set to $200.00
```

### 7. Adding an Expense Exceeding Budget

```bash
$ expense-tracker add -d "New Phone" -a 250.00 -c "Electronics"
Expense added successfully (ID: 605c5f2b8e7f8e3f14c8a4d4)
Warning: You have exceeded your budget for March by $105.50
```

### 8. Exporting Expenses

```bash
$ expense-tracker export -f expenses.csv
Expenses exported successfully to expenses.csv
```

## Additional Information

- **Date Format:** Dates are displayed in MM/DD/YYYY format.
- **Currency Format:** All amounts are displayed in US dollars with two decimal places.
- **Action Confirmation:** The system prompts for confirmation before deleting expenses to prevent accidental data loss.
- **Budget Warnings:** If the total expenses for the month exceed the set budget, a warning message will be displayed.

## Project Structure

- `expense-tracker.js` — Main application file.
- `models/expense.js` — Data model for expenses.
- `models/settings.js` — Data model for settings (budget).
- `.env` — Environment variables file (not included in the repository, needs to be created).

## Dependencies

- [commander](https://www.npmjs.com/package/commander)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [cli-table](https://www.npmjs.com/package/cli-table)
- [moment](https://www.npmjs.com/package/moment)
- [objects-to-csv](https://www.npmjs.com/package/objects-to-csv)
- [validator](https://www.npmjs.com/package/validator)
- [dotenv](https://www.npmjs.com/package/dotenv)

All dependencies can be installed via `npm install`.