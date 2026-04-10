const PR_URL_PATTERN = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/;

async function main() {
  const statusEl = document.getElementById('status');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || !PR_URL_PATTERN.test(tab.url)) {
    statusEl.textContent = 'Not a GitHub PR page.';
    statusEl.className = 'error';
    return;
  }

  // GitHub page titles follow the pattern:
  //   "{PR Title} by {author} · Pull Request #{n} · {owner}/{repo} · GitHub"
  // Everything before the first " · " is the PR title, possibly with a
  // trailing " by {author}" that we strip.
  const title = tab.title.split(' \u00b7 ')[0].trim().replace(/\s+by\s+\S+$/, '');

  // Strip any URL fragment (e.g. #issuecomment-…)
  const url = tab.url.replace(/#.*$/, '');

  const html = `:pull-request:&nbsp;<a href="${url}">${title}</a>`;
  const markdown = `:pull-request: [${title}](${url})`;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([markdown], { type: 'text/plain' }),
      }),
    ]);
    statusEl.textContent = 'Copied!';
    setTimeout(() => window.close(), 600);
  } catch {
    statusEl.textContent = 'Clipboard write failed.';
    statusEl.className = 'error';
  }
}

main();
