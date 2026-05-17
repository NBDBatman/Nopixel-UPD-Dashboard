@extends('layouts.app')

@section('title', 'Credits')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-circle-info"></i> Credits</h1><span class="ph-sub">Project attribution</span></div>
  <div class="page-content">

    <div class="cr-hero">
      <div class="cr-hero-badge"><img src="./assets/UPD_Placeholder.webp" alt="UPD logo"></div>
      <div class="cr-hero-text">
        <div class="cr-hero-top"><h2>UPD Dashboard</h2><span class="cr-version">v2.0</span></div>
        <p>A quick-reference patrol dashboard for NoPixel UPD officers. Covers 10-codes, case laws, constitution, templates, live roster, street guesser training, and more — all in one place.</p>
      </div>
    </div>

    <div class="cr-section-label"><i class="fa-solid fa-users"></i> Contributors</div>
    <div class="cr-contributors">
      <div class="cr-person cr-person-lead">
        <div class="cr-avatar cr-av-img"><img src="https://kappa.lol/mToLAl.png" alt="Nathan Barr"></div>
        <div class="cr-person-body">
          <strong>Nathan Barr</strong>
          <span class="cr-handle">@MercuryHQ &nbsp;·&nbsp; 723</span>
          <span class="cr-role cr-role-dev">Creator &amp; Developer</span>
          <p>Designed and built the dashboard from scratch. Wrote all code, integrated all reference data, and maintains the project.</p>
          <a href="https://github.com/NBDBatman?tab=repositories" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i> NBDBatman on GitHub</a>
        </div>
      </div>
      <div class="cr-person">
        <div class="cr-avatar cr-av-img"><img src="https://i.vgy.me/r7fRcx.png" alt="Troy Drax"></div>
        <div class="cr-person-body">
          <strong>Troy Drax</strong>
          <span class="cr-handle">@donnzy &nbsp;·&nbsp; 251</span>
          <span class="cr-role cr-role-ref">Reference Material</span>
          <p>Contributed reference data and information used across the dashboard.</p>
        </div>
      </div>
      <div class="cr-person">
        <div class="cr-avatar cr-av-img"><img src="https://i.vgy.me/o2dWXy.jpg" alt="Remi Ironside"></div>
        <div class="cr-person-body">
          <strong>Remi Ironside</strong>
          <span class="cr-handle">@unicornfrapp &nbsp;·&nbsp; 595</span>
          <span class="cr-role cr-role-ref">Reference Material &amp; Templates</span>
          <p>Contributed reference data and the report templates used in the Templates tab.</p>
        </div>
      </div>
    </div>

    <div class="cr-section-label"><i class="fa-solid fa-wrench"></i> Built With</div>
    <div class="cr-built">
      <div class="cr-built-card">
        <div class="cr-built-icon"><i class="fa-solid fa-map-location-dot"></i></div>
        <div>
          <strong>Street Guesser</strong>
          <span>Training game by LittlePepperBot</span>
          <a href="https://github.com/LittlePepperBot/StreetGuesser" target="_blank" rel="noopener noreferrer">View repository</a>
        </div>
      </div>
      <div class="cr-built-card">
        <div class="cr-built-icon"><i class="fa-solid fa-icons"></i></div>
        <div>
          <strong>Font Awesome 6</strong>
          <span>All interface icons</span>
        </div>
      </div>
      <div class="cr-built-card">
        <div class="cr-built-icon"><i class="fa-solid fa-table-cells"></i></div>
        <div>
          <strong>Google Sheets</strong>
          <span>Live roster data source</span>
        </div>
      </div>
    </div>

    <div class="cr-license">
      <i class="fa-solid fa-scale-balanced"></i>
      <span>Released under the <strong>MIT License</strong>. Free to use, modify, and distribute with attribution.</span>
    </div>

  </div>
</div>
@endsection