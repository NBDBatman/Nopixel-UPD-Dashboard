@extends('layouts.app')

@section('title', 'Unit Caps Quiz')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-car-side"></i> Unit Caps Quiz</h1><span class="ph-sub">All 9 scenarios per round</span></div>
  <div class="page-content">
    <div class="qz-shell">
      <div class="qz-controls">
        <div></div>
        <div class="qz-stats">
          <span id="uc-score">0 / 9</span>
          <span id="uc-streak" class="qz-streak-pill">Streak: 0</span>
        </div>
      </div>
      <div id="uc-game">
        <div class="tc-card" id="uc-card">
          <div class="tc-question tc-q-desc" id="uc-question"></div>
          <div class="tc-options" id="uc-options"></div>
          <div class="tc-feedback" id="uc-feedback"></div>
          <div class="tc-next-wrap">
            <button class="qz-submit-btn" id="uc-next" onclick="_ucAdvance()" style="display:none">Next →</button>
          </div>
        </div>
        <div class="qz-progress" id="uc-progress"></div>
      </div>
      <div id="uc-result" class="qz-result-panel" style="display:none"></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/ucquiz.js') }}"></script>
@endpush