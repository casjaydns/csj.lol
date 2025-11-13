// Load project configuration from API
let projectConfig = {
  projectName: 'shrtnr',
  projectRepo: 'https://github.com/casjaydns/shrtnr'
};

// Fetch config from API
async function loadProjectConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      projectConfig = config;
      updatePageTitle();
      updateProjectLinks();
    }
  } catch (err) {
    console.warn('Failed to load project config, using defaults:', err);
  }
}

// Update page title with project name
function updatePageTitle() {
  const titleElement = document.querySelector('title');
  if (titleElement) {
    const currentTitle = titleElement.textContent;
    // Replace common variations
    titleElement.textContent = currentTitle
      .replace(/URL Shortner/gi, projectConfig.projectName)
      .replace(/csj\.lol/gi, projectConfig.projectName);
  }
}

// Update all project repository links
function updateProjectLinks() {
  const links = document.querySelectorAll('a[href*="github.com/casjaydns/csj.lol"], a[href*="github.com/casjaydns/shrtnr"]');
  links.forEach(link => {
    link.href = projectConfig.projectRepo;
  });
}

// Load config when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProjectConfig);
} else {
  loadProjectConfig();
}
