var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mysql = require('mysql');


var Logger = function(db_config) {
	var self = this;

	var connection = mysql.createConnection(db_config);
	connection.query("CREATE TABLE IF NOT EXISTS `snaggles`.`logs` (`id` INT NOT NULL AUTO_INCREMENT ,`msg` LONGTEXT NULL ,`msgtype` VARCHAR(45) NULL ,`created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,PRIMARY KEY (`id`) ) DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;", function(err, rows){
		if(err) {console.log("Query error:" + err);};
		connection.end();
	});
	

	
	this.on('log', function(msgObj) {
		var conn = mysql.createConnection(db_config);
		var msgtype = msgObj.msgtype || '';
		conn.query("INSERT INTO logs (msg,msgtype) VALUES (?,?);", [msgObj.msg, msgtype], function(err){
			if(err) {console.log("Query error:" + err);};
			conn.end();
		});
	});

};

util.inherits(Logger, EventEmitter);

module.exports = Logger;
