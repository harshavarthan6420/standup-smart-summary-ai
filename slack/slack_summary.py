from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError


slack_token = "xoxb-9032547602726-9040234815508-wtTeF8O2jpOPuJvE5XLYhy10"


channel_id = "C090YG3PXHC"

# Your message content
summary_text = """
📝 *Daily Scrum Summary*
- Alice: Fixed login bug
- Bob: Working on API refactor
- Carol: Blocked on design spec
"""

# Set up the Slack client
client = WebClient(token=slack_token)

try:
    response = client.chat_postMessage(
        channel=channel_id,
        text=summary_text
    )
    print("✅ Message sent at:", response["ts"])
except SlackApiError as e:
    print("❌ Error sending message:", e.response["error"])
