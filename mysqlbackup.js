var util = require('util');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;

/*******************
basic obj of dbInfo, just a way to contain the IP address, user, and password of the mysql database.
requires mysqldump
dbInfo = {
	host: '',
	user: ''
	pass: '',
	backupdir: '' //with trailing slash (lazy).
}
********************/
var MySQLBackup = function(logger) {
	var self = this;
	self.logger = logger;
	
	// stubby
	this.on('newListener', function(listener) {
		console.log('New Event Listener: ' + listener);
	});
	
	this.on('serverConnect', function(dbInfo) {
		var mysql = exec('mysql -h '+dbInfo.host+' --user='+dbInfo.user+' -p'+dbInfo.pass+' -e "SHOW DATABASES;" | grep -Ev "(Database|information_schema)"');
		mysql.stdout.on('data', function (data) {
			var databases = data.toString().split('\n');
			for(var i=0; i<databases.length;i++) {
				var schemaInfo = dbInfo;
				schemaInfo['dbName'] = databases[i];
				self.emit('serverBackup', schemaInfo);
			}
		});
		//self.logger.emit('log',{msg:'New MySQL Server to list: ' + dbInfo.host, msgtype:'info'});
		console.log('New MySQL Server to list: ' + dbInfo.host);
	});
	
	this.on('serverBackup', function(dbInfo) {
		var startmsg = 'Backing up server: ' + dbInfo.host+ ', Schema: ' +dbInfo.dbName;
		//self.logger.emit('log',{msg:startmsg,msgtype:'info'});
		console.log(startmsg);
		var dbFilePath = dbInfo.backupdir + dbInfo.dbName+ '.gz';
		var dbName = dbInfo.dbName
		exec('mysqldump -h '+dbInfo.host+' --force --opt --user='+dbInfo.user+' -p'+dbInfo.pass+' --databases ' +dbInfo.dbName+ ' | gzip > "' +dbFilePath+ '"', function(error, stdout, stderr) {
			if(error) {console.log('error at backupDatabase exec:', error); return;}
			exec('wc -c < ' + dbFilePath, function(err, stdo, stde){
				if(err) {return;};
				var successmsg = 'Backup of '+dbName+' Successful: ' + stdo.toString().replace(/(\r\n|\n|\r)/gm,"") + ' bytes';
				self.logger.emit('log',{msg:successmsg,msgtype:'info'});
				console.log(successmsg);
			});
			return;
		});
	});
	
};

util.inherits(MySQLBackup, EventEmitter);

module.exports = MySQLBackup;
