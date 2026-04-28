(function(){
  const getPage=()=>location.pathname.split('/').pop().replace('.html','')||'index';

  function setActive(page){
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  }

  setActive(getPage());

  document.getElementById('ql-toggle')?.addEventListener('click',()=>{
    document.getElementById('sb-quick-links')?.classList.toggle('open');
  });

  // Track which page scripts have already been loaded
  const loadedScripts=new Set([...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')));

  async function swapPage(href,page,pushState){
    try{
      const res=await fetch(href,{cache:'default'});
      if(!res.ok)throw new Error(res.status);
      const doc=new DOMParser().parseFromString(await res.text(),'text/html');
      const newMain=doc.getElementById('main');
      if(!newMain){location.href=href;return;}

      // Swap content — sidebar stays untouched
      document.getElementById('main').innerHTML=newMain.innerHTML;
      if(pushState)history.pushState({page},'',href);
      setActive(page);
      document.getElementById('main').scrollTop=0;

      // Load any scripts the target page needs that aren't loaded yet, in order
      const srcs=[...doc.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
      for(const src of srcs){
        if(loadedScripts.has(src))continue;
        loadedScripts.add(src);
        await new Promise((ok,fail)=>{
          const s=document.createElement('script');
          s.src=src;s.onload=ok;s.onerror=fail;
          document.body.appendChild(s);
        });
      }

      // Run the page's init function if registered
      window.__pageInits?.[page]?.();
    }catch(e){
      location.href=href; // fall back to real navigation
    }
  }

  // Intercept clicks on internal nav links
  document.getElementById('sidebar')?.addEventListener('click',e=>{
    const link=e.target.closest('a.nav-item[data-page]');
    if(!link)return;
    const href=link.getAttribute('href');
    if(!href||href.startsWith('http'))return;
    e.preventDefault();
    const page=href.replace('./','').replace('.html','')||'index';
    swapPage(href,page,true);
  });

  // Handle browser back/forward
  window.addEventListener('popstate',()=>swapPage(location.href,getPage(),false));
})();
