@extends('layouts.app')

@section('title', 'Quote Board')

@section('content')
<div class="page active">
  <div class="page-header">
    <h1><i class="fa-solid fa-quote-left"></i> Quote Board <span class="qb-count" id="qb-count"></span></h1>
    <span class="ph-sub">On-duty moments worth remembering</span>
    <span class="ph-storage-notice ph-storage-db"><i class="fa-solid fa-database"></i> Quotes are shared and stored in the database</span>
  </div>
  <div class="page-content">
    <div class="qb-form" id="qb-form">
      <div class="qb-form-label"><i class="fa-solid fa-plus"></i> Submit Quote</div>
      <textarea id="qb-text" class="qb-textarea" placeholder="What was said? (Ctrl+Enter to submit)" rows="3"></textarea>
      <div class="qb-form-row">
        <input id="qb-said-by" class="qb-input" placeholder="Who said it?">
        <input id="qb-context" class="qb-input" placeholder="Context (optional — what was happening)">
        <button class="qb-submit-btn" onclick="qbSubmit()"><i class="fa-solid fa-paper-plane"></i> Submit</button>
      </div>
    </div>
    <div class="qb-controls">
      <div class="qb-tabs">
        <button class="qb-tab active" onclick="qbSetSort('top',this)"><i class="fa-solid fa-fire"></i> Top</button>
        <button class="qb-tab" onclick="qbSetSort('new',this)"><i class="fa-solid fa-clock"></i> New</button>
      </div>
      <input class="qb-search" id="qb-search" placeholder="Search quotes…" oninput="qbSearch(this.value)">
    </div>
    <div class="qb-list" id="qb-list">
      <div class="qb-empty"><i class="fa-solid fa-quote-left"></i><span>Loading quotes…</span></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/quotes.js') }}"></script>
@endpush