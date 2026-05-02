import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

const dateStr = new Date().toISOString().split('T')[0];

// 重新整理配置，确保逻辑清晰
const CONFIG = {
    "长文/刊文 (Article)": {
        src: "templates/article.md",
        dest: "src/content/posts/essay"
    },
    "诗词散文 (Poem)": {
        src: "templates/poem.md",
        dest: "src/content/posts/essay"
    },
    "技术/其他 (Post)": {
        src: "templates/post.md",
        dest: "src/content/posts"
    }
};

async function create() {
    try {
        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: '请选择要创建的文章模板:',
                choices: Object.keys(CONFIG)
            }
        ]);

        const item = CONFIG[choice];
        
        // 安全检查：防止 choice 拿不到对应的 item
        if (!item) {
            console.error('\x1b[31m✘ 选择无效\x1b[0m');
            return;
        }

        const templatePath = item.src;
        const targetDir = item.dest;

        // 1. 检查模板是否存在
        if (!fs.existsSync(templatePath)) {
            console.error(`\x1b[31m✘ 找不到模板文件: ${templatePath}\x1b[0m`);
            return;
        }

        // 2. 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // 3. 计算序号文件名
        const files = fs.readdirSync(targetDir);
        const existingIndices = files
            .filter(f => f.startsWith(dateStr))
            .map(f => {
                const parts = f.split('-');
                const indexPart = parts[parts.length - 1].replace('.md', '');
                return parseInt(indexPart) || 0;
            });

        const nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;
        const fileName = `${dateStr}-${nextIndex.toString().padStart(2, '0')}.md`;
        const finalPath = path.join(targetDir, fileName);

        // 4. 执行复制
        fs.copyFileSync(templatePath, finalPath);
        console.log('\x1b[32m%s\x1b[0m', `\n✔ 成功！已复制 [${path.basename(templatePath)}]`);
        console.log(`\x1b[36m➜ 目标位置: ${finalPath}\x1b[0m`);

    } catch (err) {
        console.error(`\x1b[31m✘ 发生错误: ${err.message}\x1b[0m`);
    }
}

create();

