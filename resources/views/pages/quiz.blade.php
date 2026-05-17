@extends('layouts.app')

@section('title', 'Phonetics Quiz')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-spell-check"></i> Phonetics Quiz</h1><span class="ph-sub">Test your radio alphabet</span></div>
  <div class="page-content">
    <div class="qz-shell">
      <div class="qz-controls">
        <div class="qz-mode-toggle">
          <button class="qz-mode-btn active" onclick="qzSetMode('nato',this)">NATO</button>
          <button class="qz-mode-btn" onclick="qzSetMode('amer',this)">American</button>
        </div>
        <div class="qz-stats">
          <span id="qz-score">0 / 0</span>
          <span id="qz-streak" class="qz-streak-pill">Streak: 0</span>
        </div>
      </div>
      <div id="qz-game">
        <div class="qz-card" id="qz-card">
          <div class="qz-letter" id="qz-letter">—</div>
          <div class="qz-input-wrap">
            <input type="text" id="qz-input" class="qz-input" placeholder="Type the phonetic word…" autocomplete="off" spellcheck="false">
            <button class="qz-submit-btn" id="qz-submit" onclick="qzSubmit()">Check</button>
          </div>
          <div class="qz-feedback" id="qz-feedback"></div>
        </div>
        <div class="qz-progress" id="qz-progress"></div>
      </div>
      <div id="qz-result" class="qz-result-panel" style="display:none"></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/quiz.js') }}"></script>
@endpush