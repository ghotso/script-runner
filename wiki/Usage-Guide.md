# Usage Guide

This guide covers the basic usage of Script Runner.

## Dashboard Overview

The main dashboard displays:
- List of all scripts
- Script status indicators
- Scheduler status
- Tags and categories

## Managing Scripts

### Creating a New Script

1. Click "Add New Script" button
2. Fill in the script details:
   - Name
   - Type (Python/Bash)
   - Tags (optional)
   - Dependencies
   - Script code
3. Click "Save Script"

### Editing Scripts

1. Click on a script from the dashboard
2. Modify the script details
3. Click "Save Changes"

### Installing Dependencies

1. Open a script
2. Add dependencies to the dependencies field
3. Click "Install Dependencies"

## Working with Schedules

### Adding a Schedule

1. Open a script
2. Click "Add Schedule"
3. Enter the cron expression
4. Click "Save"

### Cron Expression Examples

- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 0 * * 0` - Every Sunday at midnight

## Monitoring Executions

### Viewing Execution History

1. Open a script
2. Scroll to "Execution History"
3. Click on an execution to view details

### Understanding Status Indicators

- 🟢 Green check - Successful execution
- 🔴 Red X - Failed execution
- ⏱️ Clock - Scheduled/pending execution

## Discord Integration

### Setting Up Notifications

1. Go to Settings
2. Enter your Discord webhook URL
3. Configure notification preferences:
   - Success notifications
   - Failure notifications
   - Schedule notifications

## Global Scheduler

### Enabling/Disabling Global Scheduler

1. Locate the global scheduler toggle in the sidebar
2. Click the toggle to enable or disable all scheduled executions
3. Confirm the action when prompted

## Script Search and Filtering

### Using Tags for Filtering

1. Click on the tag filter dropdown
2. Select one or more tags to filter scripts
3. Scripts with matching tags will be displayed

### Searching Scripts

1. Use the search bar at the top of the dashboard
2. Enter keywords related to script names or content
3. Results will update as you type

## Execution Logs

### Accessing Detailed Logs

1. Open a script
2. Click on a specific execution in the history
3. View the full log output, including any errors or warnings

## Managing Dependencies

### Updating Dependencies

1. Open a script
2. Modify the dependencies list
3. Click "Update Dependencies"
4. Wait for the process to complete

## Best Practices

- Regularly review and update your scripts
- Use descriptive names and tags for easy organization
- Test scripts thoroughly before scheduling
- Monitor execution history for any recurring issues
- Keep dependencies up to date

