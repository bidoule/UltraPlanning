'use strict';

var HPweb = HPweb || {};

HPweb.events = {};
HPweb.monday = null;

HPweb.filters = {
	course: {
		input: $('#courseFilter'),
		regexp: new RegExp('', 'i')
	},
	teacher: {
		input: $('#teacherFilter'),
		regexp: new RegExp('', 'i')
	}
}

HPweb.readEvents = function(file) {
	$('body').css('cursor', 'wait');
	$.ajax({
		url : file,
		dataType: 'text',
		success : HPweb.loadEvents
	});
};

HPweb.loadEvents = function (txt, status, xhr) {
	var t = new Date();
	txt.slice(0,-1).split('\n').forEach(function (row, idx) {
		HPweb.parseLine(row, idx);
	});
	console.log(new Date() - t);
};

HPweb.parseLine = function(line, idx) {
	var row = line.trim().split(';');

	if (row[0] === '' || row[1] === '' || row[2] === '' || row[3] === '' || !(row[5] in HPweb.groupConfig)) {
		//console.log('Erreur ligne ' + idx.toString() + ' : ' + row);
		return;
	}

	var ev = new HPweb.Event(row);
	var date = ev.start.getIsoCalendarDate();
	if (!(date in HPweb.events))
		HPweb.events[date] = [];
	HPweb.events[date].push(ev);
};

HPweb.numGroups = 9;
HPweb.groupConfig = {
    'GB1': [0,9],
	
    '<Adaptation> Ada 1': [0,4],
    '<Adaptation> Ada 2': [4,5],
    '<Adaptation> Ada 3': [0,4],
    '<Adaptation> Ada 4': [4,5],
    
    '<OPTIONS> ABB': [0,4],
    '<OPTIONS> Agro': [4,2],
    '<OPTIONS> GE': [6,3],
    
    '<TP S1> TP 1': [0,1],
    '<TP S1> TP 2': [1,1],
    '<TP S1> TP 3': [2,1],
    '<TP S1> TP 4': [3,1],
    '<TP S1> TP 5': [4,1],
    '<TP S1> TP 6': [5,1],
    '<TP S1> TP 7': [6,1],
    '<TP S1> TP 8': [7,1],
    '<TP S1> TP 9': [8,1],
    '<TD S1> TD 1-2': [0,2],
    '<TD S1> TD 3-4': [2,2],
    '<TD S1> TD 5-6': [4,2],
    '<TD S1> TD 7-8': [6,2],
    '<TD S1> TD 9': [8,1],
    
    '<TP S2> TP 1': [0,1],
    '<TP S2> TP 4': [1,1],
    '<TP S2> TP 7': [2,1],
    '<TP S2> TP 9': [3,1],
    '<TP S2> TP 2': [4,1],
    '<TP S2> TP 5': [5,1],
    '<TP S2> TP 3': [6,1],
    '<TP S2> TP 6': [7,1],
    '<TP S2> TP 8': [8,1],
    '<TD S2> TD 1-4': [0,2],
    '<TD S2> TD 7-9': [2,2],
    '<TD S2> TD 2-5': [4,2],
    '<TD S2> TD 3-6': [6,2],
    '<TD S2> TD 6-8': [7,2],
    '<TD S2> TD 8': [8,1],
};

HPweb.Event = function(row) {
	this.title = row[0];
	this.start = HPweb.parseDateTime(row[1], row[2]);
	this.end = HPweb.parseDateTime(row[1], row[3]);
	this.type = row[4];
	this.group = HPweb.parseGroup(row[5]);
	this.room = row[6];
	this.memo = row[7];
	this.teachers = row[8].split(', ').map(HPweb.slice_after_space);
	this.teacher = this.teachers.join('<br>');
	
	var position = HPweb.groupConfig[row[5]];
	
	this.targetCell = $('#d' + this.start.getDay() + ' .h' + this.start.getHours());
	this.top = position[0] * 100 / HPweb.numGroups;
	this.height = position[1] * 100 / HPweb.numGroups;
	this.left = this.start.getMinutes() * 100 / 60;
	this.width = (this.end - this.start) / 36000;
	
	this.show = function () {
		if (HPweb.filters.course.regexp.test(this.title) && HPweb.filters.teacher.regexp.test(this.teachers))
			this.targetCell.append(Mustache.render(HPweb.$template, this));
	};
};

HPweb.groupRegExp = new RegExp("<.+> (.+)");
HPweb.parseGroup = function(group) {
	return group.split(', ').map(function (g) {
		var res = g.match(HPweb.groupRegExp);
		if (res === null) {
			return g;
		} else {
			return res[1];
		}
	}).join(', ');
};

HPweb.slice_after_space = function (name) {
	return name.slice(name.indexOf(' ') + 1);
};

