import { Octokit } from 'octokit';

let octokit;

function getOctokit() {
  if (!octokit) {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  return octokit;
}

function parseRepo(repoString) {
  const [owner, repo] = repoString.split('/');
  return { owner, repo };
}

// Read a file from a GitHub repo, returns { content, sha }
export async function readFile(repoString, path, branch = 'master') {
  const { owner, repo } = parseRepo(repoString);
  const res = await getOctokit().rest.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });
  const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
  return { content, sha: res.data.sha };
}

// Write a file to a GitHub repo (creates or updates)
export async function writeFile(repoString, path, content, sha, message, branch = 'master') {
  const { owner, repo } = parseRepo(repoString);
  const res = await getOctokit().rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch,
  });
  return { sha: res.data.content.sha, commit: res.data.commit.sha };
}

// List files in a directory
export async function listFiles(repoString, path, branch = 'master') {
  const { owner, repo } = parseRepo(repoString);
  const res = await getOctokit().rest.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });
  return Array.isArray(res.data) ? res.data : [res.data];
}

// Create a branch from the default branch
export async function createBranch(repoString, branchName, baseBranch = 'master') {
  const { owner, repo } = parseRepo(repoString);
  const main = await getOctokit().rest.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
  await getOctokit().rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: main.data.object.sha,
  });
  return branchName;
}

// Delete a branch
export async function deleteBranch(repoString, branchName) {
  const { owner, repo } = parseRepo(repoString);
  await getOctokit().rest.git.deleteRef({ owner, repo, ref: `heads/${branchName}` });
}

// Merge branch into the default branch
export async function mergeBranch(repoString, branchName, message, baseBranch = 'master') {
  const { owner, repo } = parseRepo(repoString);
  await getOctokit().rest.repos.merge({
    owner,
    repo,
    base: baseBranch,
    head: branchName,
    commit_message: message || `Merge ${branchName} via CMS`,
  });
  await deleteBranch(repoString, branchName);
}

// Get recent commits
export async function getCommits(repoString, count = 10) {
  const { owner, repo } = parseRepo(repoString);
  const res = await getOctokit().rest.repos.listCommits({
    owner,
    repo,
    per_page: count,
  });
  return res.data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    date: c.commit.committer.date,
    author: c.commit.author.name,
  }));
}
