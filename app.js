var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mysql = require('mysql');

var Logger = require('./logger.js');
var MySQLBackup = require('./mysqlbackup.js');
var GitBackup = require('./gitbackup.js');
var FileBackup = require('./filebackup.js');

var config = require('./config.js');
var db_config = config.db;


var logger = new Logger(db_config);

var mysqlbackup = new MySQLBackup(logger);
var gitbackup = new GitBackup(logger);
var filebackup = new FileBackup(logger);


function backupGits() {
	var conn = mysql.createConnection(db_config);
		conn.query("SELECT * FROM gits;", function(err, results){
			if(err) {
				console.log("Query error:" + err);
			} else {
				for(var i=0; i<results.length;i++) {
					var gitInfo = results[i];
					gitbackup.emit('clone', gitInfo);
				};
			};
			conn.end();
	});
}

function backupMysql() {
	var conn = mysql.createConnection(db_config);
	conn.query("SELECT * FROM mysqlhosts;", function(err, results){
		if(err) {
			console.log("Query error:" + err);
		} else {
			for(var i=0; i<results.length;i++) {
				var dbInfo = results[i];
				mysqlbackup.emit('serverConnect', dbInfo);
			};
		};
		conn.end();
	});
}

function backupDirectories() {
	var conn = mysql.createConnection(db_config);
		conn.query("SELECT * FROM directories;", function(err, results){
			if(err) {
				console.log("Query error:" + err);
			} else {
				for(var i=0; i<results.length;i++) {
					var fileInfo = results[i];
					filebackup.emit('archive', fileInfo);
				};
			};
			conn.end();
	});
}

backupMysql();
backupGits();
backupDirectories();


