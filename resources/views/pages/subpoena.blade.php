@extends('layouts.app')

@section('title', 'Subpoena Analyser')

@section('content')
<div class="page active" id="page-subpoena">
  <div class="page-header">
    <h1><i class="fa-solid fa-magnifying-glass-chart"></i> Subpoena Analyser</h1>
    <div class="sp-mode-toggle">
      <button class="sp-mode-btn active" onclick="spSetMode('phone',this)"><i class="fa-solid fa-mobile-screen-button"></i> Phone</button>
      <button class="sp-mode-btn" onclick="spSetMode('bank',this)"><i class="fa-solid fa-building-columns"></i> Bank</button>
    </div>
    <span class="ph-sub">Files are never uploaded</span><span class="ph-storage-notice ph-storage-local"><i class="fa-solid fa-triangle-exclamation"></i> Cases are stored in your browser only — clearing browser data or cache will permanently delete them</span>
  </div>

  <div id="sp-main" class="sp-main">
    <!-- Cases sidebar -->
    <div class="sp-cases-sidebar" id="sp-cases-sidebar">
      <div class="sp-cases-hd">
        <span>Cases</span>
        <button class="sp-cases-new-btn" onclick="spNewCase()" title="New case"><i class="fa-solid fa-plus"></i></button>
      </div>
      <div class="sp-cases-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search cases…" oninput="spSearchCases(this.value)">
      </div>
      <div class="sp-cases-tabs">
        <button class="sp-cases-tab active" onclick="spSetCaseView('active',this)">Active</button>
        <button class="sp-cases-tab" onclick="spSetCaseView('archived',this)">Archived</button>
        <button class="sp-cases-tab" onclick="spSetCaseView('trash',this)">Trash</button>
      </div>
      <div id="sp-cases-list" class="sp-cases-list"></div>
      <div class="sp-cases-footer" id="sp-cases-trash-footer" style="display:none">
        <button class="sp-cases-empty-trash" onclick="spEmptySpTrash()"><i class="fa-solid fa-trash"></i> Empty Trash</button>
      </div>
    </div>
    <!-- Case content area -->
    <div class="sp-case-area" id="sp-case-area">
      <!-- ── PHONE ── -->
      <div id="sp-phone" class="sp-panel">
        <div class="sp-controls">
          <button class="np-btn" onclick="spUploadPhone()"><i class="fa-solid fa-upload"></i> Load Files</button>
          <button class="np-btn" onclick="spImportPhonebook()" title="Import number→name CSV"><i class="fa-solid fa-address-book"></i> Import Contacts</button>
          <button class="np-btn" onclick="spExportContacts()" title="Export saved contacts as CSV"><i class="fa-solid fa-download"></i> Export Contacts</button>
          <button class="np-btn" onclick="spShowBulkNaming()"><i class="fa-solid fa-users-gear"></i> Name All</button>
          <button class="np-btn" onclick="spShowSharedContacts()"><i class="fa-solid fa-link"></i> Shared</button>
          <div class="search-wrap sp-search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="sp-phone-search" placeholder="Search messages or contacts…" oninput="spPhoneSearch()">
          </div>
          <button class="np-btn" onclick="spOpenExport('phone')" id="sp-phone-export-btn" style="display:none"><i class="fa-solid fa-file-export"></i> Export</button>
          <button class="np-btn np-btn-danger" onclick="spClearPhone()"><i class="fa-solid fa-trash"></i> Clear</button>
        </div>
        <div id="sp-phone-empty" class="sp-empty-state">
          <i class="fa-solid fa-mobile-screen-button"></i>
          <strong>No phone records loaded</strong>
          <span>Upload one or more phone subpoena Excel files to get started.</span>
          <button class="np-btn" onclick="spUploadPhone()"><i class="fa-solid fa-upload"></i> Load Files</button>
        </div>
        <div id="sp-phone-split" class="sp-split" style="display:none">
          <div class="sp-sidebar">
            <div class="sp-sidebar-tabs">
              <button class="sp-sb-tab active" onclick="spSidebarTab('convos',this)">Conversations</button>
              <button class="sp-sb-tab" onclick="spSidebarTab('stats',this)">Stats</button>
            </div>
            <div id="sp-convo-list" class="sp-convo-list"></div>
            <div id="sp-stats-panel" class="sp-stats-panel" style="display:none"></div>
          </div>
          <div class="sp-thread">
            <div class="sp-thread-header" id="sp-thread-header"></div>
            <div class="sp-messages" id="sp-messages">
              <div class="sp-empty sp-empty-thread"><i class="fa-solid fa-comments"></i><span>Select a conversation</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- ── BANK ── -->
      <div id="sp-bank" class="sp-panel" style="display:none">
        <div class="sp-controls">
          <button class="np-btn" onclick="spUploadBank()"><i class="fa-solid fa-upload"></i> Load Files</button>
          <div class="search-wrap sp-search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="sp-bank-search" placeholder="Search transactions…" oninput="spBankSearch()">
          </div>
          <select class="roster-filter-sel" id="sp-bank-type" onchange="spBankFilter()"><option value="">All Types</option></select>
          <select class="roster-filter-sel" id="sp-bank-dir" onchange="spBankFilter()"><option value="">All Directions</option></select>
          <div class="sp-col-btn-wrap">
            <button class="np-btn" onclick="spToggleBankColPicker(this)"><i class="fa-solid fa-table-columns"></i> Columns</button>
          </div>
          <button class="np-btn" onclick="spOpenExport('bank')" id="sp-bank-export-btn" style="display:none"><i class="fa-solid fa-file-export"></i> Export</button>
          <button class="np-btn np-btn-danger" onclick="spClearBank()"><i class="fa-solid fa-trash"></i> Clear</button>
        </div>
        <div id="sp-bank-empty" class="sp-empty-state">
          <i class="fa-solid fa-building-columns"></i>
          <strong>No bank records loaded</strong>
          <span>Upload one or more bank subpoena Excel files to get started.</span>
          <button class="np-btn" onclick="spUploadBank()"><i class="fa-solid fa-upload"></i> Load Files</button>
        </div>
        <div id="sp-bank-content" style="display:none;flex-direction:row;flex:1;overflow:hidden">
          <div class="sp-sidebar sp-bank-sidebar">
            <div class="sp-bank-sidebar-hd">Bank Views</div>
            <div id="sp-account-list" class="sp-convo-list"></div>
          </div>
          <div class="sp-bank-main">
            <div class="sp-bank-view-header"><i class="fa-solid fa-layer-group"></i><span id="sp-bank-view-title">All Transactions</span></div>
            <div class="sp-stats-bar" id="sp-bank-stats"></div>
            <div class="tbl-wrap sp-bank-tbl">
              <table>
                <thead><tr id="sp-bank-head">
                  <th>Date</th><th>Type</th><th>Direction</th><th>From</th><th>To</th><th>Amount</th><th>Comment</th>
                </tr></thead>
                <tbody id="sp-bank-body"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- ── EXPORT OVERLAY ── -->
  <div id="sp-export-overlay" class="sp-export-overlay" style="display:none">
    <div class="sp-export-topbar">
      <button class="np-btn" onclick="spCloseExport()"><i class="fa-solid fa-arrow-left"></i> Back</button>
      <span class="sp-export-hint"><i class="fa-solid fa-eye-slash"></i> Click any entry to hide it from the export</span>
      <button class="np-btn" id="sp-create-png-btn" onclick="spCreatePng()"><i class="fa-solid fa-image"></i> Create PNG</button>
    </div>
    <div class="sp-export-scroll">
      <div class="sp-export-content" id="sp-export-content"></div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="{{ asset('js/subpoena.js') }}"></script>
@endpush