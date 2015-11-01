'use strict';

UP.cells = [];

UP.initCells = function() {
	UP.cells = [];
	for (var i=0; i<7; ++i) {
		var l = [];
		for (var j=0; j<24; ++j) {
			l.push($('#d' + i + 'h' + j));
		}
		UP.cells.push(l);
	}
};

UP.days = [];

UP.initDays = function() {
	for (var i=1; i<6; ++i) {
		UP.days.push($('#d' + i + ' .rotate div').get(0));
	}
};

UP.currentMonday = nextMonday();

UP.showDays = function() {
	UP.days[0].textContent = UP.currentMonday.shortFormat();
	for (var i=1; i<5; ++i) {
		var date = UP.currentMonday.addDays(i);
		UP.days[i].textContent = date.shortFormat();
	};
    $('#weekNumber').text(UP.currentMonday.getISOWeekDate()[1])
}

UP.setToday = function() {
	UP.currentMonday = nextMonday();
	UP.showSchedule();
}

UP.setPreviousWeek = function() {
	UP.currentMonday = UP.currentMonday.previousWeek();
	UP.showSchedule();
}

UP.setNextWeek = function() {
	UP.currentMonday = UP.currentMonday.nextWeek();
	UP.showSchedule();
}

$('#previousWeek').click(UP.setPreviousWeek);
$('#today').click(UP.setToday);
$('#nextWeek').click(UP.setNextWeek);

UP.classes = 'all';

UP.checkAllClasses = function () {
	$('#GB').click();
}

$("#classes input").click(function () {
    UP.classes = this.dataset.name;
	UP.showSchedule();
});
