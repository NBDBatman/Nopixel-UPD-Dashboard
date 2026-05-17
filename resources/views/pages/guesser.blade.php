@extends('layouts.app')

@section('title', 'Street Guesser')

@push('head')
<script src="{{ asset('StreetGuesser/database.js') }}"></script>
<script>
// database.js uses "Areas" for all streets; guesser.js requests "Streets"
if(typeof MAP!=='undefined'){
    if(!MAP.Streets&&MAP.Areas)MAP.Streets=MAP.Areas;
    if(!MAP.Grapeseed&&MAP.Areas){
        MAP.Grapeseed={};
        for(const[k,v]of Object.entries(MAP.Areas)){
            if(k.toLowerCase().includes('grapeseed'))MAP.Grapeseed[k]=v;
        }
    }
}
</script>
@endpush

@section('content')
<div class="page active" id="page-guesser">
  <div class="sg-wrap">
    <div class="sg-tabs">
      <div class="sg-tab active" onclick="switchGame('Streets',this)"><i class="fa-solid fa-map-location-dot"></i> All Streets</div>
      <div class="sg-tab" onclick="switchGame('Vinewood',this)"><i class="fa-solid fa-road"></i> Vinewood</div>
      <div class="sg-tab" onclick="switchGame('MirrorPark',this)"><i class="fa-solid fa-tree-city"></i> Mirror Park</div>
      <div class="sg-tab" onclick="switchGame('Sandy',this)"><i class="fa-solid fa-mountain-sun"></i> Sandy Shores</div>
      <div class="sg-tab" onclick="switchGame('Grapeseed',this)"><i class="fa-solid fa-seedling"></i> Grapeseed</div>
      <div class="sg-tab" onclick="switchGame('Paleto',this)"><i class="fa-solid fa-snowflake"></i> Paleto</div>
      <div class="sg-tab" onclick="switchGame('InnerCityRoads',this)"><i class="fa-solid fa-city"></i> Inner City</div>
    </div>
    <div class="sg-topbar">
      <div class="sg-name" id="sg-name">All Streets</div>
      <div class="sg-mode-toggle">
        <button class="sg-mode-btn active" onclick="setGuesserMode('find',this)">Find It</button>
        <button class="sg-mode-btn" onclick="setGuesserMode('name',this)">Name It</button>
      </div>
      <div class="sg-stats">
        <span class="sg-stat g" id="sg-correct">0 Correct</span>
        <span class="sg-stat r" id="sg-incorrect">0 Incorrect</span>
        <span class="sg-stat" id="sg-timer">0:00</span>
        <span class="sg-stat" id="sg-score">0/0</span>
        <span class="sg-stat sg-streak-stat" id="sg-streak"></span>
        <span class="sg-stat sg-best-stat" id="sg-best"></span>
      </div>
      <button class="sg-btn primary" onclick="sgEngine&&sgEngine.start()" id="sg-start-btn"><i class="fa-solid fa-play"></i> Start</button>
      <button class="sg-btn danger" onclick="sgEngine&&sgEngine.end()" id="sg-giveup" style="display:none">Give Up</button>
      <button class="sg-history-btn" onclick="sgShowHistory()" title="Session History"><i class="fa-solid fa-clock-rotate-left"></i></button>
    </div>
    <div class="sg-canvas-area">
      <canvas id="sg-canvas"></canvas>
      <div class="sg-overlay" id="sg-overlay">
        <div class="sg-result-box">
          <div class="sg-result-title">Game Over</div>
          <div class="sg-result-pct" id="sg-result-pct">0%</div>
          <div class="sg-result-sub">Score</div>
          <div class="sg-result-score" id="sg-result-score">0/0</div>
          <div class="sg-result-sub">Time</div>
          <div class="sg-result-time" id="sg-result-time">0:00</div>
          <div class="sg-result-meta" id="sg-result-best"></div>
          <div class="sg-result-meta" id="sg-result-streak"></div>
          <div id="sg-result-missed"></div>
          <button class="sg-btn primary" onclick="sgEngine&&sgEngine.retry()" style="width:100%;margin-top:8px"><i class="fa-solid fa-rotate-right"></i> Retry</button>
        </div>
      </div>
    </div>
    <div class="sg-bottombar">
      <div id="sg-find-bar" style="display:flex;align-items:center;gap:10px;width:100%;justify-content:center">
        <button class="sg-btn" onclick="sgEngine&&sgEngine.prev()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
        <div class="sg-street-display unstarted" id="sg-street">Click Start to Begin</div>
        <button class="sg-btn" onclick="sgEngine&&sgEngine.next()">Next <i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div id="sg-name-bar" style="display:none;width:100%;justify-content:center">
        <div class="sg-options" id="sg-options"><span class="sg-name-prompt">Click Start to Begin</span></div>
      </div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/database.js') }}"></script>
<script src="{{ asset('js/guesser.js') }}"></script>
@endpush