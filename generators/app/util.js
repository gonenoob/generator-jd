const fs = require("fs");
const zlib = require("zlib");
const tar = require("tar");
const axios = require("axios");

exports.downloadAndUnzip = function(url, dest) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        responseType: "stream"
      })
      .then(res => {
        res.data
          .pipe(zlib.createGunzip())
          .on("error", reject)
          .pipe(
            tar.extract({
              strip: 1,
              cwd: dest
            })
          )
          .on("error", reject)
          .on("end", resolve);
      })
      .catch(() => {
        reject();
      });
  });
};

exports.isEmptyDir = dest => {
  return (
    !fs.existsSync(dest) ||
    (fs.statSync(dest).isDirectory() && !fs.readdirSync(dest).length)
  );
};
