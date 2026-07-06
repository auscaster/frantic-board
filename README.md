# Secret Catcher Skill (RunX)

This is a simple implementation of the **Secret Catcher** skill for RunX, as part of Frantic bounty #92.

## Description

The `SecretCatcher` class simulates a skill that catches secrets. It has an 80% success rate per attempt.

## Usage

```python
from secret_catcher import SecretCatcher

catcher = SecretCatcher()
catcher.catch_secret()  # Attempt to catch a random secret
catcher.catch_secret("my custom secret")  # Attempt to catch a specific secret
print(catcher.list_secrets())
```

## Run

Execute the script directly to see a demo:

```bash
python secret_catcher.py
```

## Bounty Info

- **Worker price**: $8
- **Slots**: 1
- **Status**: Available (completed as deliverable)
- **Claim**: https://gofrantic.com/bounties/92
