// @flow

import { section, h1, h2, p, div, a, ul, li, span, select, option } from '../../../../core/html';
import component, { Component } from '../../../../core/component';

// NOTE
// we could abstract cells to avoid the event list
// stuff and fetch events for each cell including prev
// and next month ones.

class CalendarEvent extends Component {
    async render() {
        const { eventName, eventDesc } = this.props;

        return div(".calendar-event",
            p(`${eventName}`),
            p(`${eventDesc}`),
        )
    }
}

class CalendarEventList extends Component {
    async render() {
        const { events } = this.props;
        return Promise.all(events).then((el) => {
            return div(".event-list", el);
        });
    }
}

// an individual cell in the calendar
class CalendarCell extends Component {
    async render() {
        const { dayNumber, cellDate, eventList } = this.props;

        let classList = ".calendar-cell";
        if (new Date().withoutTime().getTime() === cellDate.getTime()) {
            classList += " .current-day";
        }	

        return Promise.resolve(eventList).then((el) => {
            return div(classList, p(".calendar-day", dayNumber), el);
        });
    }
}

class CalendarNextMonthCell extends Component {
    async render() {
        const { dayNumber } = this.props;
        return div(".calendar-cell .next-month", p(".calendar-day", dayNumber));
    }
}

class CalendarPrevMonthCell extends Component {
    async render() {
        const { dayNumber } = this.props;
        return div(".calendar-cell .prev-month", p(".calendar-day", dayNumber));
    }
}

class CalendarHeadingCell extends Component {
    constructor(name) {
        super();
        this.name = name;
    }

    async render() {
        return div(".calendar-heading-cell", p(this.name));
    }
}

// the actual calendar
class CalendarView extends Component {    
    updateHooks = {
        PrevMonth: this.prevMonth,
        NextMonth: this.nextMonth,
        CurrMonth: this.currMonth,
    }
    
    // the date, specifically the month, this calendar
    // will bew a view of.
    constructor() {
        super();

        this.state = {
            currDate: new Date(),
            studentId: 0,
        }
    }

    async currMonth() {
        this.state.currDate = new Date();
    	this.updateView(await this.render());
    }

    async prevMonth() {
        const date = this.state.currDate;
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    	this.state.currDate = new Date(firstDay - 1);
    	console.log("prev ", this.state.currDate);
        this.updateView(await this.render());
    }

    async nextMonth() {
        const date = this.state.currDate;
		const lastDay = new Date(date.getFullYear(), date.getMonth(), date.daysInMonth()+1);
		console.log("last day ", lastDay);
    	this.state.currDate = new Date(lastDay + 1);
    	console.log("next ", this.state.currDate);
    	this.updateView(await this.render());
    }

    async render() {
        // calculate how many cells to create
        // for this particular month

        let calDate = this.state.currDate;
        const firstDay = calDate.firstDay();

        // rows of calendar cells in the calendar
        let rows = [];

        const calendarDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (const dayName of calendarDayNames) {
            console.log("day name set yo!");
            const cellProm = new CalendarHeadingCell(dayName).attach();
            rows.push(cellProm);
        }

        const offset = firstDay.getDay() - 1;
        const prevMonth = new Date(firstDay - 1);
        const prevMonthDays = prevMonth.daysInMonth();

        // this is a buffer that is cleared every 7
        // cells.
        let rowBuffer = [];

        // calculates how many cells to create for the
        // previous month offset.
        for (let i = 0; i < offset; i++) {
            const dayNum = (prevMonthDays - offset) + i + 1;
            const cell = new CalendarPrevMonthCell().attach({
                dayNumber: dayNum,
            });
            rowBuffer.push(cell);
        }

        // work out days in current month
        const numDays = calDate.daysInMonth();
        for (let i = offset; i < offset + numDays; i++) {
            const dayNumber = (i - offset) + 1;

            // flush buffer every 7 days.
            if ((i % 7 == 0 && i > 0)) {
                for (const cell of rowBuffer) {
                    rows.push(cell);
                }
                rowBuffer = [];
            }

            const cellDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), dayNumber).withoutTime();

            const studentId = 13;

            let events = [];
            events.push(new CalendarEvent().attach({
                eventName: "foo",
                eventDesc: "desc",
            }));
            events.push(new CalendarEvent().attach({
                eventName: "foo br baz",
                eventDesc: "desc",
            }));

            const eventList = new CalendarEventList().attach({
                events: events,
            });
            const cell = new CalendarCell().attach({
                dayNumber: dayNumber,
                cellDate: cellDate,
                eventList: eventList,
            });
            rowBuffer.push(cell);
        }

        if (rowBuffer.length > 0) {
            for (const row of rowBuffer) {
                rows.push(row);
            }

            const remain = 7 - rowBuffer.length;
            for (let i = 0; i < remain; i++) {
                const cell = new CalendarNextMonthCell().attach();
                rows.push(cell);
            }

            rowBuffer = [];
        }

        // work out padding of days for next months

        // ?
        return Promise.all(rows).then((elements) => {
            return div(".calendar", elements);
        });
    }
}

// date helper stuff

Date.prototype.firstDay = function() {
    var d = new Date(this);
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

Date.prototype.daysInMonth = function() {
    var d = new Date(this);
    return new Date(d.getYear(), d.getMonth()+1, 0).getDate();
}

Date.prototype.getDayName = function() {
    var d = new Date(this);
    const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return dayNames[d.getDay()];
}

Date.prototype.getMonthName = function() {
    var d = new Date(this);
    const monthNames = [
        "January", "February", "March", "April", "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    return monthNames[d.getMonth()];
}

Date.prototype.withoutTime = function () {
    var d = new Date(this);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default CalendarView;
