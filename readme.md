# Slack Cleaner
This script (probably) deletes all your Slack messages, for all channels in a given Slack Workspace. It is intended to be run from the Chrome Devtools console.

## Usage
1. Get an API token for a given workspace from: https://api.slack.com/legacy/custom-integrations/legacy-tokens
2. Replace the API token on line 1 with the one you received from the page in step 1.
3. Navigate to the web client for your Slack Workspace.
4. Paste the whole thing into your Chrome Devtools console and execute it.
5. You'll now have an async function called `fuckMeUpFam` in the global scope. Invoke it, passing in your Slack display name. E.g. if you get @-replied as "Jeff Gravy", you would invoke `await fuckMeUpFam("Jeff Gravy")` in the console.
