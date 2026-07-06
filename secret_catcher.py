import random
import time

class SecretCatcher:
    """
    A skill that catches secrets.
    """

    def __init__(self, name="RunX"):
        self.name = name
        self.caught_secrets = []

    def catch_secret(self, secret=None):
        """
        Attempt to catch a secret. If no secret is provided, generate a random one.
        Returns the secret if caught, None otherwise.
        """
        if secret is None:
            secret = self._generate_secret()
        # Simulate catching logic (80% success rate)
        if random.random() < 0.8:
            self.caught_secrets.append(secret)
            print(f"{self.name} caught a secret: {secret}")
            return secret
        else:
            print(f"{self.name} failed to catch the secret.")
            return None

    def _generate_secret(self):
        """Generate a random secret string."""
        secrets = ["The cake is a lie", "42", "Hello, World!", "RunX is awesome", "Secret catcher ready"]
        return random.choice(secrets)

    def list_secrets(self):
        """Return all caught secrets."""
        return self.caught_secrets

    def run_cycle(self, num_attempts=5):
        """Run multiple catch attempts."""
        for i in range(num_attempts):
            self.catch_secret()
            time.sleep(0.5)
        print(f"Total secrets caught: {len(self.caught_secrets)}")

if __name__ == "__main__":
    catcher = SecretCatcher()
    catcher.run_cycle(3)
