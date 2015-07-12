'use strict';

Date.prototype.days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
Date.prototype.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

Number.prototype.pad = function() {
	return ("0" + this).slice(-2);
};

Date.prototype.format = function() {
	return this.days[this.getDay()] + ' ' + this.getDate() + ' ' + this.months[this.getMonth()] + ' ' + this.getFullYear();
};

Date.prototype.shortFormat = function() {
	return this.days[this.getDay()] + ' ' + this.getDate().pad() + '/' + (this.getMonth()+1).pad();
};

Date.prototype.weekFormat = function () {
	var iso = this.getIsoWeekDate();
	return '' + iso[0] + ' S' + iso[1];
};

Date.prototype.getIsoCalendarDate = function() {
	return [this.getFullYear(), this.getMonth()+1, this.getDate()];
};

Date.prototype.getIsoDay = function() {
	return 1 + (this.getDay() + 6) % 7;
};

Date.prototype.getIsoWeekDate = function () {
	var year = this.getFullYear();
	var day = this.getIsoDay();
	if (this.getMonth() == 11 && this.getDate() >= 28 + day)
		return [year+1, 1, day];		
	var jan4 = new Date(year, 0, 4);
	return [year, 1 + (this - jan4 + (jan4.getIsoDay() - day) * 86400000) / 604800000, day];
};

Date.prototype.toMonday = function () {
	var day = this.getIsoDay();
	var offset = (day > 5) ? 8-day : 1-day;
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() + offset);
};

Date.prototype.toIsoMonday = function () {
	return this.toMonday().getIsoCalendarDate();
};

Date.prototype.nextWeek = function () {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() + 7);
};

Date.prototype.previousWeek = function () {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() - 7);	
};

function fromIsoCalendarDate(year, month, date) {
	return new Date(year, month-1, date);
}

function fromIsoWeekDate(year, week, day) {
	var jan4 = new Date(year, 0, 4);
	return new Date(year, 0, day + (week-1)*7 - jan4.getIsoDay() + 4);
}
