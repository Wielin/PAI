<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Kalkulator Kredytowy</title>
</head>
<body>
    <h1>Kalkulator Kredytowy</h1>

    <form action="calc.php" method="POST">
        <label for="kaska">Kwota kredytu (zł):</label>
        <input type="text" name="kaska" id="kaska" value="<?php echo $kaska ?? ''; ?>"><br><br>

        <label for="lata">Liczba lat:</label>
        <input type="text" name="lata" id="lata" value="<?php echo $lata ?? ''; ?>"><br><br>

        <label for="oprocentowanie">Oprocentowanie:</label>
        <input type="text" name="oprocentowanie" id="oprocentowanie" value="<?php echo $oprocentowanie ?? ''; ?>"><br><br>

        <input type="submit" value="Oblicz">
    </form>

    <?php if (isset($wynik)): ?>
        <h2>Wynik: <?php echo number_format($wynik, 2, ',', ' '); ?> zł</h2>
    <?php endif; ?>

    <?php if (!empty($errors)): ?>
        <h3 style="color: red;">Błędy:</h3>
        <ul>
            <?php foreach($errors as $err): ?>
                <li style="color: red;"><?php echo $err; ?></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>

</body>
</html>