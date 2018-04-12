const path = require('path')
const fs = require('fs')

const {
  systemCheck,
  sortDependencies,
  installDependencies,
  runLintFix,
  printMessage,
  installMysqlDB,
  installMaven
} = require('./utils')
const pkg = require('./package.json')

const templateVersion = pkg.version

const { addTestAnswers } = require('./scenarios')

module.exports = {
  metalsmith: {
    // When running tests for the template, this adds answers for the selected scenario
    before: function(metalsmith, opts, helpers) {
      const cwd = process.cwd()
      systemCheck(cwd)
      addTestAnswers(metalsmith, opts, helpers)
    }
  },
  helpers: {
    if_or(v1, v2, options) {

      if (v1 || v2) {
        return options.fn(this)
      }

      return options.inverse(this)
    },
    template_version() {
      return templateVersion
    },
  },
  
  prompts: {
    name: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: '项目名称',
    },
    description: {
      when: 'isNotTest',
      type: 'string',
      required: false,
      message: '项目说明',
      default: '黑马admin管理后台',
    },
    author: {
      when: 'isNotTest',
      type: 'string',
      required: false,
      message: '作者',
      default: 'yourname <yourname@xxxx.xxx>',
    },
    dbinstance: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'mysql实例',
      default: 'localhost:3306',
    },
    dbname: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'mysql名称',
      default: 'itheima_admin',
    },
    dbusername: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'mysql账号',
      default: 'root',
    },
    dbpassword: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'mysql密码',
      default: 'root',
    },
    dbinstall: {
      when: 'isNotTest',
      type: 'confirm',
      message: '初始数据库安装 ?',
    },
    mvninstall: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'meavn自动更新包 ?',
    },
    npminstall: {
      when: 'isNotTest',
      type: 'list',
      message:
        '自动安装前端 npm 包吗? (推荐)',
      choices: [
        {
          name: 'Yes, use cnpm',
          value: 'cnpm',
          short: 'cnpm',
        },
        {
          name: 'Yes, use NPM',
          value: 'npm',
          short: 'npm',
        },
        {
          name: 'Yes, use Yarn',
          value: 'yarn',
          short: 'yarn',
        },
        {
          name: '不用了，稍后我自己安装',
          value: false,
          short: 'no',
        },
      ],
    }
  },
  filters: {
  },
  skipInterpolation: [
    "vueSPA/*.js",
    "vueSPA/*.babelrc",
    "vueSPA/*.editorconfig",
    "vueSPA/*.eslintignore",
    "vueSPA/*.gitignore",
    "vueSPA/*.md",
    "vueSPA/src/**/*.vue",
    "vueSPA/src/**/*.js",
    "vueSPA/src/**/*.md",
    "javaSpringBoot2/*",
    "javaSpringBoot2/.mvn/**/*",
    "javaSpringBoot2/src/main/java/**/*",
    "*"
  ],
  complete: async function(data, { chalk }) {
    const green = chalk.green

    sortDependencies(data, green)

    // maven 自动更新包
    if (data.mvninstall) {
      const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName, 'javaSpringBoot2')
      const args = [
        `clean`,
        `package`
      ]
      await installMaven(cwd, args, green)
        .then(() => {
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    }

    // 安装 node_packages
    if (data.npminstall) {
      const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName, 'vueSPA')
      await installDependencies(cwd, data.npminstall, green)
        .then(() => {
          return runLintFix(cwd, data, green)
        })
        .then(() => {
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    }

    // 安装 msql server
    if (data.dbinstall) {
      const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName, 'javaSpringBoot2', 'db')
      const args = [
        `-u${data.dbusername}`,
        `-p${data.dbpassword}`,
        ` < init.sql`
      ]
      await installMysqlDB(cwd, args, green)
        .then(() => {
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    }
    
    printMessage(data, chalk)
  },
}
