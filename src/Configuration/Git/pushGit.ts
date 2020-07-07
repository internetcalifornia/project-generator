import child_process from "child_process";

const pushGit = () => {
  return new Promise((resolve, reject) => {
    child_process.exec(`git push -u origin --all`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default pushGit;
