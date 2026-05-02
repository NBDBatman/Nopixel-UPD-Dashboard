function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('upd-theme',t);
  _thUpdateIcon();
}

function toggleTheme(){
  const current=document.documentElement.getAttribute('data-theme')||'dark';
  setTheme(current==='dark'?'light':'dark');
}

function _thUpdateIcon(){
  const t=document.documentElement.getAttribute('data-theme')||'dark';
  const btn=document.getElementById('th-toggle');
  if(!btn)return;
  btn.innerHTML=t==='dark'?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>';
  btn.title=t==='dark'?'Switch to light mode':'Switch to dark mode';
}

document.addEventListener('DOMContentLoaded',_thUpdateIcon);
