'use strict';

UP.events = {};

UP.addEvent = function(monday, event) {
	if (!(monday in UP.events)) {
		UP.events[monday] = [];
	}
	UP.events[monday].push(event);
}

// composition of substr and parseInt(-, 10)
String.prototype.subInt = function (start, end) {
	return parseInt(this.substr(start, end), 10);
};

Date.prototype.getISODay = function() {
	var d = this.getDay();
	return (d == 0) ? 7 : d;
};

Number.prototype.pad = function() {
	return ("0" + this).slice(-2);
};

UP.daysHash = {};

UP.parseDay = function(d) {
	var date = new Date(d.subInt(6,4), d.subInt(3,2)-1, d.subInt(0,2));
	var day = date.getISODay();
	var offset = (day > 5) ? 8-day : 1-day;
	var monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
	return {
		'num': day,
		'monday': monday.ISOFormat()
	};
};

UP.getDay = function(date) {
	if (date in UP.daysHash) {
		return UP.daysHash[date];
	} else {
		var day = UP.parseDay(date);
		UP.daysHash[date] = day;
		return day;
	}
};

UP.parseTime = function(time) {
	return {
		'hours': time.subInt(0,2),
		'minutes': time.subInt(3,2),
	};
}

UP.parse = function() {
	Papa.parse(UP.fileURL, {
		delimiter: ";",
		newline: "\r\n",
		download: true,
		fastMode: true,
		complete: function(results, file) {
			results.data.forEach(UP.parseEvent);
			UP.showSchedule();
		}
	});
};

UP.parseEvent = function(row) {
	if (row.length == 1)
		return;
	var errors = 0;
	if (row[0] === '') {
		//console.log("Pas de nom de cours", row);
		++errors;
	}
	if (row[1] === '') {
		//console.log("Pas de date", row);
		++errors;
	}
	if (row[2] === '') {
		//console.log("Pas d'heure de début", row);
		++errors;
	}
	if (row[3] === '') {
		//console.log("Pas d'heure de fin", row);
		++errors;
	}
	if (!(row[5] in UP.groupConfig)) {
		console.log('Groupe inconnu "' + row[5] + '"', row);
		++errors;
	}
	if (errors > 0)
		return;
	
	var day = UP.getDay(row[1]);
	UP.addEvent(day.monday, new UP.Event(row, day.num));
};

UP.Event = function(row, day) {
	this.title = row[0];
	this.type = row[4];
	this.group = UP.parseGroup(row[5]);
	this.room = row[6];
	this.memo = row[7];
	this.teachers = row[8].split(', ').map(UP.slice_after_space);
	this.teacher = this.teachers.join('<br>');
	
	var position = UP.groupConfig[row[5]];
	this.classes = position[2];

	var start = UP.parseTime(row[2]);
	var end = UP.parseTime(row[3]);	
	this.targetCell = UP.cells[day][start.hours];
	
	this.start = start;
	this.end = end;
	this.top = position[0];
	this.height = position[1];
	this.left = start.minutes * 100 / 60;
	this.width = (60*(end.hours - start.hours) + (end.minutes - start.minutes))*100./60.;
	
	this.show = function () {
		if (UP.courseFilter.test(this.title) 
			&& UP.teacherFilter.test(this.teachers) 
		    && (UP.classes == 'all' || UP.classes == this.classes))
			this.targetCell.append(Mustache.render(UP.$template, this));
	};
}

UP.groupRegExp = new RegExp("<.+> (.+)");
UP.parseGroup = function(group) {
	return group.split(', ').map(function (g) {
		var res = g.match(UP.groupRegExp);
		if (res === null) {
			return g;
		} else {
			return res[1];
		}
	}).join(', ');
};

UP.numGroups = 9;
UP.groupConfig = {
    'GB1': [0,9,'GB1'],
	
    '<Adaptation> Ada 1': [0,4,'GB1'],
    '<Adaptation> Ada 2': [4,5,'GB1'],
    '<Adaptation> Ada 3': [0,4,'GB1'],
    '<Adaptation> Ada 4': [4,5,'GB1'],
    
    '<OPTIONS> ABB': [0,4,'GB1'],
    '<OPTIONS> Agro': [4,2,'GB1'],
    '<OPTIONS> GE': [6,3,'GB1'],
    
    '<TP S1> TP 1': [0,1,'GB1'],
    '<TP S1> TP 2': [1,1,'GB1'],
    '<TP S1> TP 3': [2,1,'GB1'],
    '<TP S1> TP 4': [3,1,'GB1'],
    '<TP S1> TP 5': [4,1,'GB1'],
    '<TP S1> TP 6': [5,1,'GB1'],
    '<TP S1> TP 7': [6,1,'GB1'],
    '<TP S1> TP 8': [7,1,'GB1'],
    '<TP S1> TP 9': [8,1,'GB1'],
    '<TD S1> TD 1-2': [0,2,'GB1'],
    '<TD S1> TD 3-4': [2,2,'GB1'],
    '<TD S1> TD 5-6': [4,2,'GB1'],
    '<TD S1> TD 7-8': [6,2,'GB1'],
    '<TD S1> TD 9': [8,1,'GB1'],
    
    '<TP S2> TP 1': [0,1,'GB1'],
    '<TP S2> TP 4': [1,1,'GB1'],
    '<TP S2> TP 7': [2,1,'GB1'],
    '<TP S2> TP 9': [3,1,'GB1'],
    '<TP S2> TP 2': [4,1,'GB1'],
    '<TP S2> TP 5': [5,1,'GB1'],
    '<TP S2> TP 3': [6,1,'GB1'],
    '<TP S2> TP 6': [7,1,'GB1'],
    '<TP S2> TP 8': [8,1,'GB1'],
    '<TD S2> TD 1-4': [0,2,'GB1'],
    '<TD S2> TD 7-9': [2,2,'GB1'],
    '<TD S2> TD 2-5': [4,2,'GB1'],
    '<TD S2> TD 3-6': [6,2,'GB1'],
    '<TD S2> TD 6-8': [7,2,'GB1'],
    '<TD S2> TD 8': [8,1,'GB1'],
	
	'GB AGRO2': [0,9,'AGRO2'],
	'GB ABB2': [0,9,'ABB2'],
	'GB GE2': [0,9,'GE2'],
	
	'<TD GE2> TD A': [0,3,'GE2'],
	'<TD GE2> TD B': [3,3,'GE2'],
	
	'<TP GE2> TP 1': [0,2,'GE2'],
	'<TP GE2> TP 2': [2,2,'GE2'],
	'<TP GE2> TP 3': [4,2,'GE2'],
	
	'<TP ABB2> TP 1': [0,2,'ABB2'],
	'<TP ABB2> TP 2': [2,2,'ABB2'],
	'<TP ABB2> TP 3': [4,2,'ABB2'],
	'<TP ABB2> TP 4': [6,2,'ABB2'],
	
	'<TD ABB2> TD 1-2': [0,4,'ABB2'],
	'<TD ABB2> TD 3-4': [4,4,'ABB2'],

	'<TD AGRO2> AGRO': [0,4,'AGRO2'],
	
	'<TP AGRO2> TP 1': [0,2,'AGRO2'],
	'<TP AGRO2> TP 2': [2,2,'AGRO2'],
	
};

UP.slice_after_space = function (name) {
	return name.slice(name.indexOf(' ') + 1);
};
