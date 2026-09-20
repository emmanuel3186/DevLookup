let searchForm = document.querySelector("#search-form");
const themeToggleBtn = document.querySelector("#theme-toggle");
const languageColors = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  html: "#e34c26",
  css: "#563d7c",
  python: "#3572A5",
  c: "#555555",
  "c++": "#f34b7d",
  php: "#4F5D95",
  ruby: "#701516",
  go: "#00ADD8",
  rust: "#dea584",
  java: "#b07219"
};
function allEventListener(){
  searchForm.addEventListener("submit", performAction);
  const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function applySystemTheme(e) {
    if (e.matches) {
    document.documentElement.classList.add('dark');
   } else {
    document.documentElement.classList.remove('dark');
   }
  }
  applySystemTheme(systemDarkQuery);
  systemDarkQuery.addEventListener('change', applySystemTheme);
  async function performAction(e){
    e.preventDefault();
    const searchInput = document.querySelector("#search-bar");
    let name = searchInput.value.trim().toLowerCase();
    const stats = document.querySelector("#stats");
    if(!name) return;
    stats.innerHTML = "Exploring...";
    try{
      const response = await fetch(`/api/dev/username?name=${name}`);
      const data =  await response.json();
      if(data.error){
        stats.innerHTML = data.error;
      }else{
        const profileHTML = `
        <div class="profile-card">
          <div class="profile-header">
            <img src="${data.resdata.avatar_url}&s=160" alt="${data.resdata.name}" loading="lazy" 
            width="80" height="80" class="profile-avatar"/>
            <div class="profile-info">
              <h2 class="profile-name">${data.resdata.name || data.resdata.login}</h2>
              <a href="${data.resdata.html_url}" target="_blank" class="profile-handle">@${data.resdata.login}</a>
              <p class="profile-bio">${data.resdata.bio || 'No bio available'}</p>
            </div>
          </div>
          <hr class="profile-divider" />
          <div class="stats-badges">
            <div class="badge">
              <span class="badge-num">${data.resdata.public_repos}</span>
              <span class="badge-label">Repositories</span>
            </div>
            <div class="badge">
              <span class="badge-num">${data.resdata.followers}</span>
              <span class="badge-label">Followers</span>
            </div>
            <div class="badge">
              <span class="badge-num">${data.resdata.following}</span>
              <span class="badge-label">Following</span>
            </div>
          </div>
        </div>
        <h3 class="section-title">Repositories</h3>
        <div class="repo-grid">
          ${data.repo.sort((a, b) => b.stargazers_count - a.stargazers_count)
            .map((r, index) => {
              let bentoClass = 'standard';
              if (index === 0) {
                bentoClass = 'featured';
              } else if (index === 3) {
                bentoClass = 'wide';
              }
              const langKey = r.language ? r.language.toLowerCase() : '';
              const dotColor = languageColors[langKey] || '#8b949e';
            return `
              <div class="repo-card ${bentoClass}">
                <div class="repo-header">
                  <div class="repo-title-wrapper">
                    <span class="repo-icon">📁</span>
                    <a href="${r.html_url}" target="_blank" class="repo-title">${r.name}</a>
                  </div>
                  <span class="repo-stars">⭐ ${r.stargazers_count}</span>
                </div>

                <p class="repo-description">
                  ${r.description || 'No description available for this repository.'}
                </p>

                <div class="repo-footer">
                  <div class="language-pill">
                    <span class="language-dot" style="background-color: ${dotColor};"></span>
                    ${r.language || 'N/A'}
                  </div>
                  ${index === 0 ? '<span class="featured-badge">Top Repo</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      stats.innerHTML = profileHTML;
      }
    }catch(error){
      console.error(error)
      stats.innerHTML = "An error occurred while fetching data.";
      let timeoutId;
      if(timeoutId){
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() =>{
      stats.innerHTML = "";}, 1500);
    }
  }
}
allEventListener();