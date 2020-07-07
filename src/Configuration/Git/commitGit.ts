import child_process from "child_process";

const commitGit = () => {
  return new Promise((resolve, reject) => {
    child_process.exec(`git commit -m "Initial Commit"`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default commitGit;
