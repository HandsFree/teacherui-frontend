// @flow
import { div } from '../../../../core/html';

import { RootComponent } from '../../../../core/component';
import Prompt from './prompt';
import IFrame from './iframe';

class AuthoringTool extends RootComponent {
    updateHooks = {
        message: this.handleIDChange,
    };

    async init() {
        if (!this?.params?.id) {
            throw new Error('[Authoring Tool] No ID Provided!');
        }
    }

    handleIDChange(event) {
        if (event?.data?.event === 'glp_opened' && event?.data?.id && event.data.id !== this.params.id) {
            window.history.pushState('', 'Authoring Tool', `/authoring_tool?id=${event.data.id}`);
        }
    }

    async render() {
        const prompt = new Prompt();
        const iframe = new IFrame();

        return Promise.all([
            prompt.attach(this.params),
            iframe.attach(this.params),
        ]).then((values) => {
            const [
                promptEl,
                iframeEl,
            ] = values;

            return div(
                '.flex-column',
                promptEl,
                iframeEl,
            );
        });
    }
}

export default AuthoringTool;
