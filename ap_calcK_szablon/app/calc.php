<?php
//1. pobrać parametry
        $kaska = $_REQUEST["kaska"] ?? "";
        $lata = $_REQUEST['lata'] ?? "";
        $oprocentowanie = $_REQUEST['oprocentowanie'] ?? "";

//2. walidacja
        $errors = [];
        $wynik = null;

        if ($kaska === "") {
            $errors[] = "Pole 'kaska' jest wymagane!";
        } elseif (!is_numeric($kaska) || $kaska <= 0) {
            $errors[] = "Kwota kasy musi być liczbą większą od zera!";
        }

        if ($lata === "") {
            $errors[] = "Pole 'lata' jest wymagane!";
        } elseif (!is_numeric($lata) || $lata <= 0 || intval($lata) != $lata) {
            $errors[] = "Liczba lat musi być liczbą całkowitą większą od zera!";
        }

        if ($oprocentowanie === "") {
            $errors[] = "Pole 'oprocentowanie' jest wymagane!";
        } elseif (!is_numeric($oprocentowanie) || $oprocentowanie < 0) {
            $errors[] = "Oprocentowanie musi być liczbą nieujemną!";
        } elseif ($oprocentowanie > 1) {
            $errors[] = "Oprocentowanie powinno być podane w formie dziesiętnej (np. 0.05 dla 5%)!";
        }

//3. zadanie
        if (empty($errors)) {
            $kaska = intval($kaska);
            $lata = intval($lata);
            $oprocentowanie = floatval($oprocentowanie);

            $kaska_oprocentowanie = ($lata * $oprocentowanie) * $kaska;
            $wynik = ($kaska + $kaska_oprocentowanie) / ($lata * 12);
        }
?>