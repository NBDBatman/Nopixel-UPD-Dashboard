@extends('layouts.app')

@section('title', 'Phonetic Alphabets')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-font"></i> Phonetic Alphabets</h1><span class="ph-sub">Radio spelling reference</span></div>
  <div class="page-content">
    <div class="pc-converter">
      <div class="pc-conv-head">
        <span class="pc-conv-title"><i class="fa-solid fa-keyboard"></i> Plate / Name Converter</span>
        <div class="pc-alpha-toggle">
          <button class="pc-alpha-btn active" onclick="pcSetAlpha('nato',this)">NATO</button>
          <button class="pc-alpha-btn" onclick="pcSetAlpha('amer',this)">American</button>
        </div>
      </div>
      <div class="pc-input-row">
        <input type="text" id="pc-input" class="pc-input" placeholder="Type a plate or name… e.g. 4XLR023" maxlength="20" autocomplete="off" spellcheck="false">
        <button class="pc-copy-btn" id="pc-copy" onclick="pcCopy()" disabled><i class="fa-solid fa-copy"></i> Copy</button>
      </div>
      <div class="pc-output" id="pc-output"><span class="pc-placeholder">Output will appear here</span></div>
    </div>
    <div class="phonetic-tables">
      <div class="tbl-wrap">
        <table>
          <thead><tr><th colspan="4">NATO Phonetic Alphabet</th></tr></thead>
          <tbody>
            <tr><td class="ph-l">A</td><td>Alpha</td><td class="ph-l">N</td><td>November</td></tr>
            <tr><td class="ph-l">B</td><td>Bravo</td><td class="ph-l">O</td><td>Oscar</td></tr>
            <tr><td class="ph-l">C</td><td>Charlie</td><td class="ph-l">P</td><td>Papa</td></tr>
            <tr><td class="ph-l">D</td><td>Delta</td><td class="ph-l">Q</td><td>Quebec</td></tr>
            <tr><td class="ph-l">E</td><td>Echo</td><td class="ph-l">R</td><td>Romeo</td></tr>
            <tr><td class="ph-l">F</td><td>Foxtrot</td><td class="ph-l">S</td><td>Sierra</td></tr>
            <tr><td class="ph-l">G</td><td>Golf</td><td class="ph-l">T</td><td>Tango</td></tr>
            <tr><td class="ph-l">H</td><td>Hotel</td><td class="ph-l">U</td><td>Uniform</td></tr>
            <tr><td class="ph-l">I</td><td>India</td><td class="ph-l">V</td><td>Victor</td></tr>
            <tr><td class="ph-l">J</td><td>Juliet</td><td class="ph-l">W</td><td>Whiskey</td></tr>
            <tr><td class="ph-l">K</td><td>Kilo</td><td class="ph-l">X</td><td>X-Ray</td></tr>
            <tr><td class="ph-l">L</td><td>Lima</td><td class="ph-l">Y</td><td>Yankee</td></tr>
            <tr><td class="ph-l">M</td><td>Mike</td><td class="ph-l">Z</td><td>Zulu</td></tr>
          </tbody>
        </table>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th colspan="4">American Phonetic Alphabet</th></tr></thead>
          <tbody>
            <tr><td class="ph-l">A</td><td>Adam</td><td class="ph-l">N</td><td>Nora</td></tr>
            <tr><td class="ph-l">B</td><td>Boy</td><td class="ph-l">O</td><td>Ocean</td></tr>
            <tr><td class="ph-l">C</td><td>Charles</td><td class="ph-l">P</td><td>Paul</td></tr>
            <tr><td class="ph-l">D</td><td>David</td><td class="ph-l">Q</td><td>Queen</td></tr>
            <tr><td class="ph-l">E</td><td>Edward</td><td class="ph-l">R</td><td>Robert</td></tr>
            <tr><td class="ph-l">F</td><td>Frank</td><td class="ph-l">S</td><td>Sam</td></tr>
            <tr><td class="ph-l">G</td><td>George</td><td class="ph-l">T</td><td>Tom</td></tr>
            <tr><td class="ph-l">H</td><td>Henry</td><td class="ph-l">U</td><td>Union</td></tr>
            <tr><td class="ph-l">I</td><td>Ida</td><td class="ph-l">V</td><td>Victor</td></tr>
            <tr><td class="ph-l">J</td><td>John</td><td class="ph-l">W</td><td>William</td></tr>
            <tr><td class="ph-l">K</td><td>King</td><td class="ph-l">X</td><td>X-Ray</td></tr>
            <tr><td class="ph-l">L</td><td>Lincoln</td><td class="ph-l">Y</td><td>Young</td></tr>
            <tr><td class="ph-l">M</td><td>Mary</td><td class="ph-l">Z</td><td>Zebra</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/phonetics.js') }}"></script>
@endpush