// @flow
import { div, a, i, h1, h2, span } from '../../../core/html';

import { Component } from '../../../core/component';

class AssignHeader extends Component {
    async init() {
        if (!this.props.id) {
            // console.log(this.props);
            throw new Error('[Assign Header] GLP ID not provided');
        }

        const sessionGLP = JSON.parse(window.sessionStorage.getItem(`glp_${this.props.id}`));
        this.state.glp = sessionGLP.glp;
    }

    async render() {
        return div(
            '#assign-header.flex-column',
            div(
                '.breadcrumb',
                a(
                    '.crumb',
                    {
                        href: `//${window.location.host}/lesson_manager`,
                    },
                    span(await window.beaconingAPI.getPhrase('lm_library')),
                ),
                a(
                    '.crumb',
                    {
                        href: `//${window.location.host}/lesson_manager#view?id=${this.state.glp.id}`,
                    },
                    span(await window.beaconingAPI.getPhrase('lm_plan_overview')),
                ),
                a('.current', await window.beaconingAPI.getPhrase('lm_assign')),
            ),
            div(
                '.flex-align-center.flex-spacebetween',
                h1(`${await window.beaconingAPI.getPhrase('lm_assigning')} '${this.state.glp.name}'`),
            ),
            div('.header-spacer'),
        );
    }
}

export default AssignHeader;
