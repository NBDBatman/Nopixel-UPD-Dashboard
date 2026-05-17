@extends('layouts.app')

@section('title', 'Jurisdiction Map')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-map"></i> Jurisdiction Map</h1><span class="ph-sub">San Andreas law enforcement jurisdictions</span></div>
  <div class="page-content jurisdiction-content">
    <img src="./assets/map-jurisdictions.jpg" alt="Map of San Andreas — Jurisdiction boundaries" class="jurisdiction-map">
  </div>
</div>
@endsection