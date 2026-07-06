"""
Tests for runx_love_plugin.
"""
import pytest
from click.testing import CliRunner
from runx_love_plugin import love

def test_love_default():
    runner = CliRunner()
    result = runner.invoke(love, [])
    assert result.exit_code == 0
    assert 'Love you, runx!' in result.output

def test_love_custom():
    runner = CliRunner()
    result = runner.invoke(love, ['--target', 'world'])
    assert result.exit_code == 0
    assert 'Love you, world!' in result.output

def test_love_unicode():
    runner = CliRunner()
    result = runner.invoke(love, [])
    assert '\u2764' in result.output
