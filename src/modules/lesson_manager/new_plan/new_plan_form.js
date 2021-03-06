// @flow
import {
    section,
    div,
    a,
    i,
    h1,
    form,
    input,
    label,
    span,
    textarea,
    select,
    option,
    strong,
    p,
} from '../../../core/html';

import Form from '../../form';
import Status from '../../status';
import PostCreation from './post_creation';

const translationKeys = [
    'description',
    'lm_author',
    'lm_create_plan',
    'err_glp_name_exists',
    'err_required_empty',
    'err_plan_year_not_valid',
    'err_form',
    'err_plan_nc',
    'plan_created',
    'creating',
    'none',
    'go_back',
    'lm_create_new_plan',
    'lm_plan_name',
    'name_for_lp_help',
    'lm_enter_plan_name',
    'lm_plan_desc',
    'lm_plan_desc_desc',
    'lm_enter_plan_desc',
    'lm_plan_cat',
    'lm_plan_cat_desc',
    'lm_science',
    'lm_tech',
    'lm_eng',
    'lm_maths',
    'lm_plan_domain',
    'lm_plan_domain_desc',
    'lm_enter_plan_domain',
    'lm_plan_ag',
    'lm_plan_ag_desc',
    'lm_enter_plan_ag',
    'lm_plan_year',
    'lm_plan_year_desc',
    'lm_enter_plan_year',
    'lm_plan_gp',
    'lm_plan_gp_desc',
    'lm_plan_los',
    'lm_plan_los_desc',
    'lm_enter_plan_los',
    'lm_plan_comps',
    'lm_plan_comps_desc',
    'lm_plan_topic',
    'lm_plan_topic_desc',
    'lm_enter_plan_topic',
    'lm_cac',
    'lm_ps',
    'lm_if',
    'lm_vis',
    'lm_plan_vis_desc',
    'lm_public',
    'lm_private',
    'cancel',
    'lm_create_plan'
];

class NewPlanForm extends Form {
    stateObj = {
        planName: '',
        planCategory: 'science',
        planDescription: '',
        planDomain: '',
        planTopic: '',
        planAgeGroup: '',
        planYear: '',
        planLearningObjectives: [''],
        planCompetences: {
            communicationAndCollaboration: false,
            problemSolving: false,
            informationFluency: false,
        },
        planPublic: false,
        planGameplot: 0,
        planExternConfig: null,
    };

    stateProxy = {
        set(obj, prop, value) {
            let trimmedValue = value;

            if (typeof value === 'string') {
                trimmedValue = value.trim();
            }

            if (Array.isArray(value)) {
                trimmedValue = value.map(v => v.trim())
                    .filter(v => v !== '');
            }

            // console.log(trimmedValue);

            return Reflect.set(obj, prop, trimmedValue);
        },
    };

    state = new Proxy(this.stateObj, this.stateProxy);

    updateHooks = {
        ResetForm: this.resetForm,
    };

    glps = [];

    gameplots: Map<number, Object> = new Map();

    async init() {
        console.log('initializing new_plan_form');
        this.state.trans = await window.beaconingAPI.getPhrases(...translationKeys);

        const glps = await window.beaconingAPI.getGLPs('owned', 'desc', true);
        const gameplots = await window.beaconingAPI.getGameplots();

        if (glps && gameplots) {
            this.glps = glps;
            this.processGameplots(gameplots);
        }

        console.log(gameplots);
    }

    processGameplots(gameplots: Object[]) {
        for (const obj of gameplots) {
            this.gameplots.set(obj.id, obj);
        }
    }

    async updateGameplot(gameplot: number) {
        const gameplotID = parseInt(gameplot, 10);
        const extraArea = document.getElementById('plan-gp-extra');

        if (gameplotID === 0) {
            extraArea.innerHTML = '';
            this.state.planExternConfig = null;
        }

        if (this.gameplots.has(gameplotID)) {
            const {
                description,
                author,
                externContent,
            } = this.gameplots.get(gameplotID);

            const el = div(
                '.flex-column',
                div(
                    '.flex-column',
                    strong(this.state.trans.get('description')),
                    p(description),
                ),
                div(
                    '.flex-column',
                    strong(this.state.trans.get('lm_author')),
                    p(author),
                ),
            );

            extraArea.innerHTML = '';
            extraArea.appendChild(el);

            this.state.planExternConfig = externContent;
        }
    }

    async resetForm() {
        this.state = {
            planName: '',
            planCategory: 'default',
            planDescription: '',
            planDomain: '',
            planTopic: '',
            planAgeGroup: '',
            planYear: '',
            planLearningObjectives: [],
            planCompetences: {
                communicationAndCollaboration: false,
                problemSolving: false,
                informationFluency: false,
            },
            planPublic: false,
            planGameplot: 0,
            planExternConfig: null,
        };

        this.removeErrors();

        this.updateView(await this.render());
    }

