'use strict';

Date.prototype.days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
Date.prototype.months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

Number.prototype.pad = function() {
	return ("0" + this).slice(-2);
};

Date.prototype.format = function() {
	return this.days[this.getDay()] + ' ' + this.getDate() + ' ' + this.months[this.getMonth()] + ' ' + this.getFullYear();
};

Date.prototype.timeFormat = function() {
    return '' + this.getHours() + 'h' + this.getMinutes().pad();
}

Date.prototype.shortFormat = function() {
	return this.days[this.getDay()] + ' ' + this.getDate().pad() + '/' + (this.getMonth()+1).pad();
};

Date.prototype.ISOFormat = function() {
	return '' + this.getFullYear() + '-' + (this.getMonth()+1).pad() + '-' + this.getDate().pad();
};

Date.prototype.weekFormat = function () {
	var iso = this.getISOWeekDate();
	return '' + iso[0] + ' S' + iso[1];
};

Date.prototype.getISOCalendarDate = function() {
	return [this.getFullYear(), this.getMonth()+1, this.getDate()];
};

Date.prototype.getISODay = function() {
	return 1 + (this.getDay() + 6) % 7;
};

Date.prototype.getISOWeekDate = function () {
	var year = this.getFullYear();
	var day = this.getISODay();
	if (this.getMonth() == 11 && this.getDate() >= 28 + day)
		return [year+1, 1, day];
	var jan4 = new Date(year, 0, 4);
	var dayDelta = jan4.getISODay() - day;
	var TimezoneDelta = jan4.getTimezoneOffset() - this.getTimezoneOffset();
	return [year, 1 + (this - jan4 + dayDelta*86400000 + TimezoneDelta*60000) / 604800000, day];
};

Date.prototype.addDays = function(offset) {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() + offset);
}

Date.prototype.toMonday = function () {
	var day = this.getISODay();
	var offset = (day > 5) ? 8-day : 1-day;
	return this.addDays(offset);
};

Date.prototype.toISOMonday = function () {
	return this.toMonday().getISOCalendarDate();
};

Date.prototype.nextWeek = function () {
	return this.addDays(7);
};

Date.prototype.previousWeek = function () {
	return this.addDays(-7);
};

function fromISOCalendarDate(year, month, date) {
	return new Date(year, month-1, date);
}

function fromISOWeekDate(year, week, day) {
	var jan4 = new Date(year, 0, 4);
	return new Date(year, 0, day + (week-1)*7 - jan4.getISODay() + 4);
}

function nextMonday() {
	return (new Date()).toMonday();
}

var ISOWeekDatePattern = /(\d{4})-W(\d{2})-(\d)/;
function parseISOWeekDate(s) {
	var match = ISOWeekPattern.exec(s);
	if (match) {
		return fromISOWeekDate(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
	}
}

var ISOWeekPattern = /(\d{4})-W(\d{2})/;
function parseISOWeek(s) {
	var match = ISOWeekPattern.exec(s);
	if (match) {
		return fromISOWeekDate(parseInt(match[1]), parseInt(match[2]), 1);
	}
}
