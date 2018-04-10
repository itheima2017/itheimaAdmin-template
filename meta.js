const path = require('path')
const fs = require('fs')

const {
  sortDependencies,
  installDependencies,
  runLintFix,
  printMessage,
} = require('./utils')
const pkg = require('./package.json')

const templateVersion = pkg.version

const { addTestAnswers } = require('./scenarios')

module.exports = {
  metalsmith: {
    // When running tests for the template, this adds answers for the selected scenario
    before: addTestAnswers
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
      default: 'admin管理后台',
    },
    author: {
      when: 'isNotTest',
      type: 'string',
      message: '作者',
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
      default: '3flreaem37',
    },
    dbinstall: {
      when: 'isNotTest',
      type: 'confirm',
      message: '是否初始数据库安装 ?',
    },
    npminstall: {
      when: 'isNotTest',
      type: 'list',
      message:
        '现在就安装项目前端 npm 包吗? (recommended)',
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
  "skipInterpolation": [
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
    "javaSpringBoot2/db/**/*",
    "javaSpringBoot2/src/main/java/**/*",
    "API/**/*",
    "README/**/*",
    "*"
  ],
  complete: function(data, { chalk }) {
    const green = chalk.green

    sortDependencies(data, green)

    let cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName)
    cwd = cwd + '/vueSPA'
    console.log(cwd)

    if (data.npminstall) {
      installDependencies(cwd, data.npminstall, green)
        .then(() => {
          return runLintFix(cwd, data, green)
        })
        .then(() => {
          printMessage(data, green)
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    } else {
      printMessage(data, chalk)
    }
  },
}
