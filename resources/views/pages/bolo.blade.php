@extends('layouts.app')

@section('title', 'BOLO Board')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-binoculars"></i> BOLO Board</h1><span class="ph-sub">Be on the lookout</span><span class="ph-storage-notice ph-storage-db"><i class="fa-solid fa-database"></i> BOLOs are logged and stored in the database</span></div>
  <div class="page-content">
    <div class="bolo-form" id="bolo-form">
      <div class="bolo-form-label" id="bolo-form-label"><i class="fa-solid fa-plus"></i> Add BOLO</div>
      <div class="bolo-form-grid">
        <input type="text" id="bolo-vehicle" class="bolo-input" placeholder="Vehicle (colour, make, model)">
        <input type="text" id="bolo-plate" class="bolo-input" placeholder="Plate">
        <input type="text" id="bolo-suspect" class="bolo-input" placeholder="Suspect description">
        <select id="bolo-priority" class="bolo-input bolo-select">
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>
      <input type="text" id="bolo-owner" class="bolo-input" placeholder="Registered owner" style="margin-bottom:8px">
      <div class="bolo-form-row">
        <input type="text" id="bolo-reason" class="bolo-input" placeholder="Reason / offence — press Enter to add">
        <button class="bolo-add-btn" id="bolo-add-btn" onclick="boloAdd()"><i class="fa-solid fa-plus"></i> Add</button>
      </div>
    </div>
    <div class="bolo-board-bar">
      <div class="bolo-tabs">
        <button class="bolo-tab active" data-f="active" onclick="boloSetFilter('active',this)">Active</button>
        <button class="bolo-tab" data-f="resolved" onclick="boloSetFilter('resolved',this)">Resolved</button>
        <button class="bolo-tab" data-f="all" onclick="boloSetFilter('all',this)">All</button>
      </div>
      <div class="bolo-bar-right">
        <span class="bolo-count" id="bolo-count"></span>
        <button class="bolo-io-btn" onclick="boloImport()"><i class="fa-solid fa-file-import"></i> Import</button>
        <button class="bolo-io-btn" onclick="boloExport()"><i class="fa-solid fa-file-export"></i> Export</button>
        <button class="bolo-clear-btn" id="bolo-clear-btn" onclick="boloClearResolved()" style="display:none"><i class="fa-solid fa-broom"></i> Clear Resolved</button>
      </div>
    </div>
    <div id="bolo-list"></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/bolo.js') }}"></script>
@endpush