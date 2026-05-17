@extends('layouts.app')

@section('title', 'Changelog')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-clock-rotate-left"></i> Changelog</h1><span class="ph-sub">Version history</span></div>
  <div class="page-content">
    <div id="cl-root"></div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/changelog.js') }}"></script>
<script>document.readyState==='complete'?renderChangelog():window.addEventListener('load',renderChangelog,{once:true});</script>
@endpush