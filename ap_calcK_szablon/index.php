<?php
include "app/calc.php";
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Kalkulator Kredytowy</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="assets/css/main.css" />
	</head>
	<body class="no-sidebar is-preload">
		<div id="page-wrapper">

			<!-- Header -->
				<div id="header-wrapper">
					<div class="container">

						<!-- Header -->
							<header id="header">
								<div class="inner">

									<!-- Logo -->
										<h1><a href="index.php" id="logo">ZeroFour</a></h1>

									<!-- Nav -->
										<nav id="nav">
											<ul>
												<li class="current_page_item"><a href="index.php">Kalkulator</a></li>
												<li><a href="left-sidebar.html">Left Sidebar</a></li>
												<li><a href="right-sidebar.html">Right Sidebar</a></li>
												<li><a href="no-sidebar.html">No Sidebar</a></li>
											</ul>
										</nav>

								</div>
							</header>

					</div>
				</div>

			<!-- Main Wrapper -->
				<div id="main-wrapper">
					<div class="wrapper style2">
						<div class="inner">
							<div class="container">
								<div class="row">
									<div class="col-12">

										<!-- Content -->
											<section class="box">
												<header class="major">
													<h2>Kalkulator Kredytowy</h2>
													<p>Oblicz swoją miesięczną ratę kredytu</p>
												</header>

												<!-- Formularz kalkulatora -->
												<form action="index.php" method="POST">
													<div class="row gtr-50">
														<div class="col-4 col-12-medium">
															<label for="kaska">Kwota kredytu (zł):</label>
															<input type="text" name="kaska" id="kaska" value="<?php echo $kaska ?? ''; ?>" placeholder="np. 10000" />
														</div>
														<div class="col-4 col-12-medium">
															<label for="lata">Liczba lat kredytu:</label>
															<input type="text" name="lata" id="lata" value="<?php echo $lata ?? ''; ?>" placeholder="np. 5" />
														</div>
														<div class="col-4 col-12-medium">
															<label for="oprocentowanie">Oprocentowanie (%):</label>
															<input type="text" name="oprocentowanie" id="oprocentowanie" value="<?php echo $oprocentowanie ?? ''; ?>" placeholder="np. 0.05" />
														</div>
														<div class="col-12">
															<input type="submit" value="Oblicz ratę" class="button large icon solid fa-calculator" />
														</div>
													</div>
												</form>

												<!-- Wyniki -->
												<?php if (isset($wynik)): ?>
													<div class="box" style="margin-top: 2em; background: #e8f5e9; padding: 1.5em;">
														<h3>Wynik obliczeń:</h3>
														<p style="font-size: 1.5em;"><strong>Miesięczna rata: <?php echo number_format($wynik, 2, ',', ' '); ?> zł</strong></p>
													</div>
												<?php endif; ?>

												<!-- Błędy walidacji -->
												<?php if (!empty($errors)): ?>
													<div class="box" style="margin-top: 2em; background: #ffebee; padding: 1.5em;">
														<h3 style="color: #c62828;">Błędy:</h3>
														<ul style="color: #c62828;">
															<?php foreach($errors as $err): ?>
																<li><?php echo $err; ?></li>
															<?php endforeach; ?>
														</ul>
													</div>
												<?php endif; ?>

											</section>

									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			<!-- Footer Wrapper -->
				<div id="footer-wrapper">
					<footer id="footer" class="container">
						<div class="row">
							<div class="col-12">
								<div id="copyright">
									<ul class="menu">
										<li>&copy; Kalkulator Kredytowy. All rights reserved</li>
										<li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
									</ul>
								</div>
							</div>
						</div>
					</footer>
				</div>

		</div>

		<!-- Scripts -->
			<script src="assets/js/jquery.min.js"></script>
			<script src="assets/js/jquery.dropotron.min.js"></script>
			<script src="assets/js/browser.min.js"></script>
			<script src="assets/js/breakpoints.min.js"></script>
			<script src="assets/js/util.js"></script>
			<script src="assets/js/main.js"></script>

	</body>
</html>