import child_process from "child_process";

const addAllGit = () => {
  return new Promise((resolve, reject) => {
    child_process.exec(`git add --all`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default addAllGit;
