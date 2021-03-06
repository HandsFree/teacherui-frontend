// @flow
import { iframe } from '../../../../core/html';

import { Component } from '../../../../core/component';

class IFrame extends Component {
    async render() {
        return iframe(
            '#authoring-tool',
            {
                src: `https://authoring-qa.beaconing.eu/glp/${decodeURIComponent(this.props.id)}`,
                allow: 'geolocation; microphone; camera',
            },
        );
    }
}

export default IFrame;