    async resetSubmit() {
        const planButton = document.getElementById('create-plan-button');
        planButton.textContent = this.state.trans.get('lm_create_plan');
    }

    async checkGLPName() {
        const errMsg = this.state.trans.get('err_glp_name_exists');

        if (this.state.planName === '') {
            this.removeAll('plan-name-status');

            return true;
        }

        for (const glp of this.glps) {
            if (glp.name.toLowerCase() === this.state.planName.toLowerCase()) {
                this.addError('plan-name-status', errMsg);
                this.resetSubmit();

                return false;
            }
        }

        this.addSuccess('plan-name-status');
        return true;
    }

    async checkFields() {
        let success = true;
        const emptyMsg = this.state.trans.get('err_required_empty');

        if (this.state.planName === '') {
            this.addError('plan-name-status', emptyMsg);
            success = false;
        }

        if (this.state.planName !== '' && !(await this.checkGLPName())) {
            success = false;
        }

        if (this.state.planDescription === '') {
            this.addError('plan-desc-status', emptyMsg);
            success = false;
        }

        if (this.state.planDomain === '') {
            this.addError('plan-domain-status', emptyMsg);
            success = false;
        }

        if (this.state.planTopic === '') {
            this.addError('plan-topic-status', emptyMsg);
            success = false;
        }

        if (this.state.planAgeGroup === '') {
            this.addError('plan-ag-status', emptyMsg);
            success = false;
        }

        if (this.state.planYear === '') {
            this.addError('plan-year-status', emptyMsg);
            success = false;
        }

        if (this.state.planYear !== '' && !(/^[0-9]{4}$/).test(this.state.planYear)) {
            const errMsg = this.state.trans.get('err_plan_year_not_valid');
            this.addError('plan-year-status', errMsg);
            success = false;
        }

        if (!success) {
            const statusMessage = new Status();
            const statusMessageEl = await statusMessage.attach({
                elementID: false,
                heading: 'Error',
                type: 'error',
                message: this.state.trans.get('err_form'),
            });

            this.appendView(statusMessageEl);

            this.resetSubmit();

            return false;
        }

        return true;
    }

    async createPlan() {
        if (await this.checkFields() === false) {
            return;
        }

        const comps = [];
        for (const [key, value] of Object.entries(this.state.planCompetences)) {
            if (value) {
                comps.push(key);
            }
        }

        const obj = {
            name: this.state.planName,
            category: this.state.planCategory,
            description: this.state.planDescription,
            domain: this.state.planDomain,
            topic: this.state.planTopic,
            ageGroup: this.state.planAgeGroup,
            year: parseInt(this.state.planYear, 10),
            learningObjectives: this.state.planLearningObjectives,
            competences: comps,
            public: this.state.planPublic,
            ...(this.state.planGameplot !== 0 ? {
                gamePlotId: this.state.planGameplot,
                externConfig: this.state.planExternConfig,
            } : {}),
        };

        const status = await window.beaconingAPI.addGLP(obj);
        const statusMessage = new Status();

        console.log('[Create GLP] status:', status ? 'success!' : 'failed!');

        // const status = false;

        if (status) {
            this.resetSubmit();
            this.afterCreation(status);

            return;
        }

        const statusMessageEl = await statusMessage.attach({
            elementID: false,
            heading: 'Error',
            type: 'error',
            message: this.state.trans.get('err_plan_nc'),
        });

        this.appendView(statusMessageEl);

        this.resetSubmit();
    }

    async afterCreation(glp: Object) {
        const pcEL = new PostCreation().attach({
            title: this.state.trans.get('plan_created'),
            id: glp.id,
        });

        this.updateView(await pcEL);
    }

