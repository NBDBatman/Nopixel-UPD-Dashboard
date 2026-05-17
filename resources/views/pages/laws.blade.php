@extends('layouts.app')

@section('title', 'Case Laws')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-scale-balanced"></i> Case Laws</h1><span class="ph-sub" id="laws-count">Reference library</span></div>
  <div class="page-content">
    <div class="law-tools">
      <div class="search-wrap law-search"><span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span><input type="text" id="laws-search" placeholder="Search case names, categories, or standards..." oninput="renderLaws()"></div>
      <div class="law-filters">
        <button class="law-filter-btn active" type="button" onclick="setLawFilter(this,'all')">All</button>
        <button class="law-filter-btn force" type="button" onclick="setLawFilter(this,'force')">Force</button>
        <button class="law-filter-btn search" type="button" onclick="setLawFilter(this,'search')">Search</button>
        <button class="law-filter-btn court" type="button" onclick="setLawFilter(this,'court')">Court</button>
        <button class="law-filter-btn conduct" type="button" onclick="setLawFilter(this,'conduct')">Conduct</button>
      </div>
    </div>
    <div id="law-detail" class="law-detail" onclick="if(event.target===this)clearLawDetail()"></div>
    <div id="laws-container" class="law-grid"></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laws.js') }}"></script>
@endpush