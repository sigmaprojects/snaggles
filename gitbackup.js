var util = require('util');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;

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
		var options = {
			cwd:	gitInfo.backupPath
		};
		exec(cmd, options,
			function(error, stdout, stderr) {
				if(error) {
					var errorStr = error.toString();
					if(errorStr.indexOf('already exists') > -1) {
						self.emit('pull',gitInfo);
					} else {
						console.log('git clone error: ' + error);
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
		var options = {cwd:gitInfo.backupPath + gitInfo.repoName};
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