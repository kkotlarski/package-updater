import axios from "axios";
import FormData from "form-data";
import { Buffer } from "node:buffer";

export type Credentials = {
  workspace: string;
  user: string;
  password: string;
  repo: string;
};

const toBase64 = (str: string) => Buffer.from(str).toString("base64");
const request = async (
  creds: Credentials,
  method: string,
  url: string,
  data?: any
) => {
  try {
    const response = await axios({
      url: `https://api.bitbucket.org/2.0/repositories/${creds.workspace}/${creds.repo}${url}`,
      method,
      headers: {
        Authorization: "Basic " + toBase64(creds.user + ":" + creds.password),
      },
      data,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Unexpected BitBucket response ${url}: ${error?.response?.status} (${error?.response?.statusText})`
    );
  }
};

// TODO: create return types
export const getFile = (creds: Credentials, path: string) =>
  request(creds, "GET", `/src/master${path}`);

export const createBranch = (
  creds: Credentials,
  branchName: string,
  targetHash: string
) =>
  request(creds, "POST", "/refs/branches", {
    name: branchName,
    target: {
      hash: targetHash,
    },
  });

type File = {
  path: string;
  file: Buffer;
};

export const createCommit = (
  creds: Credentials,
  branchName: string,
  message: string,
  files: File[]
) => {
  const form = new FormData();
  form.append("branch", branchName);
  form.append("message", message);
  for (const file of files) {
    form.append(file.path, file.file);
  }
  return request(creds, "POST", "/src", form);
};

type PullRequest = {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
};

export const createPullRequest = (creds: Credentials, data: PullRequest) =>
  request(creds, "POST", "/pullrequests", {
    title: data.title,
    description: data.description,
    destination: {
      branch: {
        name: data.targetBranch,
      },
    },
    source: {
      branch: {
        name: data.sourceBranch,
      },
    },
  });
