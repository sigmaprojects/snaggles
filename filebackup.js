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
basic obj of fileInfo, just a way to contain the url, backupPath, and repoName
requires mysqldump
fileInfo = {
	directoryPath: '', // fs accessible path that should be backed up
	backupPath: '', // with trailing forward slash (lazy)
}
********************/
var FileBackup = function(logger) {
	var self = this;
	self.logger = logger;
	
	this.on('archive', function(fileInfo) {

		var wholeBackupDir = fileInfo.backupPath + getWeekOfMonth(new Date(), true) + '/';
		var archiveFileName = fileInfo.directoryPath.replace(/[^0-9a-z]/gi, '') + '.tar.gz';
		var cmd = 'tar -czvf ' + wholeBackupDir + archiveFileName + ' ' + fileInfo.directoryPath;

		try { fs.mkdirSync(wholeBackupDir); } catch(e) {}
		//console.log("cmd: " + cmd);

		var options = {
			//cwd:	wholeBackupDir
		};
		exec(cmd, options,
			function(error, stdout, stderr) {
				if(error) {
					var errorStr = error.toString();
					console.log('FileBackup error: ' +fileInfo.directoryPath+ ' ' + error);
					return;
				} else {
					console.log('FileBackup success: ' + fileInfo.directoryPath);
				}
				return;
			}
		);
	});
	
	
};

util.inherits(FileBackup, EventEmitter);

module.exports = FileBackup;
