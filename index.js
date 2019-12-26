#!/usr/bin/env node
const program = require('commander')
const inquirer = require('inquirer')
const fs = require('fs')
const handlebars = require('handlebars')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
var rm = require('rimraf').sync
const git = require('simple-git')()

program
  .command('init <name>')
  .description('创建一个项目，name必填')
  .option('-g, --git', '项目创建后自动初始化git,默认手动')
  .option('-s, --ssh', '使用ssh方式下载模板,默认http方式')
  .action((name, cmd) => {
    if (!fs.existsSync(name)) {
      const options = [
        {
          type: 'input',
          name: 'author',
          message: '请输入作者名称'
        },
        {
          type: 'input',
          name: 'description',
          message: '请输入项目描述'
        }
      ]
      inquirer.prompt(options)
        .then(answers => {
          const spinner = ora('正在下载模板...')
          spinner.start()
          let url = 'https://github.com/yanyongchao/yl-vue-cli.git'
          if (cmd.ssh) {
            url = 'git@github.com:yanyongchao/yl-vue-cli.git'
          }
          const handlerFn = (err) => {
            if (err) {
              spinner.fail()
              console.log(symbols.error, chalk.red(err))
            } else {
              spinner.succeed('下载模板成功')
              rm(name + '/.git')
              const meta = {
                name,
                author: answers.author,
                description: answers.description
              }
              const fileName = `${name}/package.json`
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString()
                const result = handlebars.compile(content)(meta)
                fs.writeFileSync(fileName, result)
              }
              console.log(symbols.success, '项目初始化成功')
              console.log(`------请按下列命令设置git------`)
              console.log(`cd ${name} && git init`)
              if (cmd.ssh) {
                console.log(`git remote add origin git@github.com:yanyongchao/${name}.git`)
              } else {
                console.log(`git remote add origin https://github.com/yanyongchao/${name}.git`)
              }
              console.log(`git add ./*`)
              console.log(`git commit -m first commit!`)
              console.log(`git push -u origin master`)
            }
          }
          git.clone(url, name, handlerFn)
        })
    } else {
      console.log(symbols.error, chalk.red('项目已存在'))
    }
  })

program.parse(process.argv)