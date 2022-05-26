import { main } from "./app";
import { Credentials } from "./libs/bitbucket";

const credentials: Credentials = {
  workspace: process.env.BB_WORKSPACE,
  repo: process.env.BB_REPO,
  user: process.env.BB_USER,
  password: process.env.BB_PASSWORD,
};
const mainBranchName = process.env.MAIN_BRANCH_NAME;

main(credentials, mainBranchName).then(console.log).catch(console.error);
