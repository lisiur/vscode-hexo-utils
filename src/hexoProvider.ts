import * as vscode from 'vscode';
import { isHexoProject, getDirFiles } from './utils';
import * as path from 'path';
import { ArticleTypes } from './commands';
import { HexoCommands } from './extension';

export class HexoArticleProvider implements vscode.TreeDataProvider<ArticleItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ArticleItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  type = ArticleTypes.post;

  constructor(type: ArticleTypes) {
    this.type = type;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ArticleItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: ArticleItem): Promise<ArticleItem[]> {
    const items: ArticleItem[] = [];
    if (!isHexoProject()) {
      return items;
    }

    const postsPath = path.join(vscode.workspace.rootPath as string, 'source', `_${this.type}s`);

    const paths = await getDirFiles(postsPath);

    paths.forEach((p) => {
      if (/\.md$/.test(p)) {
        items.push(new ArticleItem(p, path.join(postsPath, p)));
      }
    });

    return items;
  }
}

export class ArticleItem extends vscode.TreeItem {
  iconPath = vscode.ThemeIcon.File;

  constructor(label: string, uri: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);

    this.resourceUri = vscode.Uri.file(uri);
    this.command = {
      title: 'open',
      command: HexoCommands.open,
      arguments: [uri],
    };
  }
}