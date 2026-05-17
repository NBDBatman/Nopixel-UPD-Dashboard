@extends('layouts.app')

@section('title', 'Roster')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-users"></i> Roster</h1><span class="ph-sub" id="roster-count">UPD Personnel</span><span class="roster-stamp" id="roster-stamp"></span></div>
  <div class="page-content">
    <div class="roster-bar">
      <div class="search-wrap"><span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span><input type="text" id="roster-search" placeholder="Search by name, callsign, rank…" oninput="renderRoster()"></div>
      <div id="roster-filters" class="roster-filters"></div>
      <button class="roster-refresh" onclick="loadRoster()" title="Refresh from Google Sheets"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
    </div>
    <div id="roster-container"><div class="roster-status">Loading roster…</div></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/roster.js') }}"></script>
@endpush