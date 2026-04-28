function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function hl(s,q){return q?s.replace(new RegExp('('+esc(q)+')','gi'),'<mark>$1</mark>'):s}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
