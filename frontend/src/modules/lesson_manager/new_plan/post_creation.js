// @flow
import {
    div,
    section,
    h1,
    p,
    button,
    a,
} from '../../../core/html';

import { Component } from '../../../core/component';

class PostCreation extends Component {
    async render() {
        const {
            title,
            id,
        } = this.props;

        return div(
            '.flex-column.flex-align-center.margin-top-50',
            section(
                '#post-create-title',
                h1(title),
            ),
            section(
                '#post-create-steps.flex-column.no-margin',
                p(`${await window.bcnI18n.getPhrase('pc_next')}:`),
                div(
                    '#post-create-buttons',
                    a(
                        {
                            onclick: () => {
                                this.emit('ResetForm');
                            },
                        },
                        button('.button-action', await window.bcnI18n.getPhrase('pc_create_another')),
                    ),
                    a(
                        {
                            href: `//${window.location.host}/lesson_manager/`,
                        },
                        button('.button-action', await window.bcnI18n.getPhrase('pc_go_library')),
                    ),
                    a(
                        {
                            href: `//${window.location.host}/lesson_manager/#view?id=${encodeURIComponent(id)}`,
                        },
                        button('.button-action', await window.bcnI18n.getPhrase('view_glp')),
                    ),
                    a(
                        {
                            href: `//${window.location.host}/authoring_tool/?id=${encodeURIComponent(id)}`,
                        },
                        button('.button-action', await window.bcnI18n.getPhrase('edit_glp')),
                    ),
                ),
            ),
        );
    }
}

export default PostCreation;