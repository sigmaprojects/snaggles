var util = require('util');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;

var getWeekOfMonth = function(d, exact) {
    var month = d.getMonth()
        , year = d.getFullYear()
        , firstWeekday = new Date(year, month, 1).getDay()
        , lastDateOfMonth = new Date(year, month + 1, 0).getDate()
        , offsetDate = d.getDate() + firstWeekday - 1
        , index = 1 // start index at 0 or 1, your choice
        , weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7)
        , week = index + Math.floor(offsetDate / 7)
    ;
    if (exact || week < 2 + index) return week;
    return week === weeksInMonth ? index + 5 : week;
};

/*******************
basic obj of gitInfo, just a way to contain the url, backupPath, and repoName
requires mysqldump
gitInfo = {
	url: '', // url to the repo, ending with .git 
	backupPath: '', // with trailing forward slash (lazy)
	repoName: '' // name of the repo, will be used for dir ops
}
********************/
var GitBackup = function(logger) {
	var self = this;
	self.logger = logger;
	
	this.on('clone', function(gitInfo) {

		var cmd = '/usr/bin/git clone ' + gitInfo.url;
		var wholeBackupDir = gitInfo.backupPath + getWeekOfMonth(new Date(), true) + '/';
		try { fs.mkdirSync(wholeBackupDir); } catch(e) {}
		var options = {
			cwd:	wholeBackupDir
		};
		exec(cmd, options,
			function(error, stdout, stderr) {
				if(error) {
					var errorStr = error.toString();
					if(errorStr.indexOf('already exists') > -1) {
						self.emit('pull',gitInfo);
					} else {
						console.log('git clone error: ' +gitInfo.url+ ' ' + error);
						return;
					}
				} else {
					self.logger.emit('log',{msg:'New Git Repo Cloned: ' + gitInfo.url, msgtype:'info'});
					console.log('New Git Repo Cloned: ' + gitInfo.url);
				}
				return;
			}
		);
	});
	
	this.on('pull', function(gitInfo) {
		var cmd = '/usr/bin/git pull';
		var wholeBackupDir = gitInfo.backupPath + getWeekOfMonth(new Date(), true) + '/';
		try { fs.mkdirSync(wholeBackupDir); } catch(e) {}
		var options = {cwd:wholeBackupDir + gitInfo.repoName};
		exec(cmd, options,
			function(error, stdout, stderr) {
				var msg = '';
				var msgtype = 'info';
				if(error) {
					msg = 'ERROR: Git Repo Pulled: ' + error + ' ';
					msgtype = 'error';
				} else {
					var dataStr = stdout.toString();
					msg = 'Git Repo Pulled: ' + dataStr + ' ';
				}
				self.logger.emit('log',{msg:msg + gitInfo.url, msgtype:msgtype});
				console.log(msg + gitInfo.url);
				return;
			}
		);
	});
	
};

util.inherits(GitBackup, EventEmitter);

module.exports = GitBackup;
