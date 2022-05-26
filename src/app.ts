import "dotenv/config"; // let's keep secrets secret
import {
  Credentials,
  getFile,
  createBranch,
  createCommit,
  createPullRequest,
} from "./libs/bitbucket";
import { updateFile, getChanges } from "./libs/package";

export const main = async (creds: Credentials, mainBranchName: string) => {
  const newData = getChanges();
  const newBranchName = "redoc-" + Date.now();

  const currentData = await getFile(creds, "/package.json");
  const branch = await createBranch(creds, newBranchName, mainBranchName);
  const newFile = updateFile(currentData, newData);
  await createCommit(creds, branch.name, "redocly auto update", [
    {
      path: "/package.json",
      file: newFile,
    },
  ]);
  const pr = await createPullRequest(creds, {
    title: "Redoc " + (newData.version || currentData.version),
    description: "here are some updates we've made for you",
    sourceBranch: branch.name,
    targetBranch: mainBranchName,
  });
  return `${pr.rendered.title.raw} successfully created (${pr.links.html.href})`;
};