//////////////////////////////////////////////////
// Date manipulation



// composition of substr and parseInt(-, 10)
String.prototype.subInt = function (start, end) {
	return parseInt(this.substr(start, end), 10);
};

HPweb.parseDateTime = function(date, time) {
	return new Date(
		date.subInt(6,4),
		date.subInt(3,2)-1,
		date.subInt(0,2),
		time.subInt(0,2),
		time.subInt(3,2)
	);
};


//////////////////////////////////////////////////

HPweb.$template = $('#lessonTemplate').html();
Mustache.parse(HPweb.$template);
HPweb.readEvents('cours.txt');


HPweb.setDays = function(year, month, day) {
	$('.rotate > *').each(function (idx, elt) {
		var date = fromIsoCalendarDate(year, month, day + idx);
		elt.textContent = date.shortFormat();
	});
	var monday = '' + year + '-' + month.pad() + '-' + day.pad();
	console.log(monday);
	if (monday in UP.events) {
		console.log('YES !');
		var evs = UP.events[monday];
		for (var i=0; i<evs.length; ++i) {
			evs[i].show();
		}
	}
	/*	var dateArray = date.getIsoCalendarDate();
		if (dateArray in HPweb.events) {
			var evs = HPweb.events[dateArray];
			for (var i=0; i<evs.length; ++i) {
				evs[i].show();
			}
		}
	});*/
};

HPweb.updateStateFilter = function(name) {
	var value = HPweb.filters[name].input.val();
	HPweb.filters[name].regexp = new RegExp(value, 'i');
};

HPweb.updateState = function() {
	HPweb.updateStateFilter('course');
	HPweb.updateStateFilter('teacher');
};

HPweb.resetUI = function() {
	$('body').css('cursor', 'wait');
	$('.lesson').remove();
	var a = HPweb.monday.toIsoMonday();
	HPweb.updateState();
	HPweb.setDays(a[0], a[1], a[2]);
	$('#week').text(HPweb.monday.weekFormat());
	$('body').css('cursor', 'auto');
};



$(document).on('click', '.clear', function() {
	var $input = $(this).parent().find('input');
	if ($input.val() !== '') {
		$input.val('');
	}
});

HPweb.clickFilter = function (name) {
	return function () {
		if (HPweb.filters[name].input.val() == this.textContent) {
			HPweb.filters[name].input.val('');
		} else {
			HPweb.filters[name].input.val(this.textContent);
		}
		HPweb.resetUI();
	};
}

$(document).on('click', '.course', HPweb.clickFilter('course'));
$(document).on('click', '.teacher', HPweb.clickFilter('teacher'));

HPweb.previousWeek = function () {
	HPweb.monday = HPweb.monday.previousWeek();
	HPweb.resetUI();
};

HPweb.today = function () {
	HPweb.monday = new Date();
	HPweb.resetUI();
};

HPweb.nextWeek = function () {
	HPweb.monday = HPweb.monday.nextWeek();
	HPweb.resetUI();
};

HPweb.initURLParams = function () {
	var params = window.location.search.slice(1).split('&');
	for (var i=0; i<params.length; ++i) {
		var param = params[i].split('=');
		if (param.length > 1) {
			if (param[0] in HPweb.filters) {
				HPweb.filters[param[0]].input.val(decodeURIComponent(param[1]));
			} else if (param[0] == "week") {
				HPweb.monday = parseISOWeek(param[1]);
			}
		}
	}
};

HPweb.initUI = function() {
	HPweb.monday = (new Date()).toMonday();
	HPweb.initURLParams();
	HPweb.resetUI();
}

HPweb.addURLParam = function(params, name, value) {
		params.push(name + '=' + encodeURIComponent(value));
	if (value) {
	}
}

HPweb.addURLFilter = function(params, name) {
	HPweb.addURLParam(params, name, HPweb.filters[name].input.val());
}

HPweb.getURLLink = function() {
	var URLParams = [];
	var ISOMonday = HPweb.monday.getIsoWeekDate();
	HPweb.addURLParam(URLParams, 'week', ISOMonday[0] + '-W' + ISOMonday[1].pad(2));
	HPweb.addURLFilter(URLParams, 'course');
	HPweb.addURLFilter(URLParams, 'teacher');
	var URLParams = 
	$('#URLLink').val(location.origin + location.pathname + '?' + URLParams.join('&'));
}

$('#previousWeek').click(HPweb.previousWeek);
$('#today').click(HPweb.today);
$('#nextWeek').click(HPweb.nextWeek);
$('#courseFilter').change(HPweb.resetUI);
$('#teacherFilter').change(HPweb.resetUI);
$('#getURLLink').click(HPweb.getURLLink);

HPweb.initUI();