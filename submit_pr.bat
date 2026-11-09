@echo off
echo ===================================================
echo GabinoTech OS - Submit Bounty PR for Issue #25
echo Destination Payout: gabinotech22@gmail.com
echo ===================================================
git push origin fix/bounty-issue-53
gh pr create --title "Frantic bounty #33: Publish Sourcey docs for a maintained OSS library" --body-file PR_CLAIM_BUNDLE.md
echo [OK] Pull Request submitted. Check https://github.com/auscaster/frantic-board/issues/53
pause
