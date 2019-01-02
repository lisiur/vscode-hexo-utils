import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as commandExists from 'command-exists';

function getPkg() {
  const rootPath = vscode.workspace.rootPath;
  if (!rootPath) {
    return null;
  }

  const pkgPath = path.join(rootPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  const pkg = fs.readFileSync(pkgPath, { encoding: 'utf-8' });

  return JSON.parse(pkg);
}

function isHexoProject(): boolean {
  const pkg = getPkg();
  const isHexo = !!(pkg && pkg.dependencies && pkg.dependencies.hexo);

  if (!isHexo) {
    vscode.window.showInformationMessage('This project is not a hexo project');
  }

  return isHexo;
}

function exec(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: vscode.workspace.rootPath,
      shell: true,
    });

    proc.on('exit', () => {
      resolve();
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

function getPkgManagerCommand() {
  const useNPM = commandExists.sync('npm');
  const useYARN = commandExists.sync('yarn');

  return useYARN ? 'yarn' : useNPM ? 'npm' : null;
}

export { isHexoProject, exec, getPkgManagerCommand };
