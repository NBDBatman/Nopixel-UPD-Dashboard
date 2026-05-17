<?php

namespace App\Http\Controllers;

class PageController extends Controller
{
    public function home()         { return view('pages.home'); }
    public function codes()        { return view('pages.codes'); }
    public function phonetics()    { return view('pages.phonetics'); }
    public function laws()         { return view('pages.laws'); }
    public function constitution() { return view('pages.constitution'); }
    public function jurisdiction() { return view('pages.jurisdiction'); }
    public function court()        { return view('pages.court'); }
    public function templates()    { return view('pages.templates'); }
    public function roster()       { return view('pages.roster'); }
    public function bolo()         { return view('pages.bolo'); }
    public function notepad()      { return view('pages.notepad'); }
    public function subpoena()     { return view('pages.subpoena'); }
    public function quotes()       { return view('pages.quotes'); }
    public function guesser()      { return view('pages.guesser'); }
    public function quiz()         { return view('pages.quiz'); }
    public function tcquiz()       { return view('pages.tcquiz'); }
    public function ucquiz()       { return view('pages.ucquiz'); }
    public function clquiz()       { return view('pages.clquiz'); }
    public function changelog()    { return view('pages.changelog'); }
    public function credits()      { return view('pages.credits'); }
}