    async render() {
        const creatingText = this.state.trans.get('creating');

        const gameplotOptions = [];
        const noneOption = option(this.state.trans.get('none'), { value: 0 });

        gameplotOptions.push(noneOption);

        for (const [id, obj] of this.gameplots) {
            const el = option(obj.name, { value: id });
            gameplotOptions.push(el);
        }

        return div(
            '.flex-column',
            section(
                '.flex-column',
                div(
                    '#section-header',
                    a(
                        '.back',
                        {
                            href: `//${window.location.host}/lesson_manager`,
                        },
                        i('.icon-angle-left'),
                        this.state.trans.get('go_back'),
                    ),
                    h1(this.state.trans.get('lm_create_new_plan')),
                    div('.empty-spacer', ' '),
                ),
            ),
            section(
                '.flex-column',
                div(
                    '.flex-column',
                    form(
                        '.create-new-plan',
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_name'))),
                                div('.desc-area', this.state.trans.get('name_for_lp_help')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required',
                                        input(
                                            '#plan-name.text-field',
                                            {
                                                type: 'text',
                                                placeholder: this.state.trans.get('lm_enter_plan_name'),
                                                oninput: (event) => {
                                                    const { target } = event;

                                                    this.state.planName = target.value;
                                                    this.addLoading('plan-name-status');
                                                    this.checkGLPName();
                                                },
                                                required: true,
                                            },
                                        ),
                                    ),
                                ),
                                div('#plan-name-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_desc'))),
                                div('.desc-area', this.state.trans.get('lm_plan_desc_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required.word-count',
                                        textarea(
                                            '#plan-description',
                                            {
                                                placeholder: this.state.trans.get('lm_enter_plan_desc'),
                                                oninput: (event) => {
                                                    const { target } = event;
                                                    const { value } = target;
                                                    const { length } = value.replace((/\n/g), '');
                                                    const countEl = document.querySelector('#plan-description ~ span');

                                                    this.state.planDescription = value;
                                                    countEl.textContent = length;
                                                },
                                                required: true,
                                            },
                                        ),
                                        span('.count', '0'),
                                    ),
                                ),
                                div('#plan-desc-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_cat'))),
                                div('.desc-area', this.state.trans.get('lm_plan_cat_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.select.required',
                                        select(
                                            '#plan-category',
                                            {
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    this.state.planCategory = target.value;
                                                },
                                                required: true,
                                            },
                                            option(this.state.trans.get('lm_science'), { value: 'science' }),
                                            option(this.state.trans.get('lm_tech'), { value: 'technology' }),
                                            option(this.state.trans.get('lm_eng'), { value: 'engineering' }),
                                            option(this.state.trans.get('lm_maths'), { value: 'maths' }),
                                        ),
                                    ),
                                ),
                                div('#plan-category-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_domain'))),
                                div('.desc-area', this.state.trans.get('lm_plan_domain_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required',
                                        input(
                                            '#plan-domain.text-field',
                                            {
                                                type: 'text',
                                                placeholder: this.state.trans.get('lm_enter_plan_domain'),
                                                oninput: (event) => {
                                                    const { target } = event;

                                                    this.state.planDomain = target.value;
                                                },
                                                required: true,
                                            },
                                        ),
                                    ),
                                ),
                                div('#plan-domain-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_topic'))),
                                div('.desc-area', this.state.trans.get('lm_plan_topic_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required',
                                        input(
                                            '#plan-topic.text-field',
                                            {
                                                type: 'text',
                                                placeholder: this.state.trans.get('lm_enter_plan_topic'),
                                                oninput: (event) => {
                                                    const { target } = event;

                                                    this.state.planTopic = target.value;
                                                },
                                                required: true,
                                            },
                                        ),
                                    ),
                                ),
                                div('#plan-topic-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_ag'))),
                                div('.desc-area', this.state.trans.get('lm_plan_ag_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required',
                                        input(
                                            '#plan-age-group.text-field',
                                            {
                                                type: 'text',
                                                placeholder: this.state.trans.get('lm_enter_plan_ag'),
                                                oninput: (event) => {
                                                    const { target } = event;

                                                    this.state.planAgeGroup = target.value;
                                                },
                                                required: true,
                                            },
                                        ),
                                    ),
                                ),
                                div('#plan-ag-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_year'))),
                                div('.desc-area', this.state.trans.get('lm_plan_year_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.required',
                                        input(
                                            '#plan-year.text-field',
                                            {
                                                type: 'text',
                                                placeholder: this.state.trans.get('lm_enter_plan_year'),
                                                pattern: '[0-9]{4}',
                                                oninput: (event) => {
                                                    const { target } = event;

                                                    this.state.planYear = target.value;
                                                },
                                                required: true,
                                            },
                                        ),
                                    ),
                                ),
                                div('#plan-year-status.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split.extra',
                                div('.title-area', span(this.state.trans.get('lm_plan_gp'))),
                                div('.desc-area', this.state.trans.get('lm_plan_gp_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.select',
                                        select(
                                            '#plan-category',
                                            {
                                                onchange: (event) => {
                                                    const { target } = event;
                                                    const gameplotID = parseInt(target.value, 10);

                                                    this.state.planGameplot = gameplotID;
                                                    this.updateGameplot(gameplotID);
                                                },
                                            },
                                            gameplotOptions,
                                        ),
                                    ),
                                ),
                                div('#plan-gp-extra.extra-area'),
                                div('#plan-gp-status.status-area'),
                            ),
                        ),
                        // TODO: change to more user friendly solution
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_los'))),
                                div('.desc-area', this.state.trans.get('lm_plan_los_desc')),
                                div(
                                    '.input-area',
                                    label(
                                        '.word-count',
                                        textarea(
                                            '#plan-learning-objectives',
                                            {
                                                placeholder: this.state.trans.get('lm_enter_plan_los'),
                                                oninput: (event) => {
                                                    const { target } = event;
                                                    const { value } = target;
                                                    const { length } = value.replace((/\n/g), '');
                                                    const countEl = document.querySelector('#plan-learning-objectives ~ span');
                                                    const values = value.split('\n');

                                                    this.state.planLearningObjectives = values;
                                                    countEl.textContent = length;
                                                },
                                            },
                                        ),
                                        span('.count', '0'),
                                    ),
                                ),
                                div('.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_plan_comps'))),
                                div('.desc-area', this.state.trans.get('lm_plan_comps_desc')),
                                div(
                                    '.input-area.flex-column',
                                    label(
                                        '.inline',
                                        input(
                                            '#plan-lo-cac',
                                            {
                                                type: 'checkbox',
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    if (target.checked) {
                                                        this.state.planCompetences.communicationAndCollaboration = true;

                                                        return;
                                                    }

                                                    this.state.planCompetences.communicationAndCollaboration = false;
                                                },
                                            },
                                        ),
                                        div('.check-box'),
                                        span(this.state.trans.get('lm_cac')),
                                    ),
                                    label(
                                        '.inline',
                                        input(
                                            '#plan-lo-ps',
                                            {
                                                type: 'checkbox',
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    if (target.checked) {
                                                        this.state.planCompetences.problemSolving = true;

                                                        return;
                                                    }

                                                    this.state.planCompetences.problemSolving = false;
                                                },
                                            },
                                        ),
                                        div('.check-box'),
                                        span(this.state.trans.get('lm_ps')),
                                    ),
                                    label(
                                        '.inline',
                                        input(
                                            '#plan-lo-if',
                                            {
                                                type: 'checkbox',
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    if (target.checked) {
                                                        this.state.planCompetences.informationFluency = true;

                                                        return;
                                                    }

                                                    this.state.planCompetences.informationFluency = false;
                                                },
                                            },
                                        ),
                                        div('.check-box'),
                                        span(this.state.trans.get('lm_if')),
                                    ),
                                ),
                                div('.status-area'),
                            ),
                        ),
                        div(
                            '.label-group',
                            div(
                                '.split',
                                div('.title-area', span(this.state.trans.get('lm_vis'))),
                                div('.desc-area', this.state.trans.get('lm_plan_vis_desc')),
                                div(
                                    '.input-area.flex-column',
                                    label(
                                        '.inline',
                                        input(
                                            '#plan-vis-public',
                                            {
                                                type: 'radio',
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    if (target.checked) {
                                                        const radioEl = document.getElementById('plan-vis-private');

                                                        radioEl.checked = false;

                                                        this.state.planPublic = true;
                                                    }
                                                },
                                            },
                                        ),
                                        div('.radio-box'),
                                        span(this.state.trans.get('lm_public')),
                                    ),
                                    label(
                                        '.inline',
                                        input(
                                            '#plan-vis-private',
                                            {
                                                type: 'radio',
                                                onchange: (event) => {
                                                    const { target } = event;

                                                    if (target.checked) {
                                                        const radioEl = document.getElementById('plan-vis-public');

                                                        radioEl.checked = false;

                                                        this.state.planPublic = false;
                                                    }
                                                },
                                                checked: true,
                                            },
                                        ),
                                        div('.radio-box'),
                                        span(this.state.trans.get('lm_private')),
                                    ),
                                ),
                                div('.status-area'),
                            ),
                        ),
                        div(
                            '.flex-justify-end.margin-top-10',
                            div(
                                '#create-plan-cancel.button-passive',
                                {
                                    onclick: () => {
                                        this.resetForm();
                                        window.location.href = `//${window.location.host}/lesson_manager`;
                                    },
                                },
                                this.state.trans.get('cancel'),
                            ),
                            div(
                                '#create-plan-button.button-submit',
                                {
                                    onclick: (event) => {
                                        const { target } = event;
                                        this.createPlan();

                                        target.textContent = `${creatingText}...`;
                                    },
                                },
                                this.state.trans.get('lm_create_plan'),
                            ),
                        ),
                    ),
                ),
            ),
        );
    }
}

export default NewPlanForm;
