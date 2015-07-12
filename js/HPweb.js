'use strict';

var HPweb = HPweb || {};

HPweb.events = {};
HPweb.monday = null;
HPweb.teacherFilter = new RegExp('', 'i');
HPweb.courseFilter = new RegExp('', 'i');

HPweb.readEvents = function(file) {
	$('body').css('cursor', 'wait');
	$.ajax({
		url : file,
		dataType: 'text',
		success : HPweb.loadEvents
	});
};

HPweb.loadEvents = function (txt, status, xhr) {
	txt.slice(0,-1).split('\n').forEach(function (row, idx) {
		HPweb.parseLine(row, idx);
	});
	HPweb.today();
};

HPweb.parseLine = function(line, idx) {
	var row = line.trim().split(';');

	if (row[0] === '' || row[1] === '' || row[2] === '' || row[3] === '' || !(row[5] in HPweb.groupConfig)) {
		console.log('Erreur ligne ' + idx.toString() + ' : ' + row);
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
		if (HPweb.courseFilter.test(this.title) && HPweb.teacherFilter.test(this.teachers))
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
		var dateArray = date.getIsoCalendarDate();
		if (dateArray in HPweb.events) {
			var evs = HPweb.events[dateArray];
			for (var i=0; i<evs.length; ++i) {
				evs[i].show();
			}
		}
	});
};

HPweb.resetUI = function() {
	$('body').css('cursor', 'wait');
	$('.lesson').remove();
	var a = HPweb.monday.toIsoMonday();
	HPweb.courseFilter = new RegExp($('#courseFilter').val(), 'i');
	Cookies.set('course', $('#courseFilter').val(), { expires: 365 });
	HPweb.teacherFilter = new RegExp($('#teacherFilter').val(), 'i');
	Cookies.set('teacher', $('#teacherFilter').val(), { expires: 365 });
	HPweb.setDays(a[0], a[1], a[2]);
	$('#week').text(HPweb.monday.weekFormat());
	$('body').css('cursor', 'auto');
};

HPweb.cleanParams = function () {
	var search = window.location.search;
	return search.replace(/^\?*/, '').replace(/\/*$/, '');
};

HPweb.urlParam = HPweb.cleanParams();

console.log(HPweb.urlParam);

$(document).on('click', '.clear', function() {
	var $prev = $(this).prev();
	if ($prev.val() !== '') {
		$prev.val('');
		HPweb.resetUI();
	}
});

$(document).on('click', '.course', function() {
	if ($('#courseFilter').val() == this.textContent) {
		$('#courseFilter').val('');
	} else {
		$('#courseFilter').val(this.textContent);
	}
	HPweb.resetUI();
});

$(document).on('click', '.teacher', function() {
	if ($('#teacherFilter').val() == this.textContent) {
		$('#teacherFilter').val('');
	} else {
		$('#teacherFilter').val(this.textContent);
	}
	HPweb.resetUI();
});

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


$('#previousWeek').click(HPweb.previousWeek);
$('#today').click(HPweb.today);
$('#nextWeek').click(HPweb.nextWeek);
$('#courseFilter').change(HPweb.resetUI);
$('#teacherFilter').change(HPweb.resetUI);


var courseCookie = Cookies.get('course');
if (courseCookie != undefined) {
	$('#courseFilter').val(courseCookie);
}
var teacherCookie = Cookies.get('teacher');
if (teacherCookie != undefined) {
	$('#teacherFilter').val(teacherCookie);
}
