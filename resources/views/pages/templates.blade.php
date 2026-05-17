@extends('layouts.app')

@section('title', 'Templates')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-file-lines"></i> Templates</h1><span class="ph-sub" id="tmpl-count">Report Templates</span></div>
  <div class="page-content">
    <div class="tmpl-grid" id="tmpl-container"></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/templates.js') }}"></script>
@endpush