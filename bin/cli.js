#!/usr/bin/env node

import prompts from 'prompts';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const response = await prompts([
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        validate: value => value.length === 0 ? 'Project name is required' : true
      },
      {
        type: 'select',
        name: 'template',
        message: 'Select a template:',
        choices: [
          { title: 'JavaScript', value: 'react' },
          { title: 'TypeScript', value: 'react-ts' }
        ],
        initial: 0
      }
    ]);

    if (!response.projectName) {
      console.log(chalk.red('Project creation cancelled'));
      process.exit(1);
    }

    const projectName = response.projectName;
    const template = response.template;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(chalk.blue(`\nCreating a new React app in ${chalk.green(projectPath)} using ${chalk.green(template === 'react' ? 'JavaScript' : 'TypeScript')}`));

    // Create project directory
    await fs.ensureDir(projectPath);

    // Initialize project with Vite
    console.log('\nInitializing project with Vite...');
    await execa('npm', ['create', 'vite@latest', projectName, '--', '--template', template], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    // Install dependencies
    console.log('\nInstalling dependencies...');
    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    // Install Tailwind CSS and DaisyUI
    console.log('\nInstalling Tailwind CSS and DaisyUI...');
    await execa('npm', ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer', 'daisyui'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    // Create Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk"],
  },
}`;

    await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);

    // Create PostCSS config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    await fs.writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig);

    // Update index.css
    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    await fs.writeFile(path.join(projectPath, 'src/index.css'), indexCss);

    // Update App.jsx with a sample DaisyUI component
    const appJsx = `function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello DaisyUI</h1>
            <p className="py-6">This is a React + Vite project with Tailwind CSS and DaisyUI preconfigured.</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`;

    await fs.writeFile(path.join(projectPath, 'src/App.jsx'), appJsx);

    console.log(chalk.green(`\nSuccess! Created ${projectName} at ${projectPath}`));
    console.log('\nInside that directory, you can run several commands:');
    console.log(chalk.cyan('\n  npm run dev'));
    console.log('    Starts the development server.');
    console.log(chalk.cyan('\n  npm run build'));
    console.log('    Bundles the app into static files for production.');
    console.log(chalk.cyan('\n  npm run preview'));
    console.log('    Previews the built app before deployment.');
    console.log('\nWe suggest that you begin by typing:');
    console.log(chalk.cyan(`\n  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev'));
    console.log('\nHappy hacking!');

  } catch (error) {
    console.error(chalk.red('Error creating project:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
