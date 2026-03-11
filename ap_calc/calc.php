<?php
//1. pobrać parametry
        $a = $_REQUEST["x"] ?? "";
        $b = $_REQUEST['y'] ?? "";

//2. walidacja

//3. zadanie
        $a = intval($a);
        $b = intval($b);
        $error;

        $wynik = $a + $b;

        include "calc_view.php"

        //echo "World! $a <br> Zmienna \" \$a \" = " .$a;

        //echo"<br>Suma = " .$suma;
        //echo "<br>";
        //echo $_GET;

        //var_dump($_GET);
        //var_dump($_POST);
        //var_dump($_REQUEST);
        
?>