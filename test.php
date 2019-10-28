<?php
$mysqli = mysqli_connect('calcbs-db.cldhj77jjehy.us-east-2.rds.amazonaws.com', 'admin', 'J3N1GIDZFUIaxgFJYlsA', 'calcbs-db', 3306);
if (mysqli_connect_errno()) {
    die("データベースに接続できません:" . mysqli_connect_error() . "\n");
} else {
    echo "データベースの接続に成功しました。\n";
}