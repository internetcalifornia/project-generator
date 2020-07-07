import child_process from "child_process";

const initializeGit = () => {
  return new Promise((resolve, reject) => {
    child_process.exec(`git init`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default initializeGit;
