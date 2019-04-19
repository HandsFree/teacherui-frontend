// @flow
import { div, h4, span, strong, p, ul, li } from '../../../core/html';

import { Component } from '../../../core/component';

class GLPDetails extends Component {
    async init() {
        if (!this.props.id) {
            // console.log(this.props);
            throw new Error('[GLP Details] GLP ID not provided');
        }

        const sessionGLP = JSON.parse(window.sessionStorage.getItem(`glp_${this.props.id}`));
        this.state.glp = sessionGLP.glp;
    }

    async render() {
        const listify = (arr) => {
            const elArr = [];
            for (const v of arr) {
                elArr.push(li(v));
            }

            return elArr;
        };

        const learningObjectives = do {
            if (this.state.glp.learningObjectives) {
                ul(listify(this.state.glp.learningObjectives));
            } else {
                p('');
            }
        };

        const cac = await window.beaconingAPI.getPhrase('lm_cac');
        const ps = await window.beaconingAPI.getPhrase('lm_ps');
        const info = await window.beaconingAPI.getPhrase('lm_if');

        const competences = do {
            if (this.state.glp.competences) {
                const arr = this.state.glp.competences.map((value) => {
                    if (value === 'communicationAndCollaboration') {
                        return cac;
                    }

                    if (value === 'problemSolving') {
                        return ps;
                    }

                    if (value === 'informationFluency') {
                        return info;
                    }

                    return value;
                });
                ul(listify(arr));
            } else {
                p('');
            }
        };

        let dateCreatedText = await window.beaconingAPI.getPhrase('lm_not_rec');
        let timeCreatedText = '';
        let dateUpdatedText = await window.beaconingAPI.getPhrase('never');
        let timeUpdatedText = '';

        if (this.state.glp.createdAt && this.state.glp.createdAt !== '0001-01-01T00:00:00Z') {
            const dateObj = new Date(this.state.glp.createdAt);
            dateCreatedText = dateObj.toDateString();
            timeCreatedText = dateObj.toTimeString();
        }

        if (this.state.glp.updatedAt && this.state.glp.updatedAt !== '0001-01-01T00:00:00Z') {
            const dateObj = new Date(this.state.glp.updatedAt);
            dateUpdatedText = dateObj.toDateString();
            timeUpdatedText = dateObj.toTimeString();
        }

        return div(
            '#plan-details',
            div('.title', h4(`${await window.beaconingAPI.getPhrase('lm_glp_details')}:`)),
            div(
                '.small-details',
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_age')}: `),
                    span(this.state.glp.ageGroup),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_domain')}: `),
                    span(this.state.glp.domain),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_year')}: `),
                    span(this.state.glp.year),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_owner')}: `),
                    span(this.state.glp.owner),
                ),
            ),
            div(
                '.large-details',
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('description')}:`),
                    p(this.state.glp.description),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_topic')}:`),
                    p(this.state.glp.topic),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_los')}:`),
                    learningObjectives,
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_comps')}:`),
                    competences,
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_created')}:`),
                    p(
                        {
                            title: timeCreatedText,
                        },
                        dateCreatedText,
                    ),
                ),
                div(
                    '.detail',
                    strong(`${await window.beaconingAPI.getPhrase('lm_mod')}:`),
                    p(
                        {
                            title: timeUpdatedText,
                        },
                        dateUpdatedText,
                    ),
                ),
            ),
        );
    }
}

export default GLPDetails;