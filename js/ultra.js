'use strict';

UP.$template = $('#lessonTemplate').html();
Mustache.parse(UP.$template);

UP.courseInput = $('#courseFilter');
UP.teacherInput = $('#teacherFilter');
UP.roomInput = $('#roomFilter');

UP.courseFilter = new RegExp('', 'i');
UP.teacherFilter = new RegExp('', 'i');
UP.roomFilter = new RegExp('', 'i');

UP.updateCourseFilter = function () {
	UP.courseFilter = new RegExp(UP.courseInput.val(), 'i');
	UP.showSchedule();
}
UP.updateTeacherFilter = function () {
	UP.teacherFilter = new RegExp(UP.teacherInput.val(), 'i');
	UP.checkAllClasses();
	$('#schedule').toggleClass('full', !(UP.teacherInput.val() == ''));
	UP.showSchedule();
}
UP.updateRoomFilter = function () {
	UP.roomFilter = new RegExp(UP.roomInput.val(), 'i');
	UP.checkAllClasses();
	$('#schedule').toggleClass('full', !(UP.roomInput.val() == ''));
	UP.showSchedule();
}

UP.courseInput.change(UP.updateCourseFilter);
UP.teacherInput.change(UP.updateTeacherFilter);
UP.roomInput.change(UP.updateRoomFilter);

$('.filter').on('click', '.clear', function() {
	var $input = $(this).parent().find('input');
	if ($input.val() !== '') {
		$input
		  .val('')
          .change();
	}
});

UP.toggleFilter = function(input, elt) {
	input.val((input.val() == elt.textContent) ? '' : elt.textContent);
}

$('#schedule').on('click', '.course', function() {
	UP.toggleFilter(UP.courseInput, this);
	UP.updateCourseFilter();
});


$('#schedule').on('click', '.teacher', function() {
	UP.toggleFilter(UP.teacherInput, this);
	UP.updateTeacherFilter();
});

$('#schedule').on('click', '.room', function() {
	UP.toggleFilter(UP.roomInput, this);
	UP.updateRoomFilter();
});

UP.showLesson = function(lesson) {
	lesson.show();
}

UP.showSchedule = function() {
	$('.lesson').remove();
	var monday = UP.currentMonday.ISOFormat();
	UP.showDays();
	if (monday in UP.events) {
		UP.events[monday].forEach(UP.showLesson);
	}
    UP.updateURLParams();
}

UP.initURLParams = function () {
	var params = window.location.search.slice(1).split('&');
	for (var i=0; i<params.length; ++i) {
		var param = params[i].split('=');
		var value = decodeURIComponent(param[1]);
		if (param.length > 1) {
			if (param[0] == "course") {
				UP.courseInput.val(value);
			    UP.courseFilter = new RegExp(value, 'i');
		    } else if (param[0] == "teacher") {
				UP.teacherInput.val(value);
				UP.teacherFilter = new RegExp(value, 'i');
				$('#schedule').addClass('full');
			} else if (param[0] == "room") {
				UP.roomInput.val(value);
				UP.roomFilter = new RegExp(value, 'i');
				$('#schedule').addClass('full');
			} else if (param[0] == "week") {
				UP.currentMonday = parseISOWeek(value).toMonday();
			} else if (param[0] == "class") {
                $('#classes input').prop('checked', false);
                $('#' + value).prop('checked', true);
				UP.classes = value;

			}
		}
	}
};

UP.updateURLParams = function () {
    var vars = [];
    var teacher = UP.teacherInput.val();
    if (teacher != "") {
        vars.push("teacher=" + encodeURIComponent(teacher));
    }
	var room = UP.roomInput.val();
    if (room != "") {
        vars.push("room=" + encodeURIComponent(room));
    }
    var course = UP.courseInput.val();
    if (course != "") {
        vars.push("course=" + encodeURIComponent(course));
    }
    if (UP.classes != "all") {
        vars.push("class=" + encodeURIComponent(UP.classes));
    }
    if (UP.currentMonday.getTime() != UP.initialMonday.getTime()) {
        vars.push("week=" + UP.currentMonday.ISOWeekFormat());
    }
    history.replaceState(null, null, "/" + ((vars.length > 0) ? "?" : "") + vars.join("&"));

}

UP.showDateFile = function(text, status, xhr) {
    var d = new Date(xhr.getResponseHeader('Last-Modified'));
    $('#lastModified').text(d.format() + ' ' + d.timeFormat());
}

UP.dateFile = function() {
    $.ajax({
        method: 'HEAD', 
        url: UP.fileURL
    }).done(UP.showDateFile);
}

UP.initCells();
UP.initDays();
UP.initURLParams();
UP.parse();
UP.dateFile();
