import axios, { ResponseType } from "axios";
import { logger } from "../../app";
import fs from "fs-extra";
import path from "path";
import { CopyResource } from "./ConfigContentParser";
import { Buffer } from "buffer";

const saveExternalFile = async (content: CopyResource, destination: string): Promise<void> => {
  try {
    let tmpPath = await retrieveExternalFile(content);
    await fs.move(tmpPath, destination);
    logger.debug(`saved external file ${content.name} from ${content.from} to ${destination}`);
    await fs.remove("./tmp");
  } catch (err) {
    logger.error(`save external file failed to save ${content.name} from ${content.from}`);
  }
};

const retrieveExternalFile = (content: CopyResource): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      let res = await axios.get(content.from, { responseType: "stream" });
      await fs.mkdirp("./tmp");
      let filepath = path.join("./tmp", content.name);
      let writer = fs.createWriteStream(filepath);

      let stream = res.data;
      stream.on("data", (chunk) => {
        writer.write(Buffer.from(chunk));
      });
      stream.on("end", () => {
        writer.end();
        resolve(filepath);
      });
      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
      // passing this error up don't handle here.
      throw err;
    }
  });
};

export default saveExternalFile;
