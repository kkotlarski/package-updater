import nock from "nock";
import { main } from "./app";

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.abortPendingRequests();
  nock.cleanAll();
});

const bbMock = nock("https://api.bitbucket.org");
const credentials = {
  workspace: "test-org",
  repo: "test-repo",
  user: "test-user",
  password: "test-password",
};
const mainBranchName = "test-master";

test("happy path", async () => {
  // TODO: verify request payloads too
  bbMock
    .get(
      `/2.0/repositories/${credentials.workspace}/${credentials.repo}/src/master/package.json`
    )
    .reply(200, { name: "test-json", version: "0.0.1" });
  bbMock
    .post(
      `/2.0/repositories/${credentials.workspace}/${credentials.repo}/refs/branches`
    )
    .reply(201, { name: "test-branch" });
  bbMock
    .post(`/2.0/repositories/${credentials.workspace}/${credentials.repo}/src`)
    .reply(200);
  bbMock
    .post(
      `/2.0/repositories/${credentials.workspace}/${credentials.repo}/pullrequests`
    )
    .reply(200, {
      rendered: { title: { raw: "test-pr" } },
      links: { html: { href: "https://bb.org/test-pr" } },
    });

  const result = await main(credentials, mainBranchName);
  expect(result).toBe("test-pr successfully created (https://bb.org/test-pr)");
});
