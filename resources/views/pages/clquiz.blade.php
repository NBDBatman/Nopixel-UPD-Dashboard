@extends('layouts.app')

@section('title', 'Case Law Quiz')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-gavel"></i> Case Law Quiz</h1><span class="ph-sub">All 17 laws per round</span></div>
  <div class="page-content">
    <div class="qz-shell qz-shell-wide">
      <div class="qz-controls">
        <div class="qz-mode-toggle">
          <button class="tc-mode-btn qz-mode-btn active" onclick="clSetMode('name',this)">Name → Rule</button>
          <button class="tc-mode-btn qz-mode-btn" onclick="clSetMode('rule',this)">Rule → Name</button>
        </div>
        <div class="qz-stats">
          <span id="cl-score">0 / 17</span>
          <span id="cl-streak" class="qz-streak-pill">Streak: 0</span>
        </div>
      </div>
      <div class="qz-filter-row">
        <button class="cl-filter-btn active" onclick="clSetFilter('all',this)">All</button>
        <button class="cl-filter-btn" onclick="clSetFilter('force',this)">Use of Force</button>
        <button class="cl-filter-btn" onclick="clSetFilter('search',this)">Search &amp; Seizure</button>
        <button class="cl-filter-btn" onclick="clSetFilter('court',this)">Court</button>
        <button class="cl-filter-btn" onclick="clSetFilter('conduct',this)">Conduct</button>
      </div>
      <div id="cl-game">
        <div class="tc-card" id="cl-card">
          <div class="tc-question cl-q-name" id="cl-question"></div>
          <div class="tc-options" id="cl-options"></div>
          <div class="tc-feedback" id="cl-feedback"></div>
          <div class="tc-next-wrap">
            <button class="qz-submit-btn" id="cl-next" onclick="_clAdvance()" style="display:none">Next →</button>
          </div>
        </div>
        <div class="qz-progress" id="cl-progress"></div>
      </div>
      <div id="cl-result" class="qz-result-panel" style="display:none"></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laws.js') }}"></script>
<script src="{{ asset('js/clquiz.js') }}"></script>
@endpush