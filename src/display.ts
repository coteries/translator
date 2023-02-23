import chalk from 'chalk'

const log = console.log

export const display = {
  info: (message: string) => log(chalk.blue(message)),
  success: (message: string) => log(chalk.green(message)),
  error: (message: string) => log(chalk.bold(chalk.red(message))),
  warning: (message: string) => log(chalk.bold(chalk.yellow(message)))
}
