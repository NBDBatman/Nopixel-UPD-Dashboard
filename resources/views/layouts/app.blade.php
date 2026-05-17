<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UPD Dashboard — @yield('title', 'Dashboard')</title>
<meta name="theme-color" content="#0f1623">
<link rel="icon" href="{{ asset('assets/UPD_Placeholder.webp') }}" type="image/webp">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="{{ asset('css/styles.css') }}">
<script>!function(){document.documentElement.setAttribute('data-theme',localStorage.getItem('upd-theme')||'dark');}();</script>
@stack('head')
</head>
<body>
<aside id="sidebar">
<div class="sb-logo">
  <div class="sb-badge"><img src="{{ asset('assets/UPD_Placeholder.webp') }}" alt="UPD logo"></div>
  <div class="sb-title">UPD Dashboard<span>NoPixel Reference</span><span>UPD Cheat Sheet</span></div>
</div>
<nav class="sb-nav">
  <div class="sb-section">Reference</div>
  <a href="{{ route('home') }}" class="nav-item {{ request()->routeIs('home') ? 'active' : '' }}" data-page="index"><span class="nav-icon"><i class="fa-solid fa-house"></i></span>Home</a>
  <a href="{{ route('codes') }}" class="nav-item {{ request()->routeIs('codes') ? 'active' : '' }}" data-page="codes"><span class="nav-icon"><i class="fa-solid fa-radio"></i></span>10-Codes</a>
  <a href="{{ route('phonetics') }}" class="nav-item {{ request()->routeIs('phonetics') ? 'active' : '' }}" data-page="phonetics"><span class="nav-icon"><i class="fa-solid fa-font"></i></span>Phonetic Alphabets</a>
  <a href="{{ route('laws') }}" class="nav-item {{ request()->routeIs('laws') ? 'active' : '' }}" data-page="laws"><span class="nav-icon"><i class="fa-solid fa-scale-balanced"></i></span>Case Laws</a>
  <a href="{{ route('constitution') }}" class="nav-item {{ request()->routeIs('constitution') ? 'active' : '' }}" data-page="constitution"><span class="nav-icon"><i class="fa-solid fa-scroll"></i></span>Constitution</a>
  <a href="{{ route('jurisdiction') }}" class="nav-item {{ request()->routeIs('jurisdiction') ? 'active' : '' }}" data-page="jurisdiction"><span class="nav-icon"><i class="fa-solid fa-map"></i></span>Jurisdiction Map</a>
  <a href="{{ route('court') }}" class="nav-item {{ request()->routeIs('court') ? 'active' : '' }}" data-page="court"><span class="nav-icon"><i class="fa-solid fa-landmark"></i></span>Court</a>
  <a href="{{ route('templates') }}" class="nav-item {{ request()->routeIs('templates') ? 'active' : '' }}" data-page="templates"><span class="nav-icon"><i class="fa-solid fa-file-lines"></i></span>Templates</a>
  <a href="{{ route('roster') }}" class="nav-item {{ request()->routeIs('roster') ? 'active' : '' }}" data-page="roster"><span class="nav-icon"><i class="fa-solid fa-users"></i></span>Roster</a>
  <div class="sb-section">Operations</div>
  <a href="{{ route('bolo') }}" class="nav-item {{ request()->routeIs('bolo') ? 'active' : '' }}" data-page="bolo"><span class="nav-icon"><i class="fa-solid fa-binoculars"></i></span>BOLO Board</a>
  <a href="{{ route('notepad') }}" class="nav-item {{ request()->routeIs('notepad') ? 'active' : '' }}" data-page="notepad"><span class="nav-icon"><i class="fa-solid fa-note-sticky"></i></span>Notepad</a>
  <a href="{{ route('subpoena') }}" class="nav-item {{ request()->routeIs('subpoena') ? 'active' : '' }}" data-page="subpoena"><span class="nav-icon"><i class="fa-solid fa-magnifying-glass-chart"></i></span>Subpoena</a>
  <a href="{{ route('quotes') }}" class="nav-item {{ request()->routeIs('quotes') ? 'active' : '' }}" data-page="quotes"><span class="nav-icon"><i class="fa-solid fa-quote-left"></i></span>Quote Board</a>
  <div class="sb-section">Training</div>
  <a href="{{ route('guesser') }}" class="nav-item {{ request()->routeIs('guesser') ? 'active' : '' }}" data-page="guesser"><span class="nav-icon"><i class="fa-solid fa-map-location-dot"></i></span>Street Guesser</a>
  <a href="{{ route('quiz') }}" class="nav-item {{ request()->routeIs('quiz') ? 'active' : '' }}" data-page="quiz"><span class="nav-icon"><i class="fa-solid fa-spell-check"></i></span>Phonetics Quiz</a>
  <a href="{{ route('tcquiz') }}" class="nav-item {{ request()->routeIs('tcquiz') ? 'active' : '' }}" data-page="tcquiz"><span class="nav-icon"><i class="fa-solid fa-circle-question"></i></span>10-Codes Quiz</a>
  <a href="{{ route('ucquiz') }}" class="nav-item {{ request()->routeIs('ucquiz') ? 'active' : '' }}" data-page="ucquiz"><span class="nav-icon"><i class="fa-solid fa-car-side"></i></span>Unit Caps Quiz</a>
  <a href="{{ route('clquiz') }}" class="nav-item {{ request()->routeIs('clquiz') ? 'active' : '' }}" data-page="clquiz"><span class="nav-icon"><i class="fa-solid fa-gavel"></i></span>Case Law Quiz</a>
  <div class="sb-section">Info</div>
  <a href="{{ route('changelog') }}" class="nav-item {{ request()->routeIs('changelog') ? 'active' : '' }}" data-page="changelog"><span class="nav-icon"><i class="fa-solid fa-clock-rotate-left"></i></span>Changelog</a>
  <a href="{{ route('credits') }}" class="nav-item {{ request()->routeIs('credits') ? 'active' : '' }}" data-page="credits"><span class="nav-icon"><i class="fa-solid fa-circle-info"></i></span>Credits</a>
