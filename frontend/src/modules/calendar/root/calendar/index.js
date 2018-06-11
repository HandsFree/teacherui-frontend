// @flow
import { div, main } from '../../../../core/html';

import { RootComponent } from '../../../../core/component';
import Header from '../../../header/root';
import MainNav from '../../../nav/main';
import CalendarView from './calendar_view';
import CalendarController from './calendar_controller';

class Calendar extends RootComponent {
    state = {
        id: 0,
    };

    async init() {
        if (this.params.id) {
            this.state.id = this.params.id;
        }
    }

    async render() {
        const header = new Header();
        const mainNav = new MainNav();

        const calendarController = new CalendarController(this.state.id);
        const calendarView = new CalendarView();

        console.log("calendar index");

        return Promise.all([
            header.attach(),
            mainNav.attach(),
            calendarController.attach(),
            calendarView.attach(),
        ]).then((values) => {
            const [
                headerEl,
                mainNavEl,
                calendarController,
                calendarView,
            ] = values;

            return div(
                '#app',
                headerEl,
                div(
                    '.flex-container.expand.margin-top-2',
                    mainNavEl,
                    main(
                        calendarController,
                        calendarView
                    ),
                ),
            );
        });
    }
}

export default Calendar;
