<html>
    <h2>Hello</h2>

    <?php
        $a = $_REQUEST["x"] ?? "";
        $b = $_REQUEST['y'] ?? "";

        $a = intval($a);
        $b = intval($b);

        $suma = $a + $b;
        echo "World! $a <br> Zmienna \" \$a \" = " .$a;

        echo"<br>Suma = " .$suma;
        echo "<br>";
        //echo $_GET;

        //var_dump($_GET);
        //var_dump($_POST);
        //var_dump($_REQUEST);
        
    ?>
</html>