<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

Route::get('/',             [PageController::class, 'home'])->name('home');
Route::get('/codes',        [PageController::class, 'codes'])->name('codes');
Route::get('/phonetics',    [PageController::class, 'phonetics'])->name('phonetics');
Route::get('/laws',         [PageController::class, 'laws'])->name('laws');
Route::get('/constitution', [PageController::class, 'constitution'])->name('constitution');
Route::get('/jurisdiction', [PageController::class, 'jurisdiction'])->name('jurisdiction');
Route::get('/court',        [PageController::class, 'court'])->name('court');
Route::get('/templates',    [PageController::class, 'templates'])->name('templates');
Route::get('/roster',       [PageController::class, 'roster'])->name('roster');
Route::get('/bolo',         [PageController::class, 'bolo'])->name('bolo');
Route::get('/notepad',      [PageController::class, 'notepad'])->name('notepad');
Route::get('/subpoena',     [PageController::class, 'subpoena'])->name('subpoena');
Route::get('/quotes',       [PageController::class, 'quotes'])->name('quotes');
Route::get('/guesser',      [PageController::class, 'guesser'])->name('guesser');
Route::get('/quiz',         [PageController::class, 'quiz'])->name('quiz');
Route::get('/tcquiz',       [PageController::class, 'tcquiz'])->name('tcquiz');
Route::get('/ucquiz',       [PageController::class, 'ucquiz'])->name('ucquiz');
Route::get('/clquiz',       [PageController::class, 'clquiz'])->name('clquiz');
Route::get('/changelog',    [PageController::class, 'changelog'])->name('changelog');
Route::get('/credits',      [PageController::class, 'credits'])->name('credits');
