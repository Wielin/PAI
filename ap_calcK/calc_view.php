<html lang="en">
    <form action="calc.php" method="POST">
        Ile kaski <input type="text" name="kaska" value="<?php echo $kaska ?? ''; ?>" > <br>
        Ile lat kredytu <input type="text" name="lata" value="<?php echo $lata ?? ''; ?>" > <br>
        Oprocentowanie <input type="text" name="oprocentowanie" value="<?php echo $oprocentowanie ?? ''; ?>" >

        <input type="submit">
    </form>

    <p>
        <?php 
            if (isset($wynik)){
                echo "Wynik = " .$wynik;
            }

            if(!empty($errors)){
                echo "<ul style='color: red;'>";
                foreach($errors as $err){
                    echo "<li>" . $err . "</li>";
                }
                echo "</ul>";
            }
            
        ?>
    </p>

</html>