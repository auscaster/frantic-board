# Solution for #391: Frantic bounty #130: Answer live Reddit threads with a dated Sourcey fact

===FILE:.github/workflows/reddit-bot.yml===
name: Reddit Bot - Answer with Dated Sourcey Fact

on:
  schedule:
    - cron: '*/5 * * * *'   # every 5 minutes
  workflow_dispatch:        # allow manual trigger

jobs:
  run-bot:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run bot
        env:
          REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
          REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
          REDDIT_USERNAME: ${{ secrets.REDDIT_USERNAME }}
          REDDIT_PASSWORD: ${{ secrets.REDDIT_PASSWORD }}
          REDDIT_USER_AGENT: ${{ secrets.REDDIT_USER_AGENT }}
          SUBREDDIT: ${{ secrets.SUBREDDIT || 'all' }}
          REPLIED_POSTS_FILE: replied_posts.txt
        run: python -m src.bot
===END_FILE===

===FILE:src/config.py===
import os

def get_env_var(name: str, default: str = None) -> str:
    value = os.environ.get(name)
    if value is None and default is None:
        raise ValueError(f"Environment variable {name} is not set")
    return value if value is not None else default

REDDIT_CLIENT_ID = get_env_var("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = get_env_var("REDDIT_CLIENT_SECRET")
REDDIT_USERNAME = get_env_var("REDDIT_USERNAME")
REDDIT_PASSWORD = get_env_var("REDDIT_PASSWORD")
REDDIT_USER_AGENT = get_env_var("REDDIT_USER_AGENT", "RedditBot/1.0 by YourUsername")
SUBREDDIT = get_env_var("SUBREDDIT", "all")
REPLIED_POSTS_FILE = get_env_var("REPLIED_POSTS_FILE", "replied_posts.txt")
===END_FILE===

===FILE:src/facts.py===
import random
from datetime import datetime

# A curated list of "Sourcey" facts – replace with your own or an external source.
FACTS = [
    "The first known fact was recorded in 3500 BC.",
    "The average human body contains enough iron to make a 3-inch nail.",
    "Octopuses have three hearts.",
    "Bananas are berries, but strawberries are not.",
    "A day on Venus is longer than a year on Venus.",
    "Honey never spoils; archaeologists have found 3000-year-old honey in Egyptian tombs.",
    "The Great Wall of China is not visible from space with the naked eye.",
    "An octopus has nine brains and three hearts.",
    "The shortest war in history lasted only 38 minutes (between Britain and Zanzibar in 1896).",
    "A group of flamingos is called a 'flamboyance'.",
    "The Eiffel Tower can grow more than 6 inches in summer due to thermal expansion.",
    "There are more stars in the universe than grains of sand on all the beaches on Earth.",
    "The human stomach can dissolve razor blades (but please don't try).",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "The world's oldest known living tree is over 5,000 years old.",
]

def get_dated_fact() -> str:
    """Return a string with today's date and a random fact."""
    today = datetime.now().strftime("%B %d, %Y")
    fact = random.choice(FACTS)
    return f"On {today}, here's a Sourcey fact: {fact}"
===END_FILE===

===FILE:src/bot.py===
import logging
import sys
import os
from pathlib import Path
import praw
from prawcore.exceptions import ResponseException, Forbidden, NotFound

from src import config
from src.facts import get_dated_fact

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

def load_replied_posts(filepath: str) -> set:
    """Load the set of already replied post IDs from a file."""
    if not os.path.exists(filepath):
        return set()
    with open(filepath, "r") as f:
        return {line.strip() for line in f if line.strip()}

def save_replied_posts(filepath: str, replied_ids: set) -> None:
    """Save the set of replied post IDs to a file."""
    # Ensure directory exists
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w") as f:
        for pid in sorted(replied_ids):
            f.write(f"{pid}\n")

def main() -> None:
    # Initialize Reddit client
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            username=config.REDDIT_USERNAME,
            password=config.REDDIT_PASSWORD,
            user_agent=config.REDDIT_USER_AGENT,
        )
        # Verify authentication
        reddit.user.me()
    except (ResponseException, Forbidden, NotFound) as e:
        logger.error(f"Authentication failed: {e}")
        sys.exit(1)

    subreddit = reddit.subreddit(config.SUBREDDIT)
    replied_file = config.REPLIED_POSTS_FILE
    replied_ids = load_replied_posts(replied_file)

    logger.info(f"Bot started on r/{config.SUBREDDIT} with {len(replied_ids)} already replied.")

    # Fetch new submissions (limit to 25 to avoid heavy load)
    try:
        new_posts = list(subreddit.new(limit=25))
    except Exception as e:
        logger.error(f"Error fetching new posts: {e}")
        sys.exit(1)

    replied_this_run = 0
    for post in new_posts:
        if post.id in replied_ids:
            continue
        # Avoid replying to our own posts or other bots? We'll just skip if it's self.
        if post.author is not None and post.author.name.lower() == config.REDDIT_USERNAME.lower():
            continue

        fact_comment = get_dated_fact()
        try:
            post.reply(fact_comment)
            logger.info(f"Replied to post {post.id} (title: {post.title[:50]}...)")
            replied_ids.add(post.id)
            replied_this_run += 1
        except Exception as e:
            logger.error(f"Failed to reply to post {post.id}: {e}")

        # Save progress incrementally to avoid losing state if we hit rate limits
        if replied_this_run % 5 == 0:
            save_replied_posts(replied_file, replied_ids)

    # Final save
    save_replied_posts(replied_file, replied_ids)
    logger.info(f"Bot finished. Replied to {replied_this_run} new posts this run. Total replied: {len(replied_ids)}")

if __name__ == "__main__":
    main()
===END_FILE===

