@extends('layouts.app')

@section('title', '10-Codes')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-radio"></i> 10-Codes</h1><span class="ph-sub" id="codes-count"></span></div>
  <div class="page-content codes-content">
    <div class="codes-bar">
      <div class="search-wrap"><span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span><input type="text" id="codes-search" placeholder="Search codes or descriptions…" oninput="renderCodes()"></div>
      <div class="codes-filter-btns">
        <button class="code-filt active" onclick="setFilter(this,'all')">All</button>
        <button class="code-filt emergency" onclick="setFilter(this,'emergency')"><i class="fa-solid fa-circle"></i> Emergency</button>
        <button class="code-filt urgent" onclick="setFilter(this,'urgent')"><i class="fa-solid fa-circle"></i> Urgent</button>
      </div>
    </div>
    <div id="codes-grid"></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/codes.js') }}"></script>
@endpush