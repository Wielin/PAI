<?php
/* Smarty version 5.4.2, created on 2026-03-24 13:39:29
  from 'file:C:\xampp\htdocs\PAI\ap_calcK_smarty/templates/main.html' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.4.2',
  'unifunc' => 'content_69c286014916c8_41477166',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '96486111bf4a88f42a36d1f8c34d2cfda1b1022d' => 
    array (
      0 => 'C:\\xampp\\htdocs\\PAI\\ap_calcK_smarty/templates/main.html',
      1 => 1774355885,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_69c286014916c8_41477166 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = 'C:\\xampp\\htdocs\\PAI\\ap_calcK_smarty\\templates';
?><!DOCTYPE HTML>
<html>
	<head>
		<title><?php echo $_smarty_tpl->getValue('page_title');?>
</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/css/main.css" />
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
										<h1><a href="<?php echo $_smarty_tpl->getValue('app_url');?>
/index.php" id="logo">ZeroFour</a></h1>

									<!-- Nav -->
										<nav id="nav">
											<ul>
												<li class="current_page_item"><a href="<?php echo $_smarty_tpl->getValue('app_url');?>
/index.php">Kalkulator</a></li>
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
													<h2><?php echo $_smarty_tpl->getValue('page_header');?>
</h2>
													<p><?php echo $_smarty_tpl->getValue('page_description');?>
</p>
												</header>

												<!-- Formularz kalkulatora -->
												<form action="<?php echo $_smarty_tpl->getValue('app_url');?>
/index.php" method="POST">
													<div class="row gtr-50">
														<div class="col-4 col-12-medium">
															<label for="kaska">Kwota kredytu (zł):</label>
															<input type="text" name="kaska" id="kaska" value="<?php echo $_smarty_tpl->getValue('form')['kaska'];?>
" placeholder="np. 10000" />
														</div>
														<div class="col-4 col-12-medium">
															<label for="lata">Liczba lat kredytu:</label>
															<input type="text" name="lata" id="lata" value="<?php echo $_smarty_tpl->getValue('form')['lata'];?>
" placeholder="np. 5" />
														</div>
														<div class="col-4 col-12-medium">
															<label for="oprocentowanie">Oprocentowanie (%):</label>
															<input type="text" name="oprocentowanie" id="oprocentowanie" value="<?php echo $_smarty_tpl->getValue('form')['oprocentowanie'];?>
" placeholder="np. 0.05" />
														</div>
														<div class="col-12">
															<input type="submit" value="Oblicz ratę" class="button large icon solid fa-calculator" />
														</div>
													</div>
												</form>

												<!-- Wyniki -->
												<?php if ($_smarty_tpl->getValue('result') !== null) {?>
													<div class="box" style="margin-top: 2em; background: #e8f5e9; padding: 1.5em;">
														<h3>Wynik obliczeń:</h3>
														<p style="font-size: 1.5em;"><strong>Miesięczna rata: <?php echo $_smarty_tpl->getSmarty()->getModifierCallback('number_format')($_smarty_tpl->getValue('result'),2,",","&nbsp;");?>
 zł</strong></p>
													</div>
												<?php }?>

												<!-- Informacje -->
												<?php if ($_smarty_tpl->getSmarty()->getModifierCallback('count')($_smarty_tpl->getValue('infos')) > 0) {?>
													<div class="box" style="margin-top: 2em; background: #e3f2fd; padding: 1.5em;">
														<h3 style="color: #1565c0;">Informacje:</h3>
														<ul style="color: #1565c0;">
															<?php
$_from = $_smarty_tpl->getSmarty()->getRuntime('Foreach')->init($_smarty_tpl, $_smarty_tpl->getValue('infos'), 'info');
$foreach0DoElse = true;
foreach ($_from ?? [] as $_smarty_tpl->getVariable('info')->value) {
$foreach0DoElse = false;
?>
																<li><?php echo $_smarty_tpl->getValue('info');?>
</li>
															<?php
}
$_smarty_tpl->getSmarty()->getRuntime('Foreach')->restore($_smarty_tpl, 1);?>
														</ul>
													</div>
												<?php }?>

												<!-- Błędy walidacji -->
												<?php if ($_smarty_tpl->getSmarty()->getModifierCallback('count')($_smarty_tpl->getValue('messages')) > 0) {?>
													<div class="box" style="margin-top: 2em; background: #ffebee; padding: 1.5em;">
														<h3 style="color: #c62828;">Błędy:</h3>
														<ul style="color: #c62828;">
															<?php
$_from = $_smarty_tpl->getSmarty()->getRuntime('Foreach')->init($_smarty_tpl, $_smarty_tpl->getValue('messages'), 'msg');
$foreach1DoElse = true;
foreach ($_from ?? [] as $_smarty_tpl->getVariable('msg')->value) {
$foreach1DoElse = false;
?>
																<li><?php echo $_smarty_tpl->getValue('msg');?>
</li>
															<?php
}
$_smarty_tpl->getSmarty()->getRuntime('Foreach')->restore($_smarty_tpl, 1);?>
														</ul>
													</div>
												<?php }?>

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
										<li>&copy; <?php echo $_smarty_tpl->getValue('page_title');?>
. All rights reserved</li>
										<li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
									</ul>
								</div>
							</div>
						</div>
					</footer>
				</div>

		</div>

		<!-- Scripts -->
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/jquery.min.js"><?php echo '</script'; ?>
>
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/jquery.dropotron.min.js"><?php echo '</script'; ?>
>
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/browser.min.js"><?php echo '</script'; ?>
>
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/breakpoints.min.js"><?php echo '</script'; ?>
>
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/util.js"><?php echo '</script'; ?>
>
			<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->getValue('app_url');?>
/assets/js/main.js"><?php echo '</script'; ?>
>

	</body>
</html>
<?php }
}
