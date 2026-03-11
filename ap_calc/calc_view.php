<html lang="en">
    <form action="calc.php" method="POST">
        x <input type="text" name="x" value="<?php echo $a ?? ''; ?>" > <br>
        y <input type="text" name="y"value="<?php echo $b ?? ''; ?>" >

        <input type="submit">
    </form>

    <p>
        <?php 
            if (isset($wynik)){
                echo "Wynik = " .$wynik;
            }

            if(isset($error) && $error != ""){
                echo "Błąd: " .$error;
            }
            
        ?>
    </p>

</html>