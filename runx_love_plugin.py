"""
runx plugin: love

Adds a 'love' command that outputs a heart message.
"""
import click
from runx.plugins import register_plugin

@click.command()
@click.option('--target', '-t', default='runx', help='Target to show love to.')
def love(target):
    """Show some love to a target."""
    click.echo(f"\u2764\ufe0f Love you, {target}! \u2764\ufe0f")

def setup():
    register_plugin(love)

if __name__ == '__main__':
    love()
