// @flow
import { nav, div, h3 } from '../../../core/html';

import { Component } from '../../../core/component';

class SecondNav extends Component {
    async render() {
        const {
            title,
            innerNav,
        } = this.props;

        const innerNavEL = await innerNav;

        return nav(
            '#subnav',
            div(
                '#nav-header',
                h3(title),
            ),
            innerNavEL,
        );
    }
}

export default SecondNav;
