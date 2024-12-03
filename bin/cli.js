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
        name: 'language',
        message: 'Select a language:',
        choices: [
          { title: 'JavaScript', value: 'react' },
          { title: 'TypeScript', value: 'react-ts' }
        ],
        initial: 0
      },
      {
        type: 'select',
        name: 'template',
        message: 'Select a starter template:',
        choices: [
          { title: 'Basic - Simple starter with navbar', value: 'basic' },
          { title: 'Dashboard - Admin dashboard layout', value: 'dashboard' },
          { title: 'Landing - Modern landing page', value: 'landing' },
          { title: 'E-commerce - Shop layout with cart', value: 'ecommerce' },
          { title: 'Blog - Blog layout with articles', value: 'blog' }
        ],
        initial: 0
      }
    ]);

    if (!response.projectName || !response.template || !response.language) {
      console.log(chalk.red('Project creation cancelled'));
      process.exit(1);
    }

    const projectName = response.projectName;
    const template = response.language;
    const uiTemplate = response.template;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(chalk.blue(`\nCreating a new React app in ${chalk.green(projectPath)}`));
    console.log(chalk.blue(`Language: ${chalk.green(template === 'react' ? 'JavaScript' : 'TypeScript')}`));
    console.log(chalk.blue(`Template: ${chalk.green(uiTemplate)}`));

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

    // Update App.jsx with the selected template
    const templateContent = getTemplateContent(uiTemplate, template === 'react-ts');
    const fileExtension = template === 'react-ts' ? 'tsx' : 'jsx';
    
    await fs.writeFile(path.join(projectPath, `src/App.${fileExtension}`), templateContent);

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

function getTemplateContent(template, isTs) {
  switch (template) {
    case 'basic':
      return basicTemplate(isTs);
    case 'dashboard':
      return dashboardTemplate(isTs);
    case 'landing':
      return landingTemplate(isTs);
    case 'ecommerce':
      return ecommerceTemplate(isTs);
    case 'blog':
      return blogTemplate(isTs);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

function basicTemplate(isTs) {
  return `
function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello World</h1>
            <p className="py-6">This is a basic React + Vite project with Tailwind CSS and DaisyUI preconfigured.</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

function dashboardTemplate(isTs) {
  return `
function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="drawer drawer-mobile">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chases his tail, he will be faster than a dog chasing his tail.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chases his tail, he will be faster than a dog chasing his tail.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Card title!</h2>
                <p>If a dog chases his tail, he will be faster than a dog chasing his tail.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          <ul className="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

function landingTemplate(isTs) {
  return `
function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Landing Page</h1>
            <p className="py-6">This is a modern landing page template.</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

function ecommerceTemplate(isTs) {
  return `
function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">E-commerce</h1>
            <p className="py-6">This is an e-commerce template.</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

function blogTemplate(isTs) {
  return `
function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Blog</h1>
            <p className="py-6">This is a blog template.</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`;
}

main().catch(console.error);