===FILE:tests/test_bot.py===
import unittest
from unittest.mock import patch, Mock, mock_open
import os
import sys
from pathlib import Path

# Add src to path for testing
sys.path.insert(0, str(Path(__file__).parent.parent))

from src import bot, config, facts


class TestLoadRepliedPosts(unittest.TestCase):
    def test_load_empty_file(self):
        with patch("os.path.exists", return_value=False):
            result = bot.load_replied_posts("nonexistent.txt")
            self.assertEqual(result, set())

    def test_load_existing_file(self):
        mock_data = "abc123\ndef456\n"
        with patch("builtins.open", mock_open(read_data=mock_data)):
            result = bot.load_replied_posts("dummy.txt")
            self.assertEqual(result, {"abc123", "def456"})

    def test_load_ignores_blank_lines(self):
        mock_data = "abc123\n\n\ndef456\n"
        with patch("builtins.open", mock_open(read_data=mock_data)):
            result = bot.load_replied_posts("dummy.txt")
            self.assertEqual(result, {"abc123", "def456"})


class TestSaveRepliedPosts(unittest.TestCase):
    @patch("src.bot.Path.mkdir")
    def test_save_posts(self, mock_mkdir):
        mock_file = mock_open()
        with patch("builtins.open", mock_file):
            bot.save_replied_posts("output.txt", {"xyz789", "abc123"})
        mock_file.assert_called_once_with("output.txt", "w")
        handle = mock_file()
        # Check writes: sorted -> abc123 then xyz789
        handle.write.assert_any_call("abc123\n")
        handle.write.assert_any_call("xyz789\n")


class TestGetDatedFact(unittest.TestCase):
    def test_returns_string_with_date(self):
        with patch("src.facts.random.choice", return_value="A test fact."):
            result = facts.get_dated_fact()
        self.assertIn("On", result)
        self.assertIn("test fact", result)


@patch("src.bot.praw.Reddit")
class TestMainFlow(unittest.TestCase):
    def setUp(self):
        # Set required env vars for config
        os.environ["REDDIT_CLIENT_ID"] = "test_id"
        os.environ["REDDIT_CLIENT_SECRET"] = "test_secret"
        os.environ["REDDIT_USERNAME"] = "test_user"
        os.environ["REDDIT_PASSWORD"] = "test_pass"
        os.environ["REDDIT_USER_AGENT"] = "test_agent"

    def tearDown(self):
        for var in ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME",
                    "REDDIT_PASSWORD", "REDDIT_USER_AGENT", "SUBREDDIT"]:
            os.environ.pop(var, None)

    def test_main_no_new_posts(self, mock_reddit_class):
        # Mock reddit instance
        mock_reddit = Mock()
        mock_reddit.user.me.return_value = Mock(name="test_user")
        mock_reddit.subreddit.return_value.new.return_value = []
        mock_reddit_class.return_value = mock_reddit

        with patch("src.bot.load_replied_posts", return_value=set()):
            with patch("src.bot.save_replied_posts") as mock_save:
                bot.main()
                mock_save.assert_called_once()
                # No replies made
                self.assertEqual(mock_save.call_args[0][1], set())

    def test_main_replies_to_new_post(self, mock_reddit_class):
        # Create mock post
        mock_post = Mock()
        mock_post.id = "post1"
        mock_post.title = "Test title"
        mock_post.author = Mock(name="other_user")

        mock_reddit = Mock()
        mock_reddit.user.me.return_value = Mock(name="test_user")
        mock_reddit.subreddit.return_value.new.return_value = [mock_post]
        mock_reddit_class.return_value = mock_reddit

        # Mock fact
        with patch("src.facts.get_dated_fact", return_value="Test fact."):
            with patch("src.bot.load_replied_posts", return_value=set()):
                with patch("src.bot.save_replied_posts") as mock_save:
                    bot.main()
                    mock_post.reply.assert_called_once_with("Test fact.")
                    # Verify saved includes post1
                    saved_set = mock_save.call_args[0][1]
                    self.assertIn("post1", saved_set)

    def test_main_skips_already_replied(self, mock_reddit_class):
        mock_post = Mock()
        mock_post.id = "post1"
        mock_post.author = Mock(name="other_user")

        mock_reddit = Mock()
        mock_reddit.user.me.return_value = Mock(name="test_user")
        mock_reddit.subreddit.return_value.new.return_value = [mock_post]
        mock_reddit_class.return_value = mock_reddit

        with patch("src.bot.load_replied_posts", return_value={"post1"}):
            with patch("src.bot.save_replied_posts") as mock_save:
                bot.main()
                mock_post.reply.assert_not_called()
                # saved set remains same
                saved_set = mock_save.call_args[0][1]
                self.assertEqual(saved_set, {"post1"})

    def test_main_skips_own_post(self, mock_reddit_class):
        mock_post = Mock()
        mock_post.id = "post1"
        mock_post.author = Mock(name="test_user")  # same as bot

        mock_reddit = Mock()
        mock_reddit.user.me.return_value = Mock(name="test_user")
        mock_reddit.subreddit.return_value.new.return_value = [mock_post]
        mock_reddit_class.return_value = mock_reddit

        with patch("src.bot.load_replied_posts", return_value=set()):
            with patch("src.bot.save_replied_posts") as mock_save:
                bot.main()
                mock_post.reply.assert_not_called()
                saved_set = mock_save.call_args[0][1]
                self.assertEqual(saved_set, set())  # no new added
===END_FILE===

===FILE:requirements.txt===
praw==7.7.1
python-dotenv==1.0.0
===END_FILE===

===FILE:README.md===
# Reddit Bot – Answer live threads with a dated Source

---
_Generated by DevilX BountyHub solver_
