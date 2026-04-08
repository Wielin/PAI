<?php
// KONTROLER strony kalkulatora kredytowego
require_once dirname(__FILE__).'/../config.php';

//załaduj Smarty
require_once _ROOT_PATH.'/lib/smarty/libs/Smarty.class.php';

use Smarty\Smarty;

//pobranie parametrów
function getParams(&$form){
	$form['kaska'] = isset($_REQUEST['kaska']) ? $_REQUEST['kaska'] : null;
	$form['lata'] = isset($_REQUEST['lata']) ? $_REQUEST['lata'] : null;
	$form['oprocentowanie'] = isset($_REQUEST['oprocentowanie']) ? $_REQUEST['oprocentowanie'] : null;	
}

//walidacja parametrów z przygotowaniem zmiennych dla widoku
function validate(&$form, &$infos, &$msgs){

	//sprawdzenie, czy parametry zostały przekazane - jeśli nie to zakończ walidację
	if ( ! (isset($form['kaska']) && isset($form['lata']) && isset($form['oprocentowanie']) ))	return false;	
	
	$infos[] = 'Przekazano parametry.';

	// sprawdzenie, czy potrzebne wartości zostały przekazane
	if ( $form['kaska'] == "") $msgs[] = 'Nie podano kwoty kredytu';
	if ( $form['lata'] == "") $msgs[] = 'Nie podano liczby lat';
	if ( $form['oprocentowanie'] == "") $msgs[] = 'Nie podano oprocentowania';
	
	//nie ma sensu walidować dalej gdy brak parametrów
	if ( count($msgs) == 0 ) {
		// sprawdzenie, czy wartości są liczbami
		if (! is_numeric($form['kaska'])) $msgs[] = 'Kwota kredytu nie jest liczbą';
		if (! is_numeric($form['lata'])) $msgs[] = 'Liczba lat nie jest liczbą';
		if (! is_numeric($form['oprocentowanie'])) $msgs[] = 'Oprocentowanie nie jest liczbą';
		
		// dodatkowa walidacja wartości
		if (is_numeric($form['kaska']) && $form['kaska'] <= 0) $msgs[] = 'Kwota kredytu musi być większa od zera';
		if (is_numeric($form['lata']) && ($form['lata'] <= 0 || intval($form['lata']) != $form['lata'])) $msgs[] = 'Liczba lat musi być liczbą całkowitą większą od zera';
		if (is_numeric($form['oprocentowanie']) && $form['oprocentowanie'] < 0) $msgs[] = 'Oprocentowanie nie może być ujemne';
		if (is_numeric($form['oprocentowanie']) && $form['oprocentowanie'] > 1) $msgs[] = 'Oprocentowanie powinno być w formie dziesiętnej (np. 0.05 dla 5%)';
	}
	
	if (count($msgs) > 0) return false;
	else return true;
}
	
// wykonaj obliczenia
function process(&$form, &$infos, &$msgs, &$result){
	$infos[] = 'Parametry poprawne. Wykonuję obliczenia.';
	
	//konwersja parametrów
	$kaska = floatval($form['kaska']);
	$lata = intval($form['lata']);
	$oprocentowanie = floatval($form['oprocentowanie']);
	
	//obliczenie raty kredytu
	$kaska_oprocentowanie = ($lata * $oprocentowanie) * $kaska;
	$result = ($kaska + $kaska_oprocentowanie) / ($lata * 12);
}

//inicjacja zmiennych
$form = null;
$infos = array();
$messages = array();
$result = null;
	
getParams($form);
if ( validate($form, $infos, $messages) ){
	process($form, $infos, $messages, $result);
}

// 4. Przygotowanie danych dla szablonu

$smarty = new Smarty();

$smarty->assign('app_url', _APP_URL);
$smarty->assign('root_path', _ROOT_PATH);
$smarty->assign('page_title', 'Kalkulator Kredytowy');
$smarty->assign('page_description', 'Oblicz swoją miesięczną ratę kredytu');
$smarty->assign('page_header', 'Kalkulator Kredytowy');

//zmienne formularza i wyników
$smarty->assign('form', $form);
$smarty->assign('result', $result);
$smarty->assign('messages', $messages);
$smarty->assign('infos', $infos);

// 5. Wywołanie szablonu
$smarty->display(_ROOT_PATH.'/templates/main.html');