const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const spawnSync = require('child_process').spawnSync

const lintStyles = ['standard', 'airbnb']

/**
 * 系统自检
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.systemCheck = function systemCheck(
  cwd
) {
  console.log(`\n\n# '环境要求 ...'`)
  console.log('# ========================\n')

  console.log(`* node >= 6.0.0`)
  console.log(`* npm >= 3.0.0`)
  console.log(`* java = 1.8`)
  console.log(`* maven >= 3`)
  console.log(`* mysql >= 5.3`)

  console.log(`\n\n# '系统自检 ...'`)
  console.log('# ========================\n')
  console.log(`> node 版本`)
  runCommandResult('node', ['-v'], {cwd}).then(() => {}).catch(err => {})
  console.log(`\n> npm 版本`)
  runCommandResult('npm', ['-v'], {cwd}).then(() => {}).catch(err => {})
  console.log(`\n> java 版本`)
  runCommandResult('java', ['-version'], {cwd}).then(() => {}).catch(err => {})
  console.log(`\n> maven 版本`)
  runCommandResult('mvn', ['-v'], {cwd}).then(() => {}).catch(err => {})
  console.log(`\n> MySql 版本`)
  runCommandResult('mysql', ['--version'], {cwd}).then(() => {}).catch(err => {})

  console.log(`\n\n# '开始配置 ...'`)
  console.log('# ========================\n')
}

/**
 * Sorts dependencies in package.json alphabetically.
 * They are unsorted because they were grouped for the handlebars helpers
 * @param {object} data Data from questionnaire
 */
exports.sortDependencies = function sortDependencies(data) {
  const packageJsonFile = path.join(
    data.inPlace ? '' : data.destDirName,
    'vueSPA',
    'package.json'
  )
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile))
  packageJson.devDependencies = sortObject(packageJson.devDependencies)
  packageJson.dependencies = sortObject(packageJson.dependencies)
  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n')
}

/**
 * Runs `npm install` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.installDependencies = function installDependencies(
  cwd,
  executable = 'npm',
  color
) {
  console.log(`\n\n# ${color('初始化 npm 依赖包 ...')}`)
  console.log('# ========================\n')
  return runCommand(executable, ['install'], {
    cwd,
  })
}

/**
 * Runs `mysql` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.installMysqlDB = function installMysqlDB(
  cwd,
  args,
  color
) {
  console.log(`\n\n# ${color('初始化 mysql 数据 ...')}`)
  console.log('# ========================\n')
  return runCommand('mysql', args, {
    cwd,
  })
}

/**
 * Runs `mvn clean package` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.installMaven = function installMaven(
  cwd,
  args,
  color
) {
  console.log(`\n\n# ${color('初始化 maven 依赖包 ...')}`)
  console.log('# ========================\n')
  return runCommand('mvn', args, {
    cwd,
  })
}

/**
 * Runs `npm run lint -- --fix` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.runLintFix = function runLintFix(cwd, data, color) {
  if (data.lint && lintStyles.indexOf(data.lintConfig) !== -1) {
    console.log(
      `\n\n${color(
        'Running eslint --fix to comply with chosen preset rules...'
      )}`
    )
    console.log('# ========================\n')
    const args =
      data.autoInstall === 'npm'
        ? ['run', 'lint', '--', '--fix']
        : ['run', 'lint', '--fix']
    return runCommand(data.autoInstall, args, {
      cwd,
    })
  }
  return Promise.resolve()
}

/**
 * Prints the final message with instructions of necessary next steps.
 * @param {Object} data Data from questionnaire.
 */
exports.printMessage = function printMessage(data, { green, yellow }) {
  const message = `
# ${green('项目说明 !')}
# ========================

## 目录

* 前端项目 /vueSPA
* 后端项目 /javaSpringBoot2

## 后台初始账号

* 管理员
  root / root123456

## 文档

* 技术文档 http://itheimaadmin.itcast.cn/book/help/
* API文档 http://itheimaadmin.itcast.cn/book/api/_book/

`
  console.log(message)
}

/**
 * If the user will have to run lint --fix themselves, it returns a string
 * containing the instruction for this step.
 * @param {Object} data Data from questionnaire.
 */
function lintMsg(data) {
  return !data.autoInstall &&
    data.lint &&
    lintStyles.indexOf(data.lintConfig) !== -1
    ? 'npm run lint -- --fix (or for yarn: yarn run lint --fix)\n  '
    : ''
}

/**
 * If the user will have to run `npm install` or `yarn` themselves, it returns a string
 * containing the instruction for this step.
 * @param {Object} data Data from the questionnaire
 */
function installMsg(data) {
  return !data.autoInstall ? 'npm install (or if using yarn: yarn)\n  ' : ''
}

/**
 * Spawns a child process and runs the specified command
 * By default, runs in the CWD and inherits stdio
 * Options are the same as node's child_process.spawn
 * @param {string} cmd
 * @param {array<string>} args
 * @param {object} options
 */
function runCommand(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const spwan = spawn(
      cmd,
      args,
      Object.assign(
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )

    spwan.on('exit', () => {
      resolve()
    })
  })
}
function runCommandResult(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const spwan = spawnSync(
      cmd,
      args,
      Object.assign(
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )

    spwan.stdout.on('data', (data) => {
      console.log(`${data}`)
      resolve()
    });

    spwan.stderr.on('data', (data) => {
      console.log(`错误: ${data}`)
      reject()
    });

    spwan.on('exit', () => {
    })
  })
}

function sortObject(object) {
  // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
  const sortedObject = {}
  Object.keys(object)
    .sort()
    .forEach(item => {
      sortedObject[item] = object[item]
    })
  return sortedObject
}
