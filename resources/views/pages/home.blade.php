@extends('layouts.app')

@section('title', 'Home')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-house"></i> Home</h1><span class="ph-sub">Quick Reference</span></div>
  <div class="page-content home-content">
    <div class="home-shell">
      <section class="response-strip">
        <div class="response-code green"><span>Code 1</span><strong>Routine</strong><small>No lights or sirens</small></div>
        <div class="response-code yellow"><span>Code 2</span><strong>Priority</strong><small>Lights only</small></div>
        <div class="response-code red"><span>Code 3</span><strong>Emergency</strong><small>Lights and sirens</small></div>
        <div class="response-code blue"><span>Code 4</span><strong>Clear</strong><small>Scene secure</small></div>
        <div class="response-code blue"><span>Code 6</span><strong>Investigating</strong><small>Area investigation</small></div>
      </section>
      <section class="home-board">
        <div class="home-card span-2">
          <div class="home-card-head"><span><i class="fa-solid fa-tower-broadcast"></i> Pursuit Comms</span></div>
          <div class="phrase-grid">
            <span>[CALLSIGN] 10-80 with [VEHICLE DESC]</span>
            <span>Vehicle is [# OCCUPANTS] UP</span>
            <span>Traffic [LIGHT/MODERATE/HEAVY]</span>
            <span>Weather [CLEAR/FOGGY/RAINY]</span>
            <span>[DIRECTION] ON [ROAD]</span>
            <span>SPEED [AVG SPEED]</span>
          </div>
        </div>
        <div class="home-card radio-card">
          <div class="home-card-head"><span><i class="fa-solid fa-radio"></i> Radio</span></div>
          <div class="radio-list">
            <div><span>Ch. 1</span><strong>Patrol</strong></div>
            <div><span>Ch. 3</span><strong>ODPD</strong></div>
            <div><span>Ch. 7</span><strong>PD Tow</strong></div>
            <div><span>Ch. 10</span><strong>Doctors</strong></div>
            <div><span>Ch. 15</span><strong>DOC</strong></div>
            <div><span>Ch. 18</span><strong>Marshals</strong></div>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-car-side"></i> Unit Caps</span></div>
          <div class="data-list">
            <div><strong>Foot Pursuit</strong><span>2 Officers/Suspect</span></div>
            <div><strong>Vehicle Pursuit / Boosts</strong><span>4 Units + 2/interference</span></div>
            <div><strong>Street Races / 99D</strong><span>4 Units/car + Air 1</span></div>
            <div><strong>24/7 / Laundromat</strong><span>4 Units</span></div>
            <div><strong>Cash Exchange / Jewelry / Fleeca</strong><span>6 Units</span></div>
            <div><strong>Paleto / Ammo Crate / 37A</strong><span>6 Units + Air 1</span></div>
            <div><strong>Security Truck</strong><span>14 Units + Air 1</span></div>
            <div><strong>Maze Bank / Art Asylum</strong><span>8-12 Units + Air 1</span></div>
            <div><strong>Powerplant Disruption</strong><span>10 Units + Air 1</span></div>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-handcuffs"></i> Use of Force</span></div>
          <div class="force-scale">
            <div class="force-rung r-green"><span class="force-lvl">01</span><div><strong>Presence</strong><span>Officer as deterrent</span></div></div>
            <div class="force-rung r-green"><span class="force-lvl">02</span><div><strong>Verbalisation</strong><span>Verbal commands</span></div></div>
            <div class="force-rung r-gold"><span class="force-lvl">03</span><div><strong>Empty Hand</strong><span>Cuffs and tackling</span></div></div>
            <div class="force-rung r-gold"><span class="force-lvl">04</span><div><strong>Less Lethal</strong><span>Tasers and batons</span></div></div>
            <div class="force-rung r-red"><span class="force-lvl">05</span><div><strong>Lethal</strong><span>Firearms</span></div></div>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-keyboard"></i> Commands &amp; Keybinds</span></div>
          <div class="command-list">
            <span class="cmd">↑</span><span>Strong Handcuffs</span>
            <span class="cmd">↓</span><span>Soft Cuffs / Uncuff</span>
            <span class="cmd">←</span><span>Escort</span>
            <span class="cmd">/clear</span><span>Clear GPS blips</span>
            <span class="cmd">/resetmdt</span><span>Restart MDT</span>
            <span class="cmd">/runplate</span><span>Run a plate</span>
            <span class="cmd">/flagplate</span><span>Flag a plate</span>
            <span class="cmd">/unflagplate</span><span>Remove plate flag</span>
            <span class="cmd">/radar</span><span>Toggle radar</span>
            <span class="cmd">/jail</span><span>[ID] [Time]</span>
            <span class="cmd">/bill</span><span>[ID] [Amount]</span>
            <span class="cmd">/requestlawyer</span><span>Request a lawyer — Name, Station &amp; Charge/s</span>
          </div>
        </div>
        <div class="home-card span-2">
          <div class="home-card-head"><span><i class="fa-solid fa-scale-balanced"></i> Legal Standards</span></div>
          <div class="legal-list">
            <div><strong>Reasonable Suspicion</strong><span>More than a hunch, less than PC. Grounds for detainment.</span></div>
            <div><strong>Probable Cause</strong><span>Logical belief supported by facts that a crime is connected.</span></div>
            <div><strong>Person Search</strong><span>Consent or probable cause.</span></div>
            <div><strong>Vehicle Search</strong><span>Consent, PC, arrest-related search, or legal impound.</span></div>
            <div><strong>Property Search</strong><span>Consent, warrant, or exigent circumstances.</span></div>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-clipboard-list"></i> Reports</span></div>
          <div class="report-list">
            <span>Always third person.</span>
            <span>Never use 10-codes.</span>
            <span>Articulate every charge.</span>
            <span>Include custodial actions.</span>
          </div>
        </div>
      </section>
      <section class="home-row">
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-scale-balanced"></i> Miranda Rights</span></div>
          <div class="miranda-script">
            <span>You have the right to remain silent.</span>
            <span>Anything you say can and will be used against you in a court of law.</span>
            <span>You have the right to an attorney.</span>
            <span>If you cannot afford one, one will be appointed to you free of charge by the State if available.</span>
            <span>Do you understand these rights as I have read them to you, Sir/Ma'am?</span>
            <span>With these rights in mind, do you wish to continue speaking with me?</span>
          </div>
        </div>
        <div class="home-card clown-card">
          <div class="home-card-head"><span><i class="fa-solid fa-gavel"></i> Clown Rights</span></div>
          <div class="clown-script">
            <span>You have the right to remain silly.</span>
            <span>Anything you say can and will be used against you in a clown court of law.</span>
            <span>You have the right to a cupcake.</span>
            <span>If you cannot afford a cupcake, one will be provided for you fresh from the funpile by Officer/Deputy [any].</span>
            <span>Do you understand the clown rights I have just read to you?</span>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span><i class="fa-solid fa-sitemap"></i> Chain of Command</span></div>
          <div class="chain-list">
            <div><span>1</span><strong>Chief / Sheriff</strong></div>
            <div><span>2</span><strong>Asst. Chief / Under Sheriff</strong></div>
            <div><span>3</span><strong>Captain</strong></div>
            <div><span>4</span><strong>Lieutenant</strong></div>
            <div><span>5</span><strong>Sergeant</strong></div>
            <div><span>6</span><strong>Senior Officer / Deputy</strong></div>
            <div><span>7</span><strong>Full Officer / Deputy</strong></div>
            <div><span>8</span><strong>PPO</strong></div>
            <div><span>9</span><strong>Cadet</strong></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>
@endsection