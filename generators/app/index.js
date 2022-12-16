"use strict";

const Generator = require("yeoman-generator");
const chalk = require("chalk");
const path = require("path");
const os = require("os");
const fs = require("fs");

const config = require("./config");
const util = require("./util");

class JD extends Generator {
  initializing() {
    this.answers = {};
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(`Welcome to the lovely ${chalk.red("generator-jd")} generator!`);
    const basename = path.basename(this.destinationRoot());
    const prompts = [
      {
        type: "list",
        name: "type",
        message: "请选择项目类型",
        choices: config.projects.map((item, index) => {
          return {
            name: item.description,
            value: {
              ...item,
              index
            }
          };
        }),
        store: true,
        pageSize: 20
      },
      {
        type: "input",
        name: "name",
        message: "请输入与项目名",
        default: basename
      },
      {
        type: "input",
        name: "version",
        message: "请输入版本号",
        default: "0.1.0"
      },
      {
        type: "input",
        name: "description",
        message: "请输入项目描述",
        default: basename
      },
      {
        type: "input",
        name: "author",
        message: "请输入项目作者",
        default: os.userInfo().username
      }
    ];

    return this.prompt(prompts).then(answers => {
      this.answers = answers;
    });
  }

  configuring() {
    this.config.save();
  }

  writing() {
    const answers = this.answers;
    const repository = answers.type.repository;
    const root = this.destinationRoot();
    const jsonPath = path.join(root, "package.json");

    if (!util.isEmptyDir(root)) {
      throw Error(chalk.red("目标目录不为空"));
    }

    this.log(chalk.green("downloading"));

    return util.downloadAndUnzip(repository, root).then(() => {
      const json = require(jsonPath);

      Object.assign(json, {
        name: answers.name,
        version: answers.version,
        description: answers.description,
        author: {
          name: answers.author
        }
      });

      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    });
  }

  install() {
    const root = this.destinationRoot();
    const usePnpm = fs.existsSync(path.join(root, "pnpm-lock.yaml"));
    const useYarn = fs.existsSync(path.join(root, "yarn.lock"));
    const commandStr = usePnpm ? "pnpm" : useYarn ? "yarn" : "npm";

    this.log(chalk.green("开始安装依赖"));
    this.spawnCommandSync(commandStr, ["install"]);
    this.log(chalk.green("启动中"));
    this.spawnCommandSync(commandStr, ["start"]);
  }

  end() {}
}

module.exports = JD;
