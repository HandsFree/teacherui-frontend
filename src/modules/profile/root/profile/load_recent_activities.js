// @flow
import { div, span, a } from '../../../../core/html';

import { Component } from '../../../../core/component';
import { StudentActivityBox, GLPActivityBox, AssignedGLPActivityBox } from './recent_activity_box';

class LoadRecentActivities extends Component {
    updateHooks = {
        loadMoreActivities: this.loadMoreActivities,
    };

    state = {
        activityLimit: 5,
    };

    async loadMoreActivities() {
        this.state.activityLimit += 5;
        this.updateView(await this.render());
    }
    
    async init() {
        const recent = await window.beaconingAPI.getRecentActivities();
        console.log('the recently activities are ', recent);

        this.state.recentActivities = recent;
    }

    async render() {
        let values = Object.values(this.state.recentActivities);

        if (values.length < 1) {
            // Add some style
            return div(
                '.recent-events-container.flex-column',
                div(
                    '.status',
                    span(await window.beaconingAPI.getPhrase('widget_ra_no_act')),
                ),
            );
        }

        // how many events to show
        const maxEventsCount = this.state.activityLimit;
        let showLoader = maxEventsCount < values.length;
        values = values.slice(0, Math.min(values.length, maxEventsCount));

        const promArr = [];

        for (const activity of values) {
            const {
                type,
                createdAt,
                context,
            } = activity;

            // we split since it's
            // always student_deleted, glp_created, etc.
            const target = type.split("_")[0];

            let recentActivityBox = null;
            switch (target) {
                case 'student':
                    recentActivityBox = new StudentActivityBox();
                    break;
                case 'glp':
                    recentActivityBox = new GLPActivityBox();
                    break;
                case 'assignedglp':
                    recentActivityBox = new AssignedGLPActivityBox();
                    break;
            }

            if (recentActivityBox) {
                const raBoxProm = recentActivityBox.attach({
                    type,
                    createdAt,
                    context,
                });
                promArr.push(raBoxProm);
            }
        }

        return Promise.all(promArr).then(elements => {
            return div(
                '.recent-events-container.flex-column', 
                elements,
                showLoader ? a(
                    '.fake-link',
                    'Load more',
                    {
                        onclick: () => {
                            this.emit('loadMoreActivities');
                        }
                    }
                ) : [],
            )
        });
    }
}

export default LoadRecentActivities;
