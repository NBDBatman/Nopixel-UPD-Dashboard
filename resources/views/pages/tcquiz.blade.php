@extends('layouts.app')

@section('title', '10-Codes Quiz')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-circle-question"></i> 10-Codes Quiz</h1><span class="ph-sub">20 random questions per round</span></div>
  <div class="page-content">
    <div class="qz-shell">
      <div class="qz-controls">
        <div class="qz-mode-toggle">
          <button class="tc-mode-btn qz-mode-btn active" onclick="tcSetMode('code',this)">Code → Meaning</button>
          <button class="tc-mode-btn qz-mode-btn" onclick="tcSetMode('desc',this)">Meaning → Code</button>
        </div>
        <div class="qz-stats">
          <span id="tc-score">0 / 20</span>
          <span id="tc-streak" class="qz-streak-pill">Streak: 0</span>
        </div>
      </div>
      <div class="qz-filter-row">
        <button class="tc-filter-btn active" onclick="tcSetFilter('all',this)">All</button>
        <button class="tc-filter-btn" onclick="tcSetFilter('emergency',this)"><span class="qz-filter-dot qz-filter-emergency"></span>Emergency</button>
        <button class="tc-filter-btn" onclick="tcSetFilter('urgent',this)"><span class="qz-filter-dot qz-filter-urgent"></span>Urgent</button>
        <button class="tc-filter-btn" onclick="tcSetFilter('normal',this)">Normal</button>
      </div>
      <div id="tc-game">
        <div class="tc-card" id="tc-card">
          <div class="tc-question" id="tc-question"></div>
          <div class="tc-options" id="tc-options"></div>
          <div class="tc-feedback" id="tc-feedback"></div>
          <div class="tc-next-wrap">
            <button class="qz-submit-btn" id="tc-next" onclick="_tcAdvance()" style="display:none">Next →</button>
          </div>
        </div>
        <div class="qz-progress" id="tc-progress"></div>
      </div>
      <div id="tc-result" class="qz-result-panel" style="display:none"></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/codes.js') }}"></script>
<script src="{{ asset('js/tcquiz.js') }}"></script>
@endpush