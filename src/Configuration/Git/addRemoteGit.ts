import child_process from "child_process";

const addRemoteGit = (remoteURL: string) => {
  return new Promise((resolve, reject) => {
    child_process.exec(`git remote add origin ${remoteURL}`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default addRemoteGit;