</nav>
<div class="sb-quick-links" id="sb-quick-links">
  <div class="sb-section ql-toggle" id="ql-toggle">Quick Links<i class="fa-solid fa-chevron-right ql-chev"></i></div>
  <div class="ql-links">
    <a class="nav-item nav-link" href="https://www.nopixel.net/forum/index.php" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>Nopixel Forums</a>
    <a class="nav-item nav-link" href="https://mdt.na.nopixel.net" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>MDT</a>
    <a class="nav-item nav-link" href="https://docs.google.com/document/d/1x5lYTVD0kfAgB3IxVJ_d3sWAonEn-QiHO6L-mSFXh28/edit?tab=t.0" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>UPD SOP's</a>
    <a class="nav-item nav-link" href="https://docs.google.com/spreadsheets/d/15tE7r-z_8mEjOYRfyZY-3OCE6x-6XRwCKgxFjlD6exE/edit?gid=684178055#gid=684178055" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>UPD Roster</a>
    <a class="nav-item nav-link" href="https://dispatch-system-delta.vercel.app" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>UPD Dispatch</a>
    <a class="nav-item nav-link" href="https://quillbot.com/grammar-check" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>Quillbot</a>
    <a class="nav-item nav-link" href="https://docs.google.com/spreadsheets/d/1v60krFQaqfOU0x4j-KqJ3iz-_bu44F5pQeYpuYNX3nI/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>Remi's Cheat Sheet</a>
    <a class="nav-item nav-link" href="https://docs.google.com/spreadsheets/d/1p6C-M0TnpBGlvJ0U9IJX1l9-UAsY_IIfqTslXcmKY10/edit?gid=1896387435#gid=1896387435" target="_blank" rel="noopener noreferrer"><span class="nav-icon"><i class="fa-solid fa-link"></i></span>Prescriptions</a>
  </div>
</div>
<div class="sb-footer">
  <strong>UPD Dashboard — v2.0</strong>
  <span>Created by <a href="https://github.com/NBDBatman?tab=repositories" target="_blank" rel="noopener noreferrer">MercuryHQ</a>.</span>
  <span>Released under the MIT License.</span>
</div>
</aside>
<div id="online-bar" class="online-bar">
  <span class="ob-live"><span class="ob-dot"></span>ONLINE</span>
  <div class="ob-users" id="ob-users"></div>
  <div class="ob-right">
    <span class="ob-me" id="ob-me">
      {{-- Will be replaced with auth user info in Phase 2 --}}
    </span>
    <span class="ob-time" id="ob-time"></span>
    <button class="ob-theme" id="th-toggle" onclick="toggleTheme()" title="Toggle theme"></button>
    <button class="ob-logout" onclick="logout()" title="Sign out"><i class="fa-solid fa-right-from-bracket"></i></button>
  </div>
</div>
<main id="main">
@yield('content')
</main>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="{{ asset('js/supabase-init.js') }}"></script>
<script src="{{ asset('js/auth.js') }}"></script>
<script src="{{ asset('js/discord.js') }}"></script>
<script src="{{ asset('js/utils.js') }}"></script>
<script src="{{ asset('js/presence.js') }}"></script>
<script src="{{ asset('js/theme.js') }}"></script>
@stack('scripts')
<script>
document.getElementById('ql-toggle')?.addEventListener('click',()=>{
  document.getElementById('sb-quick-links')?.classList.toggle('open');
});

// Pad content so online bar doesn't overlap
const _mainEl=document.getElementById('main');
const _sidebarEl=document.getElementById('sidebar');
if(_mainEl)_mainEl.style.paddingBottom='36px';
if(_sidebarEl)_sidebarEl.style.paddingBottom='36px';

// Clock
function _tickClock(){
  const el=document.getElementById('ob-time');
  if(el)el.textContent=new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',hour12:false});
}
_tickClock();
setInterval(_tickClock,30000);

// Set correct theme icon once theme.js has run
if(typeof _thUpdateIcon==='function')_thUpdateIcon();
</script>
</body>
</html>
